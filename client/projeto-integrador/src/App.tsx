import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "@/components/landing/LandingPage";
import { SobrePage } from "@/components/landing/SobrePage";
import { LoginPage } from "@/components/auth/LoginPage";
import { RegisterPage } from "@/components/auth/RegisterPage";
import { MainPage } from "@/components/main/MainPage";
import { SavedRoutesPage } from "@/components/main/SavedRoutesPage";
import { SharedRoutePage } from "@/components/main/SharedRoutePage";
import { Toaster } from "@/components/ui/sonner";

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const isLoggedIn =
    localStorage.getItem("facilitavoos_is_logged_in") === "true";
  const userId = localStorage.getItem("facilitavoos_user_id");
  if (!isLoggedIn || !userId) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sobre" element={<SobrePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rota-compartilhada/:codigo" element={<SharedRoutePage />} />
        <Route
          path="/escolha-viagem"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rotas-salvas"
          element={
            <ProtectedRoute>
              <SavedRoutesPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
