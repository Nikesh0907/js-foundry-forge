import { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { AppLayout } from "./components/layout/AppLayout";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Candidates from "./pages/Candidates";
import CandidatesBoard from "./pages/CandidatesBoard";
import CandidateDetail from "./pages/CandidateDetail";
import Assessments from "./pages/Assessments";
import NotFound from "./pages/NotFound";
import { seedDatabase } from "./lib/db/seed";

const queryClient = new QueryClient();

const App = () => {
  const [initialized, setInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  useEffect(() => {
    // Initialize MSW and seed database
    async function init() {
      try {
        // Start MSW with a timeout so we never hang on Loading...
        const startMsw = async () => {
          if (!import.meta.env.DEV) return;
          try {
            const { worker } = await import('./lib/api/browser');
            const startPromise = worker.start({ onUnhandledRequest: 'bypass' });
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('msw start timeout')), 2000));
            await Promise.race([startPromise, timeout]);
          } catch (e) {
            console.warn('MSW failed to start, proceeding without mocks:', e);
          }
        };

        const seed = seedDatabase().catch((e) => {
          console.warn('Seeding failed:', e);
        });

        await Promise.allSettled([startMsw(), seed]);
      } catch (err) {
        console.error('Initialization failed:', err);
        setInitError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setInitialized(true);
      }
    }
    init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!initialized ? (
          <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Loading</span>
            </div>
          </div>
        ) : initError ? (
          <div className="flex min-h-screen items-center justify-center text-destructive">
            Failed to initialize app: {String(initError)}
          </div>
        ) : (
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route 
                  path="/get-started" 
                  element={
                    <PublicRoute>
                      <GetStarted />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } 
                />
                
                {/* Protected routes */}
                <Route element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/jobs/:jobId" element={<JobDetail />} />
                  <Route path="/candidates" element={<Candidates />} />
                  <Route path="/candidates/board" element={<CandidatesBoard />} />
                  <Route path="/candidates/:id" element={<CandidateDetail />} />
                  <Route path="/assessments" element={<Assessments />} />
                </Route>
                
                {/* Default redirects */}
                <Route path="/" element={<Navigate to="/get-started" replace />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
