import { Listing, InsertListing, Activity, InsertActivity, UserStats, UserProfile, Message, InsertMessage, Conversation, User, UpsertUser, InsertUser, DbListing, InsertDbListing, users, listings, activities, messages, conversations } from "@shared/schema";
import { nanoid } from "nanoid";
import { db } from "./db";
import { eq, and, or, desc, asc, ilike, sql, count } from "drizzle-orm";

interface IStorage {
  // User authentication operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, roleUpdates: { isSeller: boolean; isBuyer: boolean; joinedAsSellerAt: Date | null; joinedAsBuyerAt: Date | null }): Promise<User>;
  
  // Listings
  getListings(): Promise<Listing[]>;
  getListingById(id: string): Promise<Listing | null>;
  getListingsByStatus(status: 'active' | 'sold' | 'archived'): Promise<Listing[]>;
  getListingsByVisibility(visibility: 'public' | 'private' | 'shared'): Promise<Listing[]>;
  searchListings(query: string, category?: string, visibility?: string): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: string, updates: Partial<InsertListing>): Promise<Listing | null>;
  deleteListing(id: string): Promise<boolean>;
  incrementViews(id: string): Promise<void>;
  
  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Stats
  getUserStats(): Promise<UserStats>;
  
  // Share links
  generateShareLink(listingId: string): Promise<string>;
  getListingByShareLink(shareLink: string): Promise<Listing | null>;
  
  // User profiles and contact preferences
  getUserProfile(userId: string): Promise<UserProfile | null>;
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null>;
  updateContactPreferences(userId: string, preferences: UserProfile['contactPreferences']): Promise<UserProfile | null>;
  
  // Messages and conversations
  getConversations(userId: string): Promise<(Conversation & { listing: Listing, otherUser: UserProfile, lastMessage: Message })[]>;
  getConversation(conversationId: string): Promise<Conversation | null>;
  getMessages(conversationId: string): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  createOrGetConversation(listingId: string, buyerId: string, sellerId: string): Promise<Conversation>;
}

class MemStorage implements IStorage {
  // User authentication operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    // Mock implementation for in-memory storage
    const profile = this.userProfiles.find(p => p.id === id);
    if (!profile) return undefined;
    
    return {
      id: profile.id,
      email: profile.email,
      firstName: profile.username.split(' ')[0] || null,
      lastName: profile.username.split(' ')[1] || null,
      profileImageUrl: null,
      phone: profile.phone || null,
      contactPreferences: profile.contactPreferences,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Mock implementation for in-memory storage
    const existingIndex = this.userProfiles.findIndex(p => p.id === userData.id);
    const displayName = userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}`
      : userData.email || userData.id;
    
    const userProfile: UserProfile = {
      id: userData.id,
      username: displayName,
      email: userData.email || '',
      phone: userData.phone || '',
      contactPreferences: userData.contactPreferences || {
        showEmail: true,
        showPhone: false,
        showPartialEmail: false,
        showPartialPhone: false,
        allowMessages: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    if (existingIndex >= 0) {
      this.userProfiles[existingIndex] = { ...this.userProfiles[existingIndex], ...userProfile };
    } else {
      this.userProfiles.push(userProfile);
    }
    
    return {
      id: userData.id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      phone: userData.phone || null,
      isSeller: true,
      isBuyer: true,
      sellerBio: null,
      sellerRating: 0,
      totalSales: 0,
      joinedAsSellerAt: null,
      buyerRating: 0,
      totalPurchases: 0,
      joinedAsBuyerAt: null,
      contactPreferences: userProfile.contactPreferences,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
    };
  }

  async updateUserRole(id: string, roleUpdates: { isSeller: boolean; isBuyer: boolean; joinedAsSellerAt: Date | null; joinedAsBuyerAt: Date | null }): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = {
      ...user,
      ...roleUpdates,
      updatedAt: new Date(),
    };
    
    // Update in userProfiles as well
    const profileIndex = this.userProfiles.findIndex(p => p.id === id);
    if (profileIndex >= 0) {
      this.userProfiles[profileIndex].updatedAt = new Date();
    }
    
    return updatedUser;
  }

  private userProfiles: UserProfile[] = [
    {
      id: "user1", 
      username: "alex.tester",
      email: "alex.tester@markethub.com",
      phone: "+1-555-0123",
      contactPreferences: {
        showEmail: true,
        showPhone: false,
        showPartialEmail: false,
        showPartialPhone: true,
        allowMessages: true,
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
    }
  ];

  private messages: Message[] = [];
  private conversations: Conversation[] = [];

  private listings: Listing[] = [
    {
      id: "1",
      title: "MacBook Pro 14-inch M3 Pro",
      description: "Excellent condition MacBook Pro with M3 Pro chip, 18GB RAM, 512GB SSD. Perfect for developers and creatives. Includes original charger and box.",
      price: 1899,
      category: "electronics",
      condition: "like-new",
      visibility: "public",
      images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500"],
      status: "active",
      views: 42,
      shippingOffered: true,
      localPickup: true,
      invitedEmails: [],
      allowFacebookConnections: false,
      deliveryMethod: 'shipping',
      deliveryStatus: 'pending',
      createdAt: new Date("2024-07-01"),
      updatedAt: new Date("2024-07-01"),
    },
    {
      id: "2", 
      title: "Vintage Leather Jacket",
      description: "Classic brown leather jacket from the 90s. Genuine leather, size M. Minor wear that adds character. Perfect for vintage fashion enthusiasts.",
      price: 120,
      category: "clothing",
      condition: "good",
      visibility: "public",
      images: ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500"],
      status: "active",
      views: 18,
      shippingOffered: true,
      localPickup: false,
      invitedEmails: [],
      allowFacebookConnections: false,
      deliveryMethod: 'shipping',
      deliveryStatus: 'pending',
      createdAt: new Date("2024-07-02"),
      updatedAt: new Date("2024-07-02"),
    },
    {
      id: "3",
      title: "Gaming Setup - Monitor & Accessories",
      description: "Complete gaming setup including 27-inch 144Hz monitor, mechanical keyboard, gaming mouse, and RGB mousepad. Perfect for competitive gaming.",
      price: 650,
      category: "electronics", 
      condition: "good",
      visibility: "public",
      images: ["https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=500"],
      status: "sold",
      views: 89,
      shippingOffered: false,
      localPickup: true,
      invitedEmails: [],
      allowFacebookConnections: false,
      deliveryMethod: 'pickup',
      deliveryStatus: 'delivered',
      createdAt: new Date("2024-06-28"),
      updatedAt: new Date("2024-07-03"),
    },
    {
      id: "4",
      title: "Handmade Ceramic Vase Collection",
      description: "Beautiful set of 3 handmade ceramic vases in earth tones. Perfect for home decoration or as a gift. Each piece is unique and crafted with care.",
      price: 85,
      category: "home",
      condition: "new",
      visibility: "shared",
      images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500"],
      status: "active",
      views: 12,
      shippingOffered: true,
      localPickup: true,
      shareLink: "abc123",
      invitedEmails: [],
      allowFacebookConnections: false,
      deliveryMethod: 'shipping',
      deliveryStatus: 'pending',
      createdAt: new Date("2024-07-03"),
      updatedAt: new Date("2024-07-03"),
    },
    {
      id: "5",
      title: "Professional Camera Lens - Canon 85mm f/1.8",
      description: "Canon EF 85mm f/1.8 USM lens in excellent condition. Perfect for portraits and professional photography. Includes lens caps and UV filter.",
      price: 320,
      category: "electronics",
      condition: "like-new",
      visibility: "private",
      images: ["https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500"],
      status: "active",
      views: 5,
      shippingOffered: true,
      localPickup: false,
      invitedEmails: ["photographer@example.com", "studio@example.com"],
      allowFacebookConnections: true,
      deliveryMethod: 'shipping',
      deliveryStatus: 'pending',
      createdAt: new Date("2024-07-04"),
      updatedAt: new Date("2024-07-04"),
    }
  ];
  private activities: Activity[] = [
    {
      id: "act1",
      type: "sale",
      description: "Gaming Setup - Monitor & Accessories sold for $650",
      listingId: "3",
      amount: 650,
      timestamp: new Date("2024-07-03T10:30:00"),
    },
    {
      id: "act2", 
      type: "listing_added",
      description: "New listing added: Professional Camera Lens - Canon 85mm f/1.8",
      listingId: "5",
      timestamp: new Date("2024-07-04T09:15:00"),
    },
    {
      id: "act3",
      type: "listing_shared",
      description: "Listing shared via link",
      listingId: "4", 
      timestamp: new Date("2024-07-03T16:45:00"),
    },
    {
      id: "act4",
      type: "view",
      description: "MacBook Pro 14-inch M3 Pro viewed",
      listingId: "1",
      timestamp: new Date("2024-07-04T08:20:00"),
    }
  ];

  async getListings(): Promise<Listing[]> {
    return [...this.listings];
  }

  async getListingById(id: string): Promise<Listing | null> {
    return this.listings.find(listing => listing.id === id) || null;
  }

  async getListingsByStatus(status: 'active' | 'sold' | 'archived'): Promise<Listing[]> {
    return this.listings.filter(listing => listing.status === status);
  }

  async getListingsByVisibility(visibility: 'public' | 'private' | 'shared'): Promise<Listing[]> {
    return this.listings.filter(listing => listing.visibility === visibility);
  }

  async searchListings(query: string, category?: string, visibility?: string): Promise<Listing[]> {
    return this.listings.filter(listing => {
      const matchesQuery = !query || 
        listing.title.toLowerCase().includes(query.toLowerCase()) ||
        listing.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = !category || listing.category === category;
      const matchesVisibility = !visibility || listing.visibility === visibility;
      
      return matchesQuery && matchesCategory && matchesVisibility;
    });
  }

  async createListing(listing: InsertListing): Promise<Listing> {
    const now = new Date();
    const newListing: Listing = {
      ...listing,
      id: nanoid(),
      views: 0,
      createdAt: now,
      updatedAt: now,
    };
    
    this.listings.unshift(newListing);
    
    // Create activity
    await this.createActivity({
      type: 'listing_added',
      description: `New listing added: ${listing.title}`,
      listingId: newListing.id,
    });
    
    return newListing;
  }

  async updateListing(id: string, updates: Partial<InsertListing>): Promise<Listing | null> {
    const index = this.listings.findIndex(listing => listing.id === id);
    if (index === -1) return null;
    
    this.listings[index] = {
      ...this.listings[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return this.listings[index];
  }

  async deleteListing(id: string): Promise<boolean> {
    const index = this.listings.findIndex(listing => listing.id === id);
    if (index === -1) return false;
    
    this.listings.splice(index, 1);
    return true;
  }

  async incrementViews(id: string): Promise<void> {
    const index = this.listings.findIndex(listing => listing.id === id);
    if (index !== -1) {
      this.listings[index].views += 1;
      this.listings[index].updatedAt = new Date();
    }
  }

  async getActivities(limit = 10): Promise<Activity[]> {
    return this.activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const newActivity: Activity = {
      ...activity,
      id: nanoid(),
      timestamp: new Date(),
    };
    
    this.activities.unshift(newActivity);
    return newActivity;
  }

  async getUserStats(): Promise<UserStats> {
    const soldListings = this.listings.filter(l => l.status === 'sold');
    const totalEarnings = soldListings.reduce((sum, l) => sum + l.price, 0);
    const activeListings = this.listings.filter(l => l.status === 'active').length;
    const totalViews = this.listings.reduce((sum, l) => sum + l.views, 0);
    
    // Calculate monthly stats (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthlySales = soldListings.filter(l => l.updatedAt > thirtyDaysAgo);
    const monthlyRevenue = monthlySales.reduce((sum, l) => sum + l.price, 0);
    
    const avgSalePrice = soldListings.length > 0 ? totalEarnings / soldListings.length : 0;
    const conversionRate = this.listings.length > 0 ? (soldListings.length / this.listings.length) * 100 : 0;
    
    return {
      totalEarnings,
      activeListings,
      itemsSold: soldListings.length,
      totalViews,
      monthlyRevenue,
      conversionRate: Math.round(conversionRate),
      avgSalePrice: Math.round(avgSalePrice),
    };
  }

  async generateShareLink(listingId: string): Promise<string> {
    const shareLink = nanoid(10);
    await this.updateListing(listingId, { shareLink } as any);
    
    await this.createActivity({
      type: 'listing_shared',
      description: 'Listing shared via link',
      listingId,
    });
    
    return shareLink;
  }

  async getListingByShareLink(shareLink: string): Promise<Listing | null> {
    return this.listings.find(listing => listing.shareLink === shareLink) || null;
  }

  // User profile methods
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.userProfiles.find(profile => profile.id === userId) || null;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const index = this.userProfiles.findIndex(profile => profile.id === userId);
    if (index === -1) return null;

    this.userProfiles[index] = {
      ...this.userProfiles[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.userProfiles[index];
  }

  async updateContactPreferences(userId: string, preferences: UserProfile['contactPreferences']): Promise<UserProfile | null> {
    return this.updateUserProfile(userId, { contactPreferences: preferences });
  }

  // Messaging methods
  async getConversations(userId: string): Promise<(Conversation & { listing: Listing, otherUser: UserProfile, lastMessage: Message })[]> {
    const userConversations = this.conversations.filter(
      conv => conv.buyerId === userId || conv.sellerId === userId
    );

    const enrichedConversations = [];
    for (const conv of userConversations) {
      const listing = await this.getListingById(conv.listingId);
      const otherUserId = conv.buyerId === userId ? conv.sellerId : conv.buyerId;
      const otherUser = await this.getUserProfile(otherUserId);
      const messages = this.messages.filter(msg => 
        (msg.senderId === conv.buyerId && msg.receiverId === conv.sellerId) ||
        (msg.senderId === conv.sellerId && msg.receiverId === conv.buyerId)
      ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      if (listing && otherUser && messages.length > 0) {
        enrichedConversations.push({
          ...conv,
          listing,
          otherUser,
          lastMessage: messages[0],
        });
      }
    }

    return enrichedConversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversations.find(conv => conv.id === conversationId) || null;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) return [];

    return this.messages.filter(msg => 
      (msg.senderId === conversation.buyerId && msg.receiverId === conversation.sellerId) ||
      (msg.senderId === conversation.sellerId && msg.receiverId === conversation.buyerId)
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const newMessage: Message = {
      id: nanoid(),
      ...message,
      createdAt: new Date(),
    };

    this.messages.push(newMessage);

    // Update or create conversation
    const conversation = await this.createOrGetConversation(message.listingId, message.senderId, message.receiverId);
    conversation.lastMessageAt = newMessage.createdAt;

    return newMessage;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) return;

    this.messages.forEach(msg => {
      if (
        msg.receiverId === userId &&
        ((msg.senderId === conversation.buyerId && msg.receiverId === conversation.sellerId) ||
         (msg.senderId === conversation.sellerId && msg.receiverId === conversation.buyerId))
      ) {
        msg.isRead = true;
      }
    });
  }

  async createOrGetConversation(listingId: string, buyerId: string, sellerId: string): Promise<Conversation> {
    // Ensure buyerId and sellerId are in correct order
    const [actualBuyerId, actualSellerId] = buyerId === sellerId ? [buyerId, sellerId] : 
      buyerId < sellerId ? [buyerId, sellerId] : [sellerId, buyerId];

    let conversation = this.conversations.find(conv => 
      conv.listingId === listingId && 
      conv.buyerId === actualBuyerId && 
      conv.sellerId === actualSellerId
    );

    if (!conversation) {
      conversation = {
        id: nanoid(),
        listingId,
        buyerId: actualBuyerId,
        sellerId: actualSellerId,
        lastMessageAt: new Date(),
        isArchivedBySeller: false,
        isArchivedByBuyer: false,
      };
      this.conversations.push(conversation);
    }

    return conversation;
  }
}

class DatabaseStorage implements IStorage {
  // User authentication operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, roleUpdates: { isSeller: boolean; isBuyer: boolean; joinedAsSellerAt: Date | null; joinedAsBuyerAt: Date | null }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...roleUpdates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  private convertDbToListing(dbListing: DbListing): Listing {
    return {
      id: dbListing.id,
      title: dbListing.title,
      description: dbListing.description,
      price: dbListing.price,
      category: dbListing.category,
      condition: dbListing.condition as any,
      visibility: dbListing.visibility as any,
      images: dbListing.images as string[],
      status: dbListing.status as any,
      views: dbListing.views,
      shippingOffered: dbListing.shippingOffered,
      localPickup: dbListing.localPickup,
      shareLink: dbListing.shareLink || undefined,
      invitedEmails: (dbListing.invitedEmails as string[]) || [],
      allowFacebookConnections: dbListing.allowFacebookConnections,
      deliveryMethod: (dbListing.deliveryMethod as any) || 'pickup',
      deliveryStatus: (dbListing.deliveryStatus as any) || 'pending',
      trackingNumber: dbListing.trackingNumber || undefined,
      deliveryAddress: dbListing.deliveryAddress || undefined,
      deliveryNotes: dbListing.deliveryNotes || undefined,
      createdAt: dbListing.createdAt,
      updatedAt: dbListing.updatedAt,
    };
  }

  async getListings(): Promise<Listing[]> {
    const dbListings = await db.select().from(listings).orderBy(desc(listings.createdAt));
    return dbListings.map(this.convertDbToListing);
  }

  async getListingById(id: string): Promise<Listing | null> {
    const dbListing = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    return dbListing[0] ? this.convertDbToListing(dbListing[0]) : null;
  }

  async getListingsByStatus(status: 'active' | 'sold' | 'archived'): Promise<Listing[]> {
    const dbListings = await db.select().from(listings).where(eq(listings.status, status));
    return dbListings.map(this.convertDbToListing);
  }

  async getListingsByVisibility(visibility: 'public' | 'private' | 'shared'): Promise<Listing[]> {
    const dbListings = await db.select().from(listings).where(eq(listings.visibility, visibility));
    return dbListings.map(this.convertDbToListing);
  }

  async searchListings(query: string, category?: string, visibility?: string): Promise<Listing[]> {
    let whereConditions = [];
    
    if (query) {
      whereConditions.push(
        or(
          ilike(listings.title, `%${query}%`),
          ilike(listings.description, `%${query}%`),
          sql`${listings.seoKeywords}::text ILIKE ${'%' + query + '%'}`,
          sql`${listings.searchTags}::text ILIKE ${'%' + query + '%'}`
        )
      );
    }
    
    if (category) {
      whereConditions.push(eq(listings.category, category));
    }
    
    if (visibility) {
      whereConditions.push(eq(listings.visibility, visibility));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    const dbListings = await db.select().from(listings).where(whereClause).orderBy(desc(listings.views), desc(listings.createdAt));
    return dbListings.map(this.convertDbToListing);
  }

  async createListing(listing: InsertListing): Promise<Listing> {
    const id = nanoid();
    const now = new Date();
    
    const insertData: InsertDbListing = {
      id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      condition: listing.condition,
      visibility: listing.visibility,
      images: Array.isArray(listing.images) ? listing.images : [],
      status: listing.status || 'active',
      views: 0,
      shippingOffered: listing.shippingOffered,
      localPickup: listing.localPickup,
      invitedEmails: Array.isArray(listing.invitedEmails) ? listing.invitedEmails : [],
      allowFacebookConnections: listing.allowFacebookConnections || false,
      deliveryMethod: listing.deliveryMethod || 'pickup',
      deliveryStatus: listing.deliveryStatus || 'pending',
      trackingNumber: listing.trackingNumber,
      deliveryAddress: listing.deliveryAddress,
      deliveryNotes: listing.deliveryNotes,
      userId: 'user1', // Default user for now
      seoTitle: listing.title.substring(0, 160),
      seoDescription: listing.description.substring(0, 300),
      seoKeywords: this.extractKeywords(listing.title + ' ' + listing.description),
      searchTags: [listing.category, listing.condition, ...listing.title.toLowerCase().split(' ')].filter(Boolean),
      createdAt: now,
      updatedAt: now,
    };

    const [newListing] = await db.insert(listings).values(insertData).returning();
    return this.convertDbToListing(newListing);
  }

  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 10); // Limit to 10 keywords
  }

  async updateListing(id: string, updates: Partial<InsertListing>): Promise<Listing | null> {
    const updateData: Partial<InsertDbListing> = {
      ...updates,
      updatedAt: new Date(),
    };

    if (updates.title || updates.description) {
      const text = (updates.title || '') + ' ' + (updates.description || '');
      updateData.seoKeywords = this.extractKeywords(text);
      updateData.searchTags = [
        ...(updates.category ? [updates.category] : []),
        ...(updates.condition ? [updates.condition] : []),
        ...(updates.title ? updates.title.toLowerCase().split(' ') : [])
      ];
    }

    const [updatedListing] = await db
      .update(listings)
      .set(updateData)
      .where(eq(listings.id, id))
      .returning();

    return updatedListing ? this.convertDbToListing(updatedListing) : null;
  }

  async deleteListing(id: string): Promise<boolean> {
    const result = await db.delete(listings).where(eq(listings.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async incrementViews(id: string): Promise<void> {
    await db
      .update(listings)
      .set({ 
        views: sql`${listings.views} + 1`,
        updatedAt: new Date()
      })
      .where(eq(listings.id, id));
  }

  async getActivities(limit = 10): Promise<Activity[]> {
    const dbActivities = await db
      .select()
      .from(activities)
      .orderBy(desc(activities.timestamp))
      .limit(limit);

    return dbActivities.map(activity => ({
      id: activity.id,
      type: activity.type as any,
      description: activity.description,
      listingId: activity.listingId || undefined,
      amount: activity.amount || undefined,
      timestamp: activity.timestamp,
    }));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = nanoid();
    const insertData = {
      id,
      ...activity,
      userId: 'user1', // Default user
      timestamp: new Date(),
    };

    const [newActivity] = await db.insert(activities).values(insertData).returning();
    return {
      id: newActivity.id,
      type: newActivity.type as any,
      description: newActivity.description,
      listingId: newActivity.listingId || undefined,
      amount: newActivity.amount || undefined,
      timestamp: newActivity.timestamp,
    };
  }

  async getUserStats(): Promise<UserStats> {
    const [stats] = await db.select({
      activeListings: count(sql`CASE WHEN ${listings.status} = 'active' THEN 1 END`),
      itemsSold: count(sql`CASE WHEN ${listings.status} = 'sold' THEN 1 END`),
      totalViews: sql<number>`COALESCE(SUM(${listings.views}), 0)`,
      totalEarnings: sql<number>`COALESCE(SUM(CASE WHEN ${listings.status} = 'sold' THEN ${listings.price} ELSE 0 END), 0)`,
    }).from(listings);

    const totalListings = stats.activeListings + stats.itemsSold;
    const conversionRate = totalListings > 0 ? (stats.itemsSold / totalListings) * 100 : 0;
    const avgSalePrice = stats.itemsSold > 0 ? stats.totalEarnings / stats.itemsSold : 0;

    return {
      totalEarnings: stats.totalEarnings,
      activeListings: stats.activeListings,
      itemsSold: stats.itemsSold,
      totalViews: stats.totalViews,
      monthlyRevenue: stats.totalEarnings, // Simplified for demo
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgSalePrice: Math.round(avgSalePrice * 100) / 100,
    };
  }

  async generateShareLink(listingId: string): Promise<string> {
    const shareLink = nanoid(10);
    await this.updateListing(listingId, { shareLink } as any);
    
    await this.createActivity({
      type: 'listing_shared',
      description: 'Listing shared via link',
      listingId,
    });
    
    return shareLink;
  }

  async getListingByShareLink(shareLink: string): Promise<Listing | null> {
    const dbListing = await db.select().from(listings).where(eq(listings.shareLink, shareLink)).limit(1);
    return dbListing[0] ? this.convertDbToListing(dbListing[0]) : null;
  }

  // User profile methods (using mock data for now)
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone || undefined,
      contactPreferences: user.contactPreferences as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const [updated] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updated ? {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      phone: updated.phone || undefined,
      contactPreferences: updated.contactPreferences as any,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    } : null;
  }

  async updateContactPreferences(userId: string, preferences: UserProfile['contactPreferences']): Promise<UserProfile | null> {
    return this.updateUserProfile(userId, { contactPreferences: preferences });
  }

  // Messaging methods (simplified implementation)
  async getConversations(userId: string): Promise<(Conversation & { listing: Listing, otherUser: UserProfile, lastMessage: Message })[]> {
    // This would be more complex in a real implementation with proper joins
    return [];
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
    
    if (!conv) return null;

    return {
      id: conv.id,
      listingId: conv.listingId,
      buyerId: conv.buyerId,
      sellerId: conv.sellerId,
      lastMessageAt: conv.lastMessageAt,
      isArchivedBySeller: conv.isArchivedBySeller,
      isArchivedByBuyer: conv.isArchivedByBuyer,
    };
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    // Implementation would require proper conversation lookup
    return [];
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const id = nanoid();
    const insertData = {
      id,
      ...message,
      createdAt: new Date(),
    };

    const [newMessage] = await db.insert(messages).values(insertData).returning();
    
    return {
      id: newMessage.id,
      listingId: newMessage.listingId,
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      content: newMessage.content,
      isRead: newMessage.isRead,
      createdAt: newMessage.createdAt,
    };
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // Implementation would mark messages as read
  }

  async createOrGetConversation(listingId: string, buyerId: string, sellerId: string): Promise<Conversation> {
    // Check if conversation exists
    const [existing] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.listingId, listingId),
          eq(conversations.buyerId, buyerId),
          eq(conversations.sellerId, sellerId)
        )
      )
      .limit(1);

    if (existing) {
      return {
        id: existing.id,
        listingId: existing.listingId,
        buyerId: existing.buyerId,
        sellerId: existing.sellerId,
        lastMessageAt: existing.lastMessageAt,
        isArchivedBySeller: existing.isArchivedBySeller,
        isArchivedByBuyer: existing.isArchivedByBuyer,
      };
    }

    // Create new conversation
    const id = nanoid();
    const insertData = {
      id,
      listingId,
      buyerId,
      sellerId,
      lastMessageAt: new Date(),
      isArchivedBySeller: false,
      isArchivedByBuyer: false,
    };

    const [newConv] = await db.insert(conversations).values(insertData).returning();
    
    return {
      id: newConv.id,
      listingId: newConv.listingId,
      buyerId: newConv.buyerId,
      sellerId: newConv.sellerId,
      lastMessageAt: newConv.lastMessageAt,
      isArchivedBySeller: newConv.isArchivedBySeller,
      isArchivedByBuyer: newConv.isArchivedByBuyer,
    };
  }
}

export const storage = new MemStorage();
