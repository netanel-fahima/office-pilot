import { useState, useEffect } from "react";
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
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { db } from "@src/config/firebaseConfig";
import { validateInviteCode } from "@src/utils/userUtils";
import "./Signup.css";

const { Option } = Select;

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  inviteCode: string;
}

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("invite");

  useEffect(() => {
    if (inviteCode) {
      form.setFieldsValue({ inviteCode });
    }
  }, [inviteCode, form]);

  const validateInvite = async (code: string) => {
    const invitesRef = collection(db, "userInvites");
    const q = query(
      invitesRef,
      where("managerSentCode", "==", code),
      where("claimed", "==", false)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty ? snapshot.docs[0] : null;
  };

  const onFinish = async (values: SignupFormData) => {
    setLoading(true);
    try {
      // בדיקת קוד ההזמנה
      if (!validateInviteCode(values.inviteCode)) {
        throw new Error("קוד הזמנה לא תקין");
      }

      const invite = await validateInvite(values.inviteCode);
      if (!invite) {
        throw new Error("קוד ההזמנה לא נמצא או כבר נוצל");
      }

      const inviteData = invite.data();

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
        username: inviteData.username,
        managerSentCode: values.inviteCode,
        firstName: values.firstName,
        lastName: values.lastName,
        fullName: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phoneNumber: values.phoneNumber,
        role: inviteData.role,
        permissions: [],
        accessList: [],
        createdDate: new Date(),
        lastModifiedDate: new Date(),
        isActive: true,
        phoneVerified: false,
      });

      // סימון ההזמנה כנוצלה
      await setDoc(doc(db, "userInvites", invite.id), {
        ...inviteData,
        claimed: true,
        claimedBy: user.uid,
        claimedDate: new Date(),
      });

      // התנתקות מיידית
      await signOut(auth);

      message.success("נרשמת בהצלחה! נא לאמת את מספר הטלפון");
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
        message.error(error.message || "אירעה שגיאה בתהליך ההרשמה");
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
            name="inviteCode"
            rules={[
              { required: true, message: "נא להזין קוד הזמנה" },
              {
                validator: async (_, value) => {
                  if (!validateInviteCode(value)) {
                    throw new Error("קוד הזמנה לא תקין");
                  }
                },
              },
            ]}
          >
            <Input placeholder="קוד הזמנה" size="large" />
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
