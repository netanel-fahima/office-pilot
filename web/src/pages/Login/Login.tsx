import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      message.success('התחברת בהצלחה!');
      navigate('/');
    } catch (error: any) {
      message.error('שם משתמש או סיסמה שגויים');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <h1 className="login-title">Office Pilot</h1>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'נא להזין אימייל' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="אימייל"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'נא להזין סיסמה' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="סיסמה"
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
              התחבר
            </Button>
          </Form.Item>

          <div className="signup-link">
            אין לך חשבון? <Link to="/signup">הירשם כאן</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;