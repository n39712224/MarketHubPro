import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Mail, Users, Facebook, Sparkles, Wand2, Lightbulb, Monitor, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddListingModal from "@/components/AddListingModal";
import type { Listing } from "@shared/schema";

interface DashboardProps {
  shareLink?: string;
}

export default function Dashboard({ shareLink }: DashboardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: listings = [] } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Filter only private sales
  const privateSales = listings.filter(listing => listing.visibility === 'private');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      {/* Header with enhanced design */}
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  MarketHub
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg ml-10 sm:ml-13">
                Your personal marketplace for selling items
              </p>
            </div>
            <Button 
              onClick={() => setIsAddModalOpen(true)} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-2xl flex items-center gap-2 sm:gap-3 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border border-white/20 w-full sm:w-auto justify-center"
            >
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-semibold text-sm sm:text-base">Create Private Sale</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          <Card className="relative bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-950/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-12 -mt-12"></div>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
                Active Private Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {privateSales.length}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Currently available</p>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-800 dark:to-emerald-950/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -mr-12 -mt-12"></div>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                Email Invitations Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                {privateSales.reduce((total, listing) => 
                  total + (listing.invitedEmails?.length || 0), 0
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">People invited</p>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-950/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-12 -mt-12"></div>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">$</span>
                </div>
                Total Sales Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                ${privateSales.reduce((total, listing) => total + listing.price, 0).toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across all items</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Private Sales List */}
        <Card className="relative bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-850 border-0 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
          <CardHeader className="bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-700/30 dark:to-transparent border-b border-gray-100/50 dark:border-gray-700/50 p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Your Private Sales
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Exclusive items available only to invited people via email and Facebook
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {privateSales.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <UserPlus className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Ready to start your first private sale?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
                  Create exclusive sales and invite specific people via email. Enable Facebook connections to reach your network easily.
                </p>
                <Button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Create Your First Private Sale</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {privateSales.map((listing) => (
                  <div 
                    key={listing.id} 
                    className="relative bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-700/50 dark:to-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {listing.title}
                          </h3>
                          <span className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 text-blue-700 dark:text-blue-300 text-xs px-3 py-1 rounded-full font-semibold shadow-sm">
                            Private Sale
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                          {listing.description}
                        </p>
                        <div className="flex items-center gap-8 mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-sm">$</span>
                            </div>
                            <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              ${listing.price.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                              <Mail className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium">{listing.invitedEmails?.length || 0} people invited</span>
                          </div>
                          {listing.allowFacebookConnections && (
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                                <Facebook className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-sm font-medium">Facebook enabled</span>
                            </div>
                          )}
                        </div>
                        {listing.invitedEmails && listing.invitedEmails.length > 0 && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <Mail className="h-4 w-4 text-blue-500" />
                              Invited people:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {listing.invitedEmails.map((email, index) => (
                                <span 
                                  key={index}
                                  className="text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm font-medium"
                                >
                                  {email}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-6">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 shadow-lg">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                            Category
                          </div>
                          <div className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize">
                            {listing.category}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Features & Cross-Platform Demo Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
        <Card className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800 shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              Platform Features Demo
            </CardTitle>
            <p className="text-emerald-600 dark:text-emerald-400">
              AI-powered tools and cross-platform compatibility features built into MarketHub
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* AI Features Demo */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-4 flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                AI Image Enhancement Tools
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900/50 rounded-xl p-6 shadow-lg border border-emerald-200 dark:border-emerald-800">
                  <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Image Quality Analysis
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>Lighting optimization suggestions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>Background composition tips</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>Quality score (1-10 rating)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>Professional presentation guidance</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      <strong>Status:</strong> Fully integrated - Available when you upload images in the listing modal
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900/50 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Description Generation
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Automatic product recognition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Key features identification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Sales-optimized descriptions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Brand and condition analysis</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <strong>Status:</strong> Ready to use - Upload an image and click "Generate Description"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cross-Platform Compatibility Demo */}
            <div>
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4 flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Cross-Platform Design Demonstration
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mobile Demo */}
                <div className="bg-white dark:bg-gray-900/50 rounded-xl p-6 shadow-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">📱</div>
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300">Mobile Optimized</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">320px - 640px</p>
                  </div>
                  
                  {/* Mobile Layout Preview */}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
                    <div className="bg-white dark:bg-gray-700 rounded-md p-2 mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
                        <div className="text-xs font-bold">MarketHub</div>
                      </div>
                      <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded text-center">
                        Create Private Sale
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="bg-white dark:bg-gray-700 rounded p-2">
                        <div className="text-xs font-bold text-blue-600">3</div>
                        <div className="text-xs text-gray-500">Active Sales</div>
                      </div>
                    </div>
                  </div>
                  
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Touch-friendly buttons (44px min)</li>
                    <li>• Single-column layout</li>
                    <li>• Optimized font sizes</li>
                    <li>• Swipe gesture support</li>
                  </ul>
                </div>

                {/* Tablet Demo */}
                <div className="bg-white dark:bg-gray-900/50 rounded-xl p-6 shadow-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">📱</div>
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300">Tablet Enhanced</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">640px - 1024px</p>
                  </div>
                  
                  {/* Tablet Layout Preview */}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
                    <div className="bg-white dark:bg-gray-700 rounded-md p-2 mb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
                          <div className="text-xs font-bold">MarketHub</div>
                        </div>
                        <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Create Sale
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="bg-white dark:bg-gray-700 rounded p-2">
                        <div className="text-xs font-bold text-blue-600">3</div>
                        <div className="text-xs text-gray-500">Sales</div>
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded p-2">
                        <div className="text-xs font-bold text-emerald-600">$1,850</div>
                        <div className="text-xs text-gray-500">Earnings</div>
                      </div>
                    </div>
                  </div>
                  
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Balanced two-column layout</li>
                    <li>• Medium-sized interactions</li>
                    <li>• Horizontal navigation</li>
                    <li>• Optimized for landscape</li>
                  </ul>
                </div>

                {/* Desktop Demo */}
                <div className="bg-white dark:bg-gray-900/50 rounded-xl p-6 shadow-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">🖥️</div>
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300">Desktop Enhanced</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">1024px+</p>
                  </div>
                  
                  {/* Desktop Layout Preview */}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
                    <div className="bg-white dark:bg-gray-700 rounded-md p-2 mb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
                          <div className="text-xs font-bold">MarketHub</div>
                        </div>
                        <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Create Private Sale
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Phase 1: Private sales platform</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className="bg-white dark:bg-gray-700 rounded p-1">
                        <div className="text-xs font-bold text-blue-600">3</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded p-1">
                        <div className="text-xs font-bold text-emerald-600">$1,850</div>
                        <div className="text-xs text-gray-500">Earnings</div>
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded p-1">
                        <div className="text-xs font-bold text-purple-600">135</div>
                        <div className="text-xs text-gray-500">Views</div>
                      </div>
                    </div>
                  </div>
                  
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Three-column information density</li>
                    <li>• Hover effects and animations</li>
                    <li>• Keyboard shortcuts support</li>
                    <li>• Maximum screen utilization</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Accessibility Features */}
            <div className="bg-white dark:bg-gray-900/50 rounded-xl p-6 shadow-lg border border-indigo-200 dark:border-indigo-800">
              <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Accessibility & Browser Compatibility
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl mb-2">♿</div>
                  <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">Universal Access</h5>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• High contrast mode support</li>
                    <li>• Reduced motion preferences</li>
                    <li>• Screen reader compatibility</li>
                    <li>• Keyboard navigation</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🌐</div>
                  <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">Cross-Browser</h5>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Chrome, Firefox, Safari, Edge</li>
                    <li>• iOS Safari & Android Chrome</li>
                    <li>• Progressive enhancement</li>
                    <li>• Fallback support</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <h5 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">Performance</h5>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Optimized font rendering</li>
                    <li>• Efficient CSS animations</li>
                    <li>• Responsive image loading</li>
                    <li>• Minimal bundle size</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Try It Out Call-to-Action */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800 text-center">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Experience the Features
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                Try creating a new listing to see the AI image tools in action, or resize your browser window to test the responsive design
              </p>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Try AI Features Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddListingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}