import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store";
import { HelmetProvider } from "react-helmet-async";
import { ToastContainer } from "react-toastify";
import LoginPage from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import PasswordsPage from "@/pages/Passwords";
import UsersPage from "@/pages/Users";
import SettingsPage from "@/pages/Settings";
import RegisterPage from "@/pages/Register";
import NotFound from "./pages/NotFound";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <ToastContainer position="top-right" />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/passwords" element={<PasswordsPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </Provider>
);

export default App;
