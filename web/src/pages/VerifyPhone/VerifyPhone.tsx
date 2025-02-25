import { useState, useEffect } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@src/config/firebaseConfig";
import "./VerifyPhone.css";

interface LocationState {
  phoneNumber: string;
  userId: string;
  email: string;
  password: string;
}

const VerifyPhone = () => {
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { phoneNumber, userId, email, password } =
    location.state as LocationState;
  const auth = getAuth();

  useEffect(() => {
    // שליחת קוד SMS בטעינת הדף
    sendVerificationCode();
    startTimer();
  }, []);

  const startTimer = () => {
    setTimer(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const sendVerificationCode = async () => {
    try {
      // כאן יש להוסיף את הלוגיקה לשליחת SMS
      // לדוגמה: שימוש בשירות SMS חיצוני או Firebase Phone Authentication
      console.log("Sending verification code to:", phoneNumber);
      message.success(t("auth.verify_phone.messages.code_sent"));
    } catch (error) {
      console.error("Error sending verification code:", error);
      message.error(t("auth.verify_phone.messages.error_invalid_code"));
    }
  };

  const onFinish = async (values: { code: string }) => {
    setLoading(true);
    try {
      // כאן יש להוסיף את הלוגיקה לאימות הקוד
      // לדוגמה: בדיקה מול שירות SMS או Firebase Phone Authentication

      // עדכון סטטוס אימות הטלפון ב-Firestore
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, {
        phoneVerified: true,
      });

      // כניסה למערכת
      await signInWithEmailAndPassword(auth, email, password);

      message.success(t("auth.verify_phone.messages.success"));
      navigate("/");
    } catch (error) {
      console.error("Error verifying code:", error);
      message.error(t("auth.verify_phone.messages.error_invalid_code"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (canResend) {
      sendVerificationCode();
      startTimer();
    }
  };

  // פונקציה לסינון קלט שאינו מספרי
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    e.target.value = value;
  };

  return (
    <div className="verify-phone-container">
      <Card className="verify-phone-card">
        <h1 className="verify-phone-title">{t("auth.verify_phone.title")}</h1>
        <p className="verify-phone-subtitle">
          {t("auth.verify_phone.subtitle", { phoneNumber: phoneNumber })}
        </p>

        <Form name="verifyPhone" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="code"
            rules={[
              {
                required: true,
                message: t("auth.verify_phone.validation.required_code"),
              },
              {
                len: 6,
                message: t("auth.verify_phone.validation.code_length"),
              },
              {
                pattern: /^\d+$/,
                message: t("auth.verify_phone.validation.numbers_only"),
              },
            ]}
          >
            <Input
              className="verification-code-input"
              maxLength={6}
              size="large"
              placeholder={t("auth.verify_phone.placeholders.code")}
              type="tel"
              onChange={handleCodeChange}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="verify-button"
              loading={loading}
              block
            >
              {t("auth.verify_phone.buttons.verify")}
            </Button>
          </Form.Item>
        </Form>

        <div className="resend-button">
          <Button type="link" onClick={handleResend} disabled={!canResend}>
            {t("auth.verify_phone.buttons.resend")}
          </Button>
          {!canResend && (
            <span className="timer">
              {t("auth.verify_phone.timer", { seconds: timer })}
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VerifyPhone;
