import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertListingSchema, paymentIntentSchema } from "@shared/schema";
import { generateDescription, improveDescription, suggestTitleAndCategory, enhanceImage, generateImageDescription, type AIDescriptionRequest } from "./ai";
import { sendMultipleInvitations } from "./email";
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

  // Simple auth routes (bypassing Replit Auth for now)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user is logged in via session
      if (req.session && req.session.user) {
        res.json(req.session.user);
      } else {
        res.status(401).json({ error: 'Not authenticated' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      // Simple demo authentication
      if (email === 'alex@markethub.com' && password === 'demo') {
        const user = {
          id: 'demo-user-1',
          email: 'alex@markethub.com',
          firstName: 'Alex',
          lastName: 'Johnson',
          isAuthenticated: true
        };
        
        // Set user in session
        req.session.user = user;
        
        res.json(user);
      } else if (email === 'alex.tester@markethub.com' && password === 'test') {
        const user = {
          id: 'user1',
          email: 'alex.tester@markethub.com',
          firstName: 'Alex',
          lastName: 'Tester',
          isAuthenticated: true
        };
        
        // Set user in session
        req.session.user = user;
        
        res.json(user);
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/signup', async (req: any, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // For simplicity, we'll skip the duplicate check for now
      // In a real app, you'd check if email exists in database
      
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`, // Simple ID generation
        email,
        firstName,
        lastName,
        isAuthenticated: true
      };
      
      // Save user to storage (you'd normally hash the password here)
      await storage.upsertUser(newUser);
      
      // Set user in session
      req.session.user = newUser;
      
      res.json(newUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/logout', async (req: any, res) => {
    try {
      // Clear user session
      if (req.session) {
        req.session.user = null;
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Legacy auth route for compatibility
  app.get('/api/auth/user-old', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user role preferences
  app.post('/api/user/update-role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      const roleUpdates = {
        isSeller: role === 'seller' || role === 'both',
        isBuyer: role === 'buyer' || role === 'both',
        joinedAsSellerAt: (role === 'seller' || role === 'both') ? new Date() : null,
        joinedAsBuyerAt: (role === 'buyer' || role === 'both') ? new Date() : null,
      };
      
      const updatedUser = await storage.updateUserRole(userId, roleUpdates);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
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
  app.post("/api/listings", isAuthenticated, upload.array('images', 5), async (req, res) => {
    try {
      const data = {
        ...req.body,
        price: parseFloat(req.body.price),
        images: req.files ? (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`) : [],
        shippingOffered: req.body.shippingOffered === 'true',
        localPickup: req.body.localPickup === 'true',
        allowFacebookConnections: req.body.allowFacebookConnections === 'true',
        invitedEmails: req.body.invitedEmails ? req.body.invitedEmails.split(',').map((email: string) => email.trim()).filter(Boolean) : [],
        trackingNumber: req.body.trackingNumber || undefined,
        deliveryAddress: req.body.deliveryAddress || undefined,
        deliveryNotes: req.body.deliveryNotes || undefined,
      };
      
      console.log('Raw listing data:', data);
      const validatedData = insertListingSchema.parse(data);
      console.log('Validated data:', validatedData);
      const listing = await storage.createListing(validatedData);
      
      // Send invitation emails for private listings
      if (listing.visibility === 'private' && listing.invitedEmails && listing.invitedEmails.length > 0) {
        try {
          const user = req.session?.user;
          const sellerName = user ? `${user.firstName} ${user.lastName}` : 'Someone';
          const listingUrl = `${req.protocol}://${req.get('host')}/listing/${listing.id}`;
          
          const invitations = listing.invitedEmails.map(email => ({
            to: email,
            listingTitle: listing.title,
            listingPrice: listing.price,
            listingDescription: listing.description,
            sellerName: sellerName,
            listingUrl: listingUrl
          }));
          
          const emailResult = await sendMultipleInvitations(invitations);
          console.log(`Email invitations sent: ${emailResult.sent} successful, ${emailResult.failed} failed`);
          
          // Add activity for email sending
          await storage.createActivity({
            type: 'email_sent',
            description: `Invitation emails sent to ${emailResult.sent} recipients for "${listing.title}"`,
            listingId: listing.id,
          });
        } catch (emailError) {
          console.error('Error sending invitation emails:', emailError);
          // Don't fail the listing creation if email sending fails
        }
      }
      
      res.status(201).json(listing);
    } catch (error: any) {
      console.error('Listing creation error:', error);
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
  app.post("/api/listings/:id/share", isAuthenticated, async (req, res) => {
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



  // Shipping integration routes
  app.post("/api/shipping/calculate", isAuthenticated, async (req, res) => {
    try {
      const { fromAddress, toAddress, weight, dimensions, carrier } = req.body;
      
      // Default shipping rates (in production, integrate with actual APIs)
      const shippingRates = {
        ups: {
          ground: 15.00,
          express: 35.00,
          overnight: 65.00
        },
        fedex: {
          ground: 16.00,
          express: 32.00,
          overnight: 68.00
        },
        usps: {
          ground: 12.00,
          priority: 25.00,
          express: 45.00
        }
      };
      
      const rates = shippingRates[carrier] || shippingRates.ups;
      
      res.json({
        carrier: carrier || 'ups',
        rates: [
          { service: 'ground', rate: rates.ground, delivery: '5-7 business days' },
          { service: 'express', rate: rates.express, delivery: '2-3 business days' },
          { service: 'overnight', rate: rates.overnight, delivery: '1 business day' }
        ]
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/shipping/create-label", isAuthenticated, async (req, res) => {
    try {
      const { fromAddress, toAddress, weight, dimensions, service, carrier } = req.body;
      
      // Mock shipping label creation (in production, integrate with actual APIs)
      const trackingNumber = `${carrier.toUpperCase()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      res.json({
        trackingNumber,
        labelUrl: `https://example.com/labels/${trackingNumber}.pdf`,
        carrier: carrier || 'ups',
        service,
        cost: service === 'ground' ? 15.00 : service === 'express' ? 35.00 : 65.00
      });
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

  // AI endpoints
  app.post("/api/ai/generate-description", async (req, res) => {
    try {
      const request: AIDescriptionRequest = req.body;
      const result = await generateDescription(request);
      res.json(result);
    } catch (error: any) {
      console.error('AI description generation error:', error);
      const isQuotaError = error.code === 'insufficient_quota' || error.type === 'insufficient_quota' || error.message?.includes('quota') || error.message?.includes('exceeded your current quota');
      res.status(500).json({ 
        error: isQuotaError ? "OpenAI credits needed. Please add credits to your account." : (error.message || "Failed to generate description")
      });
    }
  });

  app.post("/api/ai/improve-description", async (req, res) => {
    try {
      const { description, context } = req.body;
      const result = await improveDescription(description, context);
      res.json({ description: result });
    } catch (error: any) {
      console.error('AI description improvement error:', error);
      const isQuotaError = error.code === 'insufficient_quota' || error.message?.includes('quota');
      res.status(500).json({ 
        error: isQuotaError ? "OpenAI credits needed. Please add credits to your account." : error.message || "Failed to improve description"
      });
    }
  });

  app.post("/api/ai/enhance-image", async (req, res) => {
    try {
      const { image } = req.body;
      const result = await enhanceImage(image);
      res.json({ suggestions: JSON.parse(result) });
    } catch (error: any) {
      console.error('AI image enhancement error:', error);
      const isQuotaError = error.code === 'insufficient_quota' || error.message?.includes('quota');
      res.status(500).json({ 
        error: isQuotaError ? "OpenAI credits needed. Please add credits to your account." : error.message || "Failed to analyze image"
      });
    }
  });

  app.post("/api/ai/generate-from-image", async (req, res) => {
    try {
      const { image } = req.body;
      const result = await generateImageDescription(image);
      res.json({ description: result });
    } catch (error: any) {
      console.error('AI image description error:', error);
      const isQuotaError = error.code === 'insufficient_quota' || error.message?.includes('quota');
      res.status(500).json({ 
        error: isQuotaError ? "OpenAI credits needed. Please add credits to your account." : error.message || "Failed to generate description from image"
      });
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



  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    try {
      const { amount, listingId, description } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          listingId: listingId || "",
          description: description || "",
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  app.post("/api/confirm-payment", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    try {
      const { paymentIntentId, listingId } = req.body;
      
      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Update listing status to sold
        await storage.updateListing(listingId, { 
          status: 'sold',
          deliveryStatus: 'processing'
        });
        
        // Create activity record
        await storage.createActivity({
          type: 'sale',
          description: `Payment received for listing`,
          listingId: listingId,
          amount: paymentIntent.amount / 100, // Convert back from cents
        });

        res.json({ success: true, message: "Payment confirmed and listing updated" });
      } else {
        res.status(400).json({ error: "Payment not completed" });
      }
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  // Delivery tracking routes
  app.put("/api/listings/:id/delivery", async (req, res) => {
    try {
      const { id } = req.params;
      const { deliveryStatus, trackingNumber, deliveryAddress, deliveryNotes } = req.body;
      
      const updated = await storage.updateListing(id, {
        deliveryStatus,
        trackingNumber,
        deliveryAddress,
        deliveryNotes,
      });

      if (!updated) {
        return res.status(404).json({ error: "Listing not found" });
      }

      // Create activity for delivery update
      await storage.createActivity({
        type: 'listing_edited',
        description: `Delivery status updated to ${deliveryStatus}`,
        listingId: id,
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
