import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./hooks/useToast";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import PostListPage from "./pages/PostListPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostCreatePage from "./pages/PostCreatePage";
import PostEditPage from "./pages/PostEditPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Layout>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <PostListPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/posts/new"
                element={
                  <ProtectedRoute>
                    <PostCreatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/posts/:id"
                element={
                  <ProtectedRoute>
                    <PostDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/posts/:id/edit"
                element={
                  <ProtectedRoute>
                    <PostEditPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
