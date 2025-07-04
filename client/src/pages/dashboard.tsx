import { useState } from "react";
import Header from "@/components/Header";
import DashboardStats from "@/components/DashboardStats";
import ListingsGrid from "@/components/ListingsGrid";
import SidebarWidgets from "@/components/SidebarWidgets";
import AddListingModal from "@/components/AddListingModal";

interface DashboardProps {
  shareLink?: string;
}

export default function Dashboard({ shareLink }: DashboardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedVisibility, setSelectedVisibility] = useState("");

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section for Dashboard */}
      {!shareLink && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Welcome back, Alex! 👋
                </h1>
                <p className="text-purple-100 text-lg">
                  Manage your marketplace and track your sales performance
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="floating-action bg-white text-purple-600 hover:text-purple-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 w-fit mt-4 sm:mt-0 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add New Listing</span>
              </button>
            </div>
          </div>
        </section>
      )}
      
      {/* Enhanced Main Content Area */}
      <div className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 min-h-screen">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        </div>
        
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 z-10">
          {!shareLink && (
            <section className="mb-8">
              <DashboardStats />
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Content Card with Enhanced Styling */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden backdrop-blur-sm">
                <ListingsGrid
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  selectedVisibility={selectedVisibility}
                  onSearchChange={setSearchQuery}
                  onCategoryChange={setSelectedCategory}
                  onVisibilityChange={setSelectedVisibility}
                  shareLink={shareLink}
                />
              </div>
            </div>
            
            {!shareLink && (
              <div className="space-y-6">
                <SidebarWidgets onAddListing={() => setIsAddModalOpen(true)} />
              </div>
            )}
          </div>
        </main>
      </div>

      {!shareLink && (
        <footer className="glass-effect border-t border-white/20 dark:border-gray-700/50 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">MarketHub</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Personal Marketplace</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Your personal marketplace for buying and selling items easily and securely with modern tools and beautiful design.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Platform</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Dashboard</a></li>
                  <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Listings</a></li>
                  <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Analytics</a></li>
                  <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Settings</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Support</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Community</a></li>
                  <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Status</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Cookie Policy</a></li>
                  <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Licenses</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-600 dark:text-gray-300 text-sm">&copy; 2024 MarketHub. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                <a href="#" className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}

      <AddListingModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}