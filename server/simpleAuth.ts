import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";

// Admin account for platform management
const adminUser = {
  email: "admin@markethub.com", 
  password: "admin2025", 
  name: "Admin",
  role: "admin"
};

export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || "demo-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  });
}

export function setupAuth(app: Express) {
  app.use(getSession());
  
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check admin credentials
      const user = (email === adminUser.email && password === adminUser.password) ? adminUser : null;
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Use admin account for platform management
      let storedUser = await storage.getUser("admin1");
      
      if (!storedUser) {
        // Create admin user if doesn't exist
        storedUser = await storage.upsertUser({
          id: "admin1",
          email: user.email,
          firstName: user.name,
          lastName: "",
          profileImageUrl: null,
          role: "admin",
        });
      }
      
      // Store user in session
      (req.session as any).user = storedUser;
      
      res.json({ success: true, user: storedUser });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get current user
  app.get("/api/auth/user", (req, res) => {
    const user = (req.session as any).user;
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(user);
  });
  
  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const user = (req.session as any).user;
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};