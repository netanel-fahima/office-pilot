import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import { AbilityContext } from "./components/AbilityContext";
import { defineAbilityFor } from "./config/ability";
import Sidebar from "./components/layout/Sidebar/Sidebar";
import Dashboard from "./pages/Dashboard/Dashboard";
import AppHeader from "./components/layout/Header/Header";
import ClientLayout from "./components/layout/ClientLayout/ClientLayout";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import VerifyPhone from "./pages/VerifyPhone/VerifyPhone";
import { useAuthStore } from "./store/authStore";
import AdminUserManagement from "./pages/AdminUserManagement/AdminUserManagement";
import AuthGuard from "./components/AuthGuard/AuthGuard";

const { Content } = Layout;

export default function App() {
  const [{ user }] = useAuthStore();
  const ability = defineAbilityFor(user?.role);

  return (
    <Router>
      <AbilityContext.Provider value={ability}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-phone" element={<VerifyPhone />} />
          <Route
            path="/*"
            element={
              <AuthGuard>
                <Layout dir="rtl">
                  <Sidebar />
                  <Layout>
                    <AppHeader />
                    <Content className="content">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="events" element={<Dashboard />} />
                        <Route
                          path="admin/users"
                          element={<AdminUserManagement />}
                        />
                        <Route path="*" element={<h1>🔍 דף לא נמצא</h1>} />
                        <Route path="client/*" element={<ClientLayout />}>
                          <Route path="events" element={<Dashboard />} />
                          <Route path="reports" element={<Dashboard />} />
                        </Route>
                      </Routes>
                    </Content>
                  </Layout>
                </Layout>
              </AuthGuard>
            }
          />
        </Routes>
      </AbilityContext.Provider>
    </Router>
  );
}
