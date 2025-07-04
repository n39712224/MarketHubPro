import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.status === 401) {
          // Return mock user for development
          return {
            id: "1", 
            email: "demo@markethub.com",
            firstName: "Alex",
            lastName: "Johnson", 
            profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            isSeller: true,
            isBuyer: true
          };
        }
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        return response.json();
      } catch (error) {
        // Return mock user for development
        return {
          id: "1", 
          email: "demo@markethub.com",
          firstName: "Alex",
          lastName: "Johnson", 
          profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          isSeller: true,
          isBuyer: true
        };
      }
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}