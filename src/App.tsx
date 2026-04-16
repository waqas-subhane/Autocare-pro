import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { Layout } from "./components/Layout";
import { Auth } from "./components/Auth";
import { ServiceList } from "./components/ServiceList";
import { ServiceDetail } from "./components/ServiceDetail";
import { Appointments } from "./components/Appointments";
import { Toaster } from "@/components/ui/sonner";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./lib/firebase";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="autoserve-theme">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<ServiceList />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/service/:id" element={<ServiceDetail mode="view" />} />
            <Route 
              path="/service/:id/book" 
              element={
                <ProtectedRoute>
                  <ServiceDetail mode="book" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/appointments" 
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
        <Toaster position="top-center" />
      </Router>
    </ThemeProvider>
  );
}
