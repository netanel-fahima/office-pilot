import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Sidebar from "./components/layout/Sidebar/Sidebar";
import Dashboard from "./pages/Dashboard/Dashboard";
import AppHeader from "./components/layout/Header/Header";
import ClientLayout from "./components/layout/ClientLayout/ClientLayout";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import AuthGuard from "./components/AuthGuard/AuthGuard";

const { Content } = Layout;

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
    </Router>
  );
}