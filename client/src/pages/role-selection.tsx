import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Search, Star, ArrowRight, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function RoleSelection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<'seller' | 'buyer' | 'both' | null>(null);

  const updateRoleMutation = useMutation({
    mutationFn: async (role: 'seller' | 'buyer' | 'both') => {
      const response = await apiRequest("POST", "/api/user/update-role", { role });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to MarketHub!",
        description: "Your account has been set up successfully.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update your role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRoleSelect = (role: 'seller' | 'buyer' | 'both') => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      updateRoleMutation.mutate(selectedRole);
    }
  };

  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.email || 'there';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome to MarketHub, {displayName}! 👋
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Let's get you started. What would you like to do first?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Seller Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedRole === 'seller' 
                ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleRoleSelect('seller')}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-purple-600 dark:text-purple-400">Start Selling</CardTitle>
              <CardDescription>
                I want to sell my items and earn money
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  AI-powered descriptions
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  SEO-optimized listings
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Secure messaging
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Buyer Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedRole === 'buyer' 
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleRoleSelect('buyer')}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-blue-600 dark:text-blue-400">Start Shopping</CardTitle>
              <CardDescription>
                I want to browse and buy items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Advanced search & filters
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Direct seller messaging
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Secure transactions
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Both Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedRole === 'both' 
                ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/30' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleRoleSelect('both')}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-green-600 dark:text-green-400">Both!</CardTitle>
              <CardDescription>
                I want to buy and sell items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Full marketplace access
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Unified dashboard
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Complete experience
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {selectedRole && (
          <div className="text-center">
            <Button 
              size="lg"
              onClick={handleContinue}
              disabled={updateRoleMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
            >
              {updateRoleMutation.isPending ? (
                "Setting up your account..."
              ) : (
                <>
                  Continue to MarketHub
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              You can always change this later in your profile settings
            </p>
          </div>
        )}
      </div>
    </div>
  );
}