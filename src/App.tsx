import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute, { AuthenticatedRoute } from "./components/PrivateRoute";
import Index from "./pages/Index";
import ClientDashboard from "./pages/client/Dashboard";
import FreelancerDashboard from "./pages/freelancer/Dashboard";
import ClientProfile from "./pages/client/Profile";
import FreelancerProfile from "./pages/freelancer/Profile";
import PublicProfile from "./pages/freelancer/PublicProfile";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import JobPost from "./pages/client/JobPost";
import JobDetails from "./pages/freelancer/JobDetails";
import PaymentPage from "./pages/PaymentPage";
import NotFound from "./pages/NotFound";
import BrowseJobs from "./pages/freelancer/BrowseJobs";
import BrowseFreelancers from "./pages/client/BrowseFreelancers";
import JobDetailsClient from "./pages/client/JobDetailsClient";
import SubmitProposal from "./pages/freelancer/SubmitProposal";
import Messages from "./pages/Messages";
import TestChat from "./pages/TestChat";
import BrowseJobsPublic from "./pages/BrowseJobs";
import FindTalent from "./pages/FindTalent";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import EditJob from "./pages/client/EditJob";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Client Routes - Protected */}
          <Route path="/client-dashboard" element={
            <PrivateRoute requiredUserType="client">
              <ClientDashboard />
            </PrivateRoute>
          } />
          <Route path="/client-profile" element={
            <PrivateRoute requiredUserType="client">
              <ClientProfile />
            </PrivateRoute>
          } />
          <Route path="/post-job" element={
            <PrivateRoute requiredUserType="client">
              <JobPost />
            </PrivateRoute>
          } />
          <Route path="/browse-freelancers" element={
            <PrivateRoute requiredUserType="client">
              <BrowseFreelancers />
            </PrivateRoute>
          } />
          <Route path="/client/job/:id" element={
            <PrivateRoute requiredUserType="client">
              <JobDetailsClient />
            </PrivateRoute>
          } />
          <Route path="/edit-job/:id" element={
            <PrivateRoute requiredUserType="client">
              <EditJob />
            </PrivateRoute>
          } />
          
          {/* Freelancer Routes - Protected */}
          <Route path="/freelancer-dashboard" element={
            <PrivateRoute requiredUserType="freelancer">
              <FreelancerDashboard />
            </PrivateRoute>
          } />
          <Route path="/freelancer-profile" element={
            <PrivateRoute requiredUserType="freelancer">
              <FreelancerProfile />
            </PrivateRoute>
          } />
          <Route path="/freelancer/job/:id" element={
            <PrivateRoute requiredUserType="freelancer">
              <JobDetails />
            </PrivateRoute>
          } />
          <Route path="/freelancer/job/:id/submit-proposal" element={
            <PrivateRoute requiredUserType="freelancer">
              <SubmitProposal />
            </PrivateRoute>
          } />
          <Route path="/browse-jobs" element={
            <PrivateRoute requiredUserType="freelancer">
              <BrowseJobs />
            </PrivateRoute>
          } />
          
          {/* Public Routes */}
          <Route path="/freelancer/public-profile/:id" element={<PublicProfile />} />
          <Route path="/pay" element={<PaymentPage />} />
          <Route path="/messages" element={
            <AuthenticatedRoute>
              <Messages />
            </AuthenticatedRoute>
          } />
          <Route path="/test-chat" element={<TestChat />} />
          <Route path="/jobs" element={<BrowseJobsPublic />} />
          <Route path="/find-talent" element={<FindTalent />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
