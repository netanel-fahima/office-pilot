import { useEffect, useState } from "react";
import { Image, Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import * as Icons from "@ant-design/icons"; // יבוא כל האייקונים
import { useTranslation } from "react-i18next";
import "./Sidebar.css";
import { useLayoutStore } from "@src/store/layoutStore";
import menuIcon from "@src/assets/logo.png";

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [{ menuItems }, actions] = useLayoutStore();
  const { t } = useTranslation();

  useEffect(() => {
    actions.populateSideBar();
  }, [actions]);

  return (
    <Sider
      collapsed={collapsed}
      onCollapse={() => setCollapsed(!collapsed)}
      className={`sidebar-container ${collapsed ? "collapsed" : ""}`}
      breakpoint="lg"
    >
      <div className="toggle-button" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? (
          <Image src={menuIcon} alt="menu" preview={false} />
        ) : (
          <Image width={100} src={menuIcon} alt="menu" preview={false} />
        )}
      </div>
      <Menu mode="inline" theme="light" className="rtl-menu">
        {menuItems.map(({ id, title, icon, path }) => {
          const IconComponent = (Icons as any)[icon] || Icons.AppstoreOutlined;
          return (
            <Menu.Item key={id} icon={<IconComponent />}>
              <Link to={path}>{!collapsed && t(`menus.${title}`)}</Link>
            </Menu.Item>
          );
        })}
      </Menu>
    </Sider>
  );
};

export default Sidebar;
