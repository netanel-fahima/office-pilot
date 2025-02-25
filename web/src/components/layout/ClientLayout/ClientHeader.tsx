import React, { useEffect } from "react";
import { Menu, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useLayoutStore } from "@src/store/layoutStore";

const ClientHeader: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [{ clientMenuItems }] = useLayoutStore();

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[location.pathname]}
      style={{ direction: "rtl" }}
    >
      {clientMenuItems.map((item) => (
        <Menu.Item key={item.path}>
          <Link to={item.path}>{t(`client-menu.${item.label}`)}</Link>
        </Menu.Item>
      ))}
    </Menu>
  );
};

export default ClientHeader;
