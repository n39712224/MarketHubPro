import { z } from "zod";
import { pgTable, text, integer, boolean, timestamp, jsonb, varchar, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Listing schema
export const listingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
  visibility: z.enum(['public', 'private', 'shared']),
  images: z.array(z.string()),
  status: z.enum(['active', 'sold', 'archived']).default('active'),
  views: z.number().default(0),
  shippingOffered: z.boolean().default(false),
  localPickup: z.boolean().default(false),
  shareLink: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertListingSchema = listingSchema.omit({ 
  id: true, 
  views: true, 
  shareLink: true, 
  createdAt: true, 
  updatedAt: true 
});

export type Listing = z.infer<typeof listingSchema>;
export type InsertListing = z.infer<typeof insertListingSchema>;

// Activity schema
export const activitySchema = z.object({
  id: z.string(),
  type: z.enum(['sale', 'view', 'listing_added', 'listing_shared', 'listing_edited']),
  description: z.string(),
  listingId: z.string().optional(),
  amount: z.number().optional(),
  timestamp: z.date(),
});

export const insertActivitySchema = activitySchema.omit({ 
  id: true, 
  timestamp: true 
});

export type Activity = z.infer<typeof activitySchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// User stats schema (for dashboard)
export const userStatsSchema = z.object({
  totalEarnings: z.number(),
  activeListings: z.number(),
  itemsSold: z.number(),
  totalViews: z.number(),
  monthlyRevenue: z.number(),
  conversionRate: z.number(),
  avgSalePrice: z.number(),
});

export type UserStats = z.infer<typeof userStatsSchema>;

// Payment intent schema
export const paymentIntentSchema = z.object({
  amount: z.number(),
  listingId: z.string(),
});

export type PaymentIntent = z.infer<typeof paymentIntentSchema>;

// User profile and contact preferences
export const userProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  contactPreferences: z.object({
    showEmail: z.boolean().default(true),
    showPhone: z.boolean().default(false),
    showPartialEmail: z.boolean().default(false), // shows user@*** instead of full email
    showPartialPhone: z.boolean().default(false), // shows ***-***-1234 instead of full phone
    allowMessages: z.boolean().default(true),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// Messages between users
export const messageSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  content: z.string(),
  isRead: z.boolean().default(false),
  createdAt: z.date(),
});

export const insertMessageSchema = messageSchema.omit({ 
  id: true,
  createdAt: true,
});

export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Conversation (grouped messages)
export const conversationSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  lastMessageAt: z.date(),
  isArchivedBySeller: z.boolean().default(false),
  isArchivedByBuyer: z.boolean().default(false),
});

export type Conversation = z.infer<typeof conversationSchema>;

// Drizzle Database Tables
export const users = pgTable("users", {
  id: varchar("id", { length: 256 }).primaryKey(),
  username: varchar("username", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  contactPreferences: jsonb("contact_preferences").$type<{
    showEmail: boolean;
    showPhone: boolean;
    showPartialEmail: boolean;
    showPartialPhone: boolean;
    allowMessages: boolean;
  }>().notNull().default({
    showEmail: true,
    showPhone: false,
    showPartialEmail: false,
    showPartialPhone: false,
    allowMessages: true,
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const listings = pgTable("listings", {
  id: varchar("id", { length: 256 }).primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  condition: varchar("condition", { length: 20 }).notNull(),
  visibility: varchar("visibility", { length: 20 }).notNull().default("public"),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  views: integer("views").notNull().default(0),
  shippingOffered: boolean("shipping_offered").notNull().default(false),
  localPickup: boolean("local_pickup").notNull().default(false),
  shareLink: varchar("share_link", { length: 50 }),
  userId: varchar("user_id", { length: 256 }).notNull(),
  // SEO fields
  seoTitle: varchar("seo_title", { length: 160 }),
  seoDescription: varchar("seo_description", { length: 300 }),
  seoKeywords: jsonb("seo_keywords").$type<string[]>().default([]),
  searchTags: jsonb("search_tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: varchar("id", { length: 256 }).primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  listingId: varchar("listing_id", { length: 256 }),
  amount: integer("amount"),
  userId: varchar("user_id", { length: 256 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id", { length: 256 }).primaryKey(),
  listingId: varchar("listing_id", { length: 256 }).notNull(),
  senderId: varchar("sender_id", { length: 256 }).notNull(),
  receiverId: varchar("receiver_id", { length: 256 }).notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id", { length: 256 }).primaryKey(),
  listingId: varchar("listing_id", { length: 256 }).notNull(),
  buyerId: varchar("buyer_id", { length: 256 }).notNull(),
  sellerId: varchar("seller_id", { length: 256 }).notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  isArchivedBySeller: boolean("is_archived_by_seller").notNull().default(false),
  isArchivedByBuyer: boolean("is_archived_by_buyer").notNull().default(false),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  activities: many(activities),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id],
  }),
  activities: many(activities),
  messages: many(messages),
  conversations: many(conversations),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [activities.listingId],
    references: [listings.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    relationName: "sender",
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    relationName: "receiver",
    fields: [messages.receiverId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [messages.listingId],
    references: [listings.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  listing: one(listings, {
    fields: [conversations.listingId],
    references: [listings.id],
  }),
  buyer: one(users, {
    relationName: "buyer",
    fields: [conversations.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    relationName: "seller", 
    fields: [conversations.sellerId],
    references: [users.id],
  }),
}));

// Updated types using Drizzle
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type DbListing = typeof listings.$inferSelect;
export type InsertDbListing = typeof listings.$inferInsert;
export type DbActivity = typeof activities.$inferSelect;
export type InsertDbActivity = typeof activities.$inferInsert;
export type DbMessage = typeof messages.$inferSelect;
export type InsertDbMessage = typeof messages.$inferInsert;
export type DbConversation = typeof conversations.$inferSelect;
export type InsertDbConversation = typeof conversations.$inferInsert;
