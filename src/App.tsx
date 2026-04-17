import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MenuErrorFallback } from "@/components/MenuErrorFallback";
import { AdminErrorFallback } from "@/components/AdminErrorFallback";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import PublicMenuPage from "@/pages/PublicMenuPage";
import LoginPage from "@/pages/LoginPage";
import OverviewPage from "@/pages/OverviewPage";
import MenuEditorPage from "@/pages/MenuEditorPage";
import QRGeneratorPage from "@/pages/QRGeneratorPage";
import NotFoundPage from "@/pages/NotFoundPage";
import LandingPage from "@/pages/LandingPage";
import SignupPage from "@/pages/SignupPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/menu"
              element={
                <ErrorBoundary fallback={<MenuErrorFallback />}>
                  <PublicMenuPage />
                </ErrorBoundary>
              }
            />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin/signup" element={<SignupPage />} />
            <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
            <Route
              path="/admin"
              element={
                <ErrorBoundary fallback={<AdminErrorFallback />}>
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            >
              <Route path="overview" element={<OverviewPage />} />
              <Route path="menu" element={<MenuEditorPage />} />
              <Route path="qr" element={<QRGeneratorPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
