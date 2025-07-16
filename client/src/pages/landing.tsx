import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, Users, Shield, Search, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">MarketHub</span>
          </div>
          <Button 
            onClick={() => setLocation('/login')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Your Personal Marketplace
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Create and manage your items for sale with ease. Starting with private sales to friends and family, with more features coming soon.
        </p>
        <Button 
          size="lg"
          onClick={() => setLocation('/login')}
          className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-3"
        >
          Start Selling Today
        </Button>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
          Why Choose MarketHub?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Smart Assistance
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get intelligent suggestions for descriptions, pricing, and categories that help your items stand out and attract more buyers.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              SEO Optimized
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your listings are automatically optimized for search engines, helping potential buyers discover your items online.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Privacy Controls
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Control what contact information you share with buyers and maintain your privacy while selling.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Built-in Messaging
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Communicate with buyers directly through our secure messaging system without sharing personal details.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Growing Community
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Join a community of sellers and buyers who value quality, transparency, and fair transactions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Easy Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Professional dashboard to manage all your listings, track sales, and analyze performance in one place.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join MarketHub today and transform the way you sell your items online.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShoppingBag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">MarketHub</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            © 2025 MarketHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}