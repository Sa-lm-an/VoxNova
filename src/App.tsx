import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VotingProvider } from "@/contexts/VotingContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import UserLogin from "./pages/UserLogin";
import AdminLogin from "./pages/AdminLogin";
import ControllerLogin from "./pages/ControllerLogin";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import AdminDashboard from "./pages/AdminDashboard";
import ControllerDashboard from "./pages/ControllerDashboard";
import Nominate from "./pages/Nominate";
import NotFound from "./pages/NotFound";
import NavBar from "./components/NavBar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <VotingProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user-login" element={<UserLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/controller-login" element={<ControllerLogin />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/results" element={<Results />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/controller" element={<ControllerDashboard />} />
            <Route path="/nominate" element={<Nominate />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </VotingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
