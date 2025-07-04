import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertListingSchema, paymentIntentSchema } from "@shared/schema";

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
