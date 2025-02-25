import React, { useEffect } from "react";
import { Layout, Spin } from "antd";
import { Outlet } from "react-router-dom";
import ClientHeader from "./ClientHeader";
import { useLayoutStore } from "@src/store/layoutStore";

const { Header, Content } = Layout;

const ClientLayout: React.FC = () => {
  const [{ loadingClientMenu: loading }, action] = useLayoutStore();

  useEffect(() => {
    action.populateClientHeader();
  }, []);

  if (loading)
    return (
      <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
    );

  return (
    <Layout style={{ minHeight: "100vh", direction: "rtl" }}>
      <Header style={{ background: "#fff", padding: "0 20px" }}>
        <ClientHeader />
      </Header>
      <Content style={{ padding: "20px" }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default ClientLayout;
