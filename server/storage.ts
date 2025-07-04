import { Listing, InsertListing, Activity, InsertActivity, UserStats } from "@shared/schema";
import { nanoid } from "nanoid";

interface IStorage {
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
}

class MemStorage implements IStorage {
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
}

export const storage = new MemStorage();
