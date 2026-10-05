import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SWRConfig } from "swr";
import { Toaster } from "react-hot-toast";
import fetcher from "@/api/fetcher";
import AuthProvider from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/features/auth/LoginPage";
import DashboardPage from "@/features/tenders/DashboardPage";
import TendersPage from "@/features/tenders/TendersPage";
import TenderDetailsPage from "@/features/tenders/TenderDetailsPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import ProfilePage from "@/features/profile/ProfilePage";

export default function App() {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        shouldRetryOnError: false,
        dedupingInterval: 5000,
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: "10px",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                fontSize: "14px",
                fontWeight: 500,
                padding: "12px 20px",
                boxShadow: "var(--shadow-md)",
                border: "1px solid var(--border-color)",
              },
              success: {
                iconTheme: { primary: "#1abc9c", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#fff" },
              },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="tenders/:type" element={<TendersPage />} />
              <Route path="tender/:id" element={<TenderDetailsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SWRConfig>
  );
}

