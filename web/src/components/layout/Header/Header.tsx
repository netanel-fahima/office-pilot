import { useEffect } from "react";
import { Layout, Avatar, Dropdown, Menu, Input, Button } from "antd";
import * as Icons from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useAuthStore } from "@src/store/authStore";
import "./Header.css";
import { useLayoutStore } from "@src/store/layoutStore";

const { Header } = Layout;

const AppHeader = () => {
  const { t } = useTranslation();
  const [{ HeaderItems }, actions] = useLayoutStore();
  const [{ systemUser }] = useAuthStore();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    actions.populateHeader();
  }, [actions]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part, index) => (index < 2 ? part[0] : ""))
      .join("")
      .toUpperCase();
  };

  const userFullName = systemUser?.fullName || t("userName", "משתמש");
  const userInitials = getInitials(userFullName);
  const userRole = systemUser?.role
    ? t(`admin.users.roles.${systemUser.role}`)
    : "";

  return (
    <Header className="app-header">
      <div className="header-left">
        <h2 className="logo">{t("appName")}</h2>
      </div>

      <div className="header-center">
        {HeaderItems.filter((item) => item.type === "input").map((item) => (
          <Input
            key={item.id}
            placeholder={t(`headerItems.${item.id}`, item.placeholder)}
            prefix={<Icons.SearchOutlined />}
            className={`search-input ${
              item.subtype === "search" ? "search-field" : ""
            }`}
          />
        ))}
      </div>

      <div className="header-right">
        {HeaderItems.filter((item) => item.type === "icon").map((item) => {
          const IconComponent =
            (Icons as any)[item.icon] || Icons.QuestionCircleOutlined;
          return <IconComponent key={item.id} className="header-icon" />;
        })}

        {HeaderItems.filter((item) => item.type === "button").map((item) => (
          <Button
            key={item.id}
            className="header-button"
            onClick={item.id === "logout" ? handleLogout : undefined}
          >
            {t(`headerItems.${item.id}`, item.label)}
          </Button>
        ))}

        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="profile" icon={<Icons.UserOutlined />}>
                {t("profile")}
              </Menu.Item>
              <Menu.Item
                key="logout"
                onClick={handleLogout}
                icon={<Icons.LogoutOutlined />}
              >
                {t("logout")}
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <div className="user-profile">
            <div className="user-name">
              <span className="user-role">{userRole}</span>
              <span className="user-full-name" title={userFullName}>
                {userFullName}
              </span>
            </div>
            <Avatar size="large" className="user-avatar">
              {userInitials.slice(0, 2)}
            </Avatar>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
