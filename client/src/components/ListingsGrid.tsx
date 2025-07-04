import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Listing } from "@shared/schema";
import { Shield } from "lucide-react";
import FacebookShare from "./FacebookShare";
import PaymentButton from "./PaymentButton";

interface ListingsGridProps {
  searchQuery: string;
  selectedCategory: string;
  selectedVisibility: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onVisibilityChange: (visibility: string) => void;
  shareLink?: string;
}

export default function ListingsGrid({
  searchQuery,
  selectedCategory,
  selectedVisibility,
  onSearchChange,
  onCategoryChange,
  onVisibilityChange,
  shareLink,
}: ListingsGridProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Use share link if provided, otherwise get all listings
  const { data: listings, isLoading } = useQuery({
    queryKey: shareLink 
      ? ['/api/share', shareLink]
      : ['/api/listings', { search: searchQuery, category: selectedCategory, visibility: selectedVisibility }],
    queryFn: () => {
      if (shareLink) {
        return apiRequest("GET", `/api/share/${shareLink}`).then(res => res.json()).then(listing => [listing]);
      }
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedVisibility) params.append('visibility', selectedVisibility);
      
      return apiRequest("GET", `/api/listings?${params.toString()}`).then(res => res.json());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/listings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({ title: "Listing deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete listing", variant: "destructive" });
    },
  });

  const shareMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/listings/${id}/share`).then(res => res.json()),
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.shareLink);
      toast({ title: "Share link copied to clipboard!" });
    },
    onError: () => {
      toast({ title: "Failed to generate share link", variant: "destructive" });
    },
  });

  const soldMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/listings/${id}/sold`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "Item marked as sold!" });
    },
    onError: () => {
      toast({ title: "Failed to mark as sold", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600">
              {shareLink ? "This listing could not be found." : "Start by creating your first listing."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getVisibilityBadge = (visibility: string) => {
    const variants = {
      public: "bg-green-100 text-green-800",
      private: "bg-gray-100 text-gray-800",
      shared: "bg-blue-100 text-blue-800",
    };
    return variants[visibility as keyof typeof variants] || variants.public;
  };

  const paginatedListings = listings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(listings.length / itemsPerPage);

  return (
    <Card>
      {!shareLink && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900">My Listings</h3>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
                <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <Select value={selectedCategory || "all"} onValueChange={(value) => onCategoryChange(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="sports">Sports & Outdoors</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedVisibility || "all"} onValueChange={(value) => onVisibilityChange(value === "all" ? "" : value)}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedListings.map((listing: Listing) => (
            <div key={listing.id} className="listing-card bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              {listing.images.length > 0 && (
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 truncate">{listing.title}</h4>
                  <Badge className={getVisibilityBadge(listing.visibility)}>
                    {listing.visibility}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{listing.description}</p>
                
                {/* Private Sale Info */}
                {listing.visibility === 'private' && (
                  <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                    <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                      <Shield className="h-3 w-3" />
                      <span>Private Sale</span>
                      {listing.invitedEmails && listing.invitedEmails.length > 0 && (
                        <span>• {listing.invitedEmails.length} people invited</span>
                      )}
                      {listing.allowFacebookConnections && (
                        <span>• Facebook friends included</span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">${listing.price}</span>
                  {!shareLink && (
                    <div className="flex space-x-2">
                      <FacebookShare 
                        listingId={listing.id}
                        title={listing.title}
                        description={listing.description}
                        imageUrl={listing.images[0]}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareMutation.mutate(listing.id)}
                        disabled={shareMutation.isPending}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </Button>
                      {listing.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => soldMutation.mutate(listing.id)}
                          disabled={soldMutation.isPending}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(listing.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  )}
                  {shareLink && listing.status === 'active' && (
                    <div className="flex space-x-2">
                      <FacebookShare 
                        listingId={listing.id}
                        title={listing.title}
                        description={listing.description}
                        imageUrl={listing.images[0]}
                      />
                      <PaymentButton 
                        listingId={listing.id}
                        amount={listing.price}
                        title={listing.title}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                  <span>{listing.views} views</span>
                  <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!shareLink && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              Showing {Math.min(listings.length, itemsPerPage)} of {listings.length} listings
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
