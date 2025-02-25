import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const onFinish = async (values: { email: string; password: string; name: string }) => {
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      
      await updateProfile(user, {
        displayName: values.name
      });

      message.success('נרשמת בהצלחה!');
      navigate('/');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        message.error('כתובת האימייל כבר קיימת במערכת');
      } else {
        message.error('אירעה שגיאה בתהליך ההרשמה');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <Card className="signup-card">
        <h1 className="signup-title">הרשמה ל-Office Pilot</h1>
        <Form
          name="signup"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'נא להזין שם מלא' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="שם מלא"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'נא להזין אימייל' },
              { type: 'email', message: 'אימייל לא תקין' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="אימייל"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'נא להזין סיסמה' },
              { min: 6, message: 'הסיסמה חייבת להכיל לפחות 6 תווים' }
            ]}
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
              className="signup-button"
              loading={loading}
              block
            >
              הרשמה
            </Button>
          </Form.Item>

          <div className="login-link">
            כבר יש לך חשבון? <Link to="/login">התחבר כאן</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Signup;