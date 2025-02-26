import { useEffect, useState } from "react";
import { Image, Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import * as Icons from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Can } from "@src/components/AbilityContext";
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

  const renderMenuItems = (items: any[]) => {
    return items.map((item) => {
      const IconComponent = (Icons as any)[item.icon] || Icons.AppstoreOutlined;

      if (item.children) {
        return item.name === "admin" ? (
          <Can I="manage" a="User" key={item.path}>
            <Menu.SubMenu
              key={item.path}
              icon={<IconComponent />}
              title={t(`menus.${item.title}`)}
            >
              {renderMenuItems(item.children)}
            </Menu.SubMenu>
          </Can>
        ) : (
          <Menu.SubMenu
            key={item.path}
            icon={<IconComponent />}
            title={t(`menus.${item.title}`)}
          >
            {renderMenuItems(item.children)}
          </Menu.SubMenu>
        );
      }

      return (
        <Menu.Item key={item.path} icon={<IconComponent />}>
          <Link to={item.path}>{!collapsed && t(`menus.${item.title}`)}</Link>
        </Menu.Item>
      );
    });
  };

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
        {renderMenuItems(menuItems)}
      </Menu>
    </Sider>
  );
};

export default Sidebar;
