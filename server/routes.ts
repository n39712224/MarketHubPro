import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertListingSchema, paymentIntentSchema } from "@shared/schema";
import { generateDescription, improveDescription, suggestTitleAndCategory, type AIDescriptionRequest } from "./ai";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? 
  new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" }) : 
  null;

// Configure multer for image uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Ensure uploads directory exists
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  // Serve uploaded images
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  app.use('/uploads', express.static('uploads'));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all listings
  app.get("/api/listings", async (req, res) => {
    try {
      const { search, category, visibility, status } = req.query;
      
      let listings;
      if (search || category || visibility) {
        listings = await storage.searchListings(
          search as string || '',
          category as string,
          visibility as string
        );
      } else if (status) {
        listings = await storage.getListingsByStatus(status as any);
      } else {
        listings = await storage.getListings();
      }
      
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single listing
  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListingById(req.params.id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Increment view count
      await storage.incrementViews(req.params.id);
      
      res.json(listing);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get listing by share link
  app.get("/api/share/:shareLink", async (req, res) => {
    try {
      const listing = await storage.getListingByShareLink(req.params.shareLink);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      // Increment view count
      await storage.incrementViews(listing.id);
      
      res.json(listing);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new listing
  app.post("/api/listings", upload.array('images', 5), async (req, res) => {
    try {
      const data = {
        ...req.body,
        price: parseFloat(req.body.price),
        images: req.files ? (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`) : [],
        shippingOffered: req.body.shippingOffered === 'true',
        localPickup: req.body.localPickup === 'true',
      };
      
      const validatedData = insertListingSchema.parse(data);
      const listing = await storage.createListing(validatedData);
      
      res.status(201).json(listing);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update listing
  app.put("/api/listings/:id", upload.array('images', 5), async (req, res) => {
    try {
      const data = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        shippingOffered: req.body.shippingOffered !== undefined ? req.body.shippingOffered === 'true' : undefined,
        localPickup: req.body.localPickup !== undefined ? req.body.localPickup === 'true' : undefined,
      };
      
      // Add new images if provided
      if (req.files && (req.files as Express.Multer.File[]).length > 0) {
        const newImages = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
        data.images = [...(data.images || []), ...newImages];
      }
      
      const listing = await storage.updateListing(req.params.id, data);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      res.json(listing);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete listing
  app.delete("/api/listings/:id", async (req, res) => {
    try {
      const success = await storage.deleteListing(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Generate share link
  app.post("/api/listings/:id/share", async (req, res) => {
    try {
      const shareLink = await storage.generateShareLink(req.params.id);
      res.json({ shareLink: `${req.protocol}://${req.get('host')}/share/${shareLink}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mark listing as sold
  app.post("/api/listings/:id/sold", async (req, res) => {
    try {
      const listing = await storage.getListingById(req.params.id);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      const updatedListing = await storage.updateListing(req.params.id, { 
        status: 'sold' as any 
      });
      
      // Create sale activity
      await storage.createActivity({
        type: 'sale',
        description: `${listing.title} sold for $${listing.price}`,
        listingId: listing.id,
        amount: listing.price,
      });
      
      res.json(updatedListing);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get activities
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI assistance routes
  app.post("/api/ai/generate-description", async (req, res) => {
    try {
      const aiRequest: AIDescriptionRequest = req.body;
      const result = await generateDescription(aiRequest);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/improve-description", async (req, res) => {
    try {
      const { description, context } = req.body;
      const improvedDescription = await improveDescription(description, context);
      res.json({ description: improvedDescription });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/suggest-title-category", async (req, res) => {
    try {
      const { description, currentTitle } = req.body;
      const suggestions = await suggestTitleAndCategory(description, currentTitle);
      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Contact preferences routes
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/profile/:userId/contact-preferences", async (req, res) => {
    try {
      const preferences = req.body;
      const updated = await storage.updateContactPreferences(req.params.userId, preferences);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Messaging routes
  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = req.query.userId as string || "user1"; // Default for demo
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const message = req.body;
      const newMessage = await storage.sendMessage(message);
      res.json(newMessage);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // SEO public listing page (for search engines)
  app.get("/listing/:id", async (req, res) => {
    try {
      const listing = await storage.getListingById(req.params.id);
      if (!listing || listing.visibility === 'private') {
        return res.status(404).send("Listing not found");
      }

      // Increment views
      await storage.incrementViews(req.params.id);

      // Generate SEO-optimized HTML page
      const seoHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${listing.title} - $${listing.price} | MarketHub</title>
  <meta name="description" content="${listing.description.substring(0, 160)}...">
  <meta name="keywords" content="${listing.category}, ${listing.condition}, ${listing.title.toLowerCase().split(' ').join(', ')}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="product">
  <meta property="og:url" content="${req.protocol}://${req.get('host')}/listing/${listing.id}">
  <meta property="og:title" content="${listing.title} - $${listing.price}">
  <meta property="og:description" content="${listing.description.substring(0, 300)}">
  ${listing.images.length > 0 ? `<meta property="og:image" content="${listing.images[0]}">` : ''}
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${req.protocol}://${req.get('host')}/listing/${listing.id}">
  <meta property="twitter:title" content="${listing.title} - $${listing.price}">
  <meta property="twitter:description" content="${listing.description.substring(0, 200)}">
  ${listing.images.length > 0 ? `<meta property="twitter:image" content="${listing.images[0]}">` : ''}
  
  <!-- Schema.org structured data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "${listing.title}",
    "description": "${listing.description}",
    "category": "${listing.category}",
    "condition": "${listing.condition}",
    "offers": {
      "@type": "Offer",
      "price": "${listing.price}",
      "priceCurrency": "USD",
      "availability": "${listing.status === 'active' ? 'InStock' : 'OutOfStock'}"
    }${listing.images.length > 0 ? `,
    "image": "${listing.images[0]}"` : ''}
  }
  </script>
  
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .price { color: #059669; font-size: 1.5em; font-weight: bold; }
    .category { background: #f3f4f6; padding: 4px 8px; border-radius: 4px; }
    .images { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin: 20px 0; }
    .images img { width: 100%; height: 300px; object-fit: cover; border-radius: 8px; }
    .cta { background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>${listing.title}</h1>
  <div class="price">$${listing.price}</div>
  <span class="category">${listing.category}</span> • <span>${listing.condition}</span>
  
  ${listing.images.length > 0 ? `
  <div class="images">
    ${listing.images.map(img => `<img src="${img}" alt="${listing.title}" loading="lazy">`).join('')}
  </div>
  ` : ''}
  
  <p>${listing.description}</p>
  
  <a href="/" class="cta">View on MarketHub</a>
  
  <script>
    // Redirect to main app after 3 seconds
    setTimeout(() => {
      window.location.href = "/?listing=${listing.id}";
    }, 3000);
  </script>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(seoHtml);
    } catch (error: any) {
      res.status(500).send("Error loading listing");
    }
  });

  // Stripe payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }
    
    try {
      const { amount, listingId } = paymentIntentSchema.parse(req.body);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: { listingId },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
