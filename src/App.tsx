import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "@/i18n/config";
import Index from "./pages/Index";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BuyPage } from "./pages/BuyPage";
import { SellPage } from "./pages/SellPage";
import { GetRicePage } from "./pages/GetRicePage";
import { ConvertPage } from "./pages/ConvertPage";
import { StockPage } from "./pages/StockPage";
import { NearbyShopsPage } from "./pages/NearbyShopsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminPage } from "./pages/AdminPage";
import { ViewCartPage } from "./pages/ViewCartPage";
import { OrderHistoryPage } from "./pages/OrderHistoryPage";
import { DeliveryTrackingPage } from "./pages/DeliveryTrackingPage";
import ProjectDocumentation from "./pages/ProjectDocumentation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Navbar />
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/buy" element={<BuyPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/get-rice" element={<GetRicePage />} />
            <Route path="/convert" element={<ConvertPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/nearby" element={<NearbyShopsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/view-cart" element={<ViewCartPage />} />
            <Route path="/order-history" element={<OrderHistoryPage />} />
            <Route path="/track-delivery" element={<DeliveryTrackingPage />} />
            <Route path="/documentation" element={<ProjectDocumentation />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
