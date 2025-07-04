import { z } from "zod";

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
