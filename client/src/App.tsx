import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/dashboard";
import Checkout from "@/pages/checkout";
import Login from "@/pages/login";
import { Route, Switch } from "wouter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-white dark:bg-slate-900 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[size:20px_20px] bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10">
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/checkout/:listingId" component={Checkout} />
            <Route path="/share/:shareLink">
              {(params) => <Dashboard shareLink={params.shareLink} />}
            </Route>
            <Route>
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center glass-effect rounded-2xl p-8 max-w-md mx-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">404</h1>
                  <p className="text-gray-600 dark:text-gray-300">Oops! This page couldn't be found.</p>
                  <a href="/" className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105">
                    Go Home
                  </a>
                </div>
              </div>
            </Route>
          </Switch>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
