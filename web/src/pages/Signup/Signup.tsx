import { useState } from "react";
import { Form, Input, Button, Card, message, Select } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { db } from "@src/config/firebaseConfig";
import "./Signup.css";

const { Option } = Select;

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
}

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const [form] = Form.useForm();

  const onFinish = async (values: SignupFormData) => {
    setLoading(true);
    try {
      // יצירת משתמש ב-Firebase Auth
      const { user } = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // עדכון פרופיל המשתמש
      await updateProfile(user, {
        displayName: `${values.firstName} ${values.lastName}`,
      });

      // יצירת מסמך משתמש ב-Firestore
      const userDoc = doc(db, "users", user.uid);
      await setDoc(userDoc, {
        id: user.uid,
        firstName: values.firstName,
        lastName: values.lastName,
        fullName: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phoneNumber: values.phoneNumber,
        role: {
          name: values.role,
          description: `${values.role} role`,
        },
        permissions: [],
        accessList: [],
        createdDate: new Date(),
        lastModifiedDate: new Date(),
        isActive: true,
        phoneVerified: false,
      });

      // התנתקות מיידית כדי למנוע כניסה אוטומטית למערכת
      await signOut(auth);

      message.success("נרשמת בהצלחה! נא לאמת את מספר הטלפון");
      // העברה לדף אימות SMS עם מספר הטלפון
      navigate("/verify-phone", {
        state: {
          phoneNumber: values.phoneNumber,
          userId: user.uid,
          email: values.email,
          password: values.password,
        },
      });
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        message.error("כתובת האימייל כבר קיימת במערכת");
      } else {
        message.error("אירעה שגיאה בתהליך ההרשמה");
        console.error("Error during signup:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <Card className="signup-card">
        <h1 className="signup-title">הרשמה ל-Office Pilot</h1>
        <Form form={form} name="signup" onFinish={onFinish} layout="vertical">
          <div className="form-row">
            <Form.Item
              name="firstName"
              rules={[{ required: true, message: "נא להזין שם פרטי" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="שם פרטי"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              rules={[{ required: true, message: "נא להזין שם משפחה" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="שם משפחה"
                size="large"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "נא להזין אימייל" },
              { type: "email", message: "אימייל לא תקין" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="אימייל"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            rules={[
              { required: true, message: "נא להזין מספר טלפון" },
              { pattern: /^[0-9]{10}$/, message: "מספר טלפון לא תקין" },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="מספר טלפון"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            rules={[{ required: true, message: "נא לבחור תפקיד" }]}
          >
            <Select
              placeholder="בחר תפקיד"
              size="large"
              className="role-select"
            >
              <Option value="admin">מנהל מערכת</Option>
              <Option value="secretary">מזכיר/ה</Option>
              <Option value="sales">איש מכירות</Option>
              <Option value="agent">סוכן</Option>
              <Option value="assistant">עוזר/ת</Option>
              <Option value="other">אחר</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "נא להזין סיסמה" },
              { min: 6, message: "הסיסמה חייבת להכיל לפחות 6 תווים" },
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
