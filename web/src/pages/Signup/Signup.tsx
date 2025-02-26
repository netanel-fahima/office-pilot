import { useState, useEffect } from "react";
import { Form, Input, Button, Card, message } from "antd";
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
import { useTranslation } from "react-i18next";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { db } from "@src/config/firebaseConfig";
import "./Signup.css";

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const inviteCode = searchParams.get("invite");

  useEffect(() => {
    if (!inviteCode) {
      navigate("/login");
    }
  }, [inviteCode, navigate]);

  const validateInvite = async (code: string) => {
    const invitesRef = collection(db, "userInvites");
    const q = query(
      invitesRef,
      where("managerSentCode", "==", code),
      where("claimed", "==", false),
      where("email", "==", form.getFieldValue("email"))
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty ? snapshot.docs[0] : null;
  };

  const onFinish = async (values: SignupFormData) => {
    setLoading(true);
    try {
      const invite = await validateInvite(inviteCode!);
      if (!invite) {
        throw new Error(t("auth.signup.messages.error_code_not_found"));
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
        username:
          inviteData.username || `${values.firstName} ${values.lastName}`,
        managerSentCode: inviteCode,
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

      message.success(t("auth.signup.messages.success"));
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
        message.error(t("auth.signup.messages.error_email_exists"));
      } else {
        message.error(error.message || t("auth.signup.messages.error_general"));
        console.error("Error during signup:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <Card className="signup-card">
        <h1 className="signup-title">{t("auth.signup.title")}</h1>
        <Form form={form} name="signup" onFinish={onFinish} layout="vertical">
          <div className="form-row">
            <Form.Item
              name="firstName"
              rules={[
                {
                  required: true,
                  message: t("auth.signup.validation.required_first_name"),
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t("auth.signup.placeholders.first_name")}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              rules={[
                {
                  required: true,
                  message: t("auth.signup.validation.required_last_name"),
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t("auth.signup.placeholders.last_name")}
                size="large"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: t("auth.signup.validation.required_email"),
              },
              {
                type: "email",
                message: t("auth.signup.validation.invalid_email"),
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder={t("auth.signup.placeholders.email")}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            rules={[
              {
                required: true,
                message: t("auth.signup.validation.required_phone"),
              },
              {
                pattern: /^[0-9]{10}$/,
                message: t("auth.signup.validation.invalid_phone"),
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder={t("auth.signup.placeholders.phone")}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: t("auth.signup.validation.required_password"),
              },
              { min: 6, message: t("auth.signup.validation.password_length") },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("auth.signup.placeholders.password")}
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
              {t("auth.signup.buttons.signup")}
            </Button>
          </Form.Item>

          <div className="login-link">
            {t("auth.login.signup_prompt")}{" "}
            <Link to="/login">{t("auth.signup.buttons.login")}</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Signup;
