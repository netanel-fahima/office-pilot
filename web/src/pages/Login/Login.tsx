import { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const { t } = useTranslation();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      message.success(t("auth.login.messages.success"));
      navigate("/");
    } catch (error: any) {
      message.error(t("auth.login.messages.error_invalid_credentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <h1 className="login-title">{t("appName")}</h1>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: t("auth.login.validation.required_email"),
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t("auth.login.placeholders.email")}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: t("auth.login.validation.required_password"),
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("auth.login.placeholders.password")}
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              loading={loading}
              block
            >
              {t("auth.login.buttons.login")}
            </Button>
          </Form.Item>

          <div className="signup-link">
            {t("auth.login.signup_prompt")}{" "}
            <Link to="/signup">{t("auth.login.buttons.signup")}</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
