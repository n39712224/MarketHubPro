import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";

// Simple demo users for testing
const demoUsers = [
  { email: "alex@markethub.com", password: "password", name: "Alex Johnson" },
  { email: "demo@example.com", password: "demo", name: "Demo User" }
];

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
      
      // Find user in demo users
      const user = demoUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Use the existing user directly for alex@markethub.com
      let storedUser;
      if (user.email === "alex@markethub.com") {
        storedUser = await storage.getUser("user1");
      } else {
        // For other users, create new
        storedUser = await storage.upsertUser({
          id: `user-${Date.now()}`,
          email: user.email,
          firstName: user.name.split(' ')[0],
          lastName: user.name.split(' ')[1] || '',
          profileImageUrl: null,
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