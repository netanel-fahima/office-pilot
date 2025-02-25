import { useState, useEffect } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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
      message.success("קוד אימות נשלח בהצלחה");
    } catch (error) {
      console.error("Error sending verification code:", error);
      message.error("שגיאה בשליחת קוד האימות");
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

      message.success("מספר הטלפון אומת בהצלחה!");
      navigate("/");
    } catch (error) {
      console.error("Error verifying code:", error);
      message.error("קוד האימות שגוי");
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
        <h1 className="verify-phone-title">אימות מספר טלפון</h1>
        <p className="verify-phone-subtitle">
          קוד אימות נשלח למספר {phoneNumber}
        </p>

        <Form name="verifyPhone" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="code"
            rules={[
              { required: true, message: "נא להזין את קוד האימות" },
              { len: 6, message: "קוד האימות חייב להכיל 6 ספרות" },
              { pattern: /^\d+$/, message: "יש להזין מספרים בלבד" },
            ]}
          >
            <Input
              className="verification-code-input"
              maxLength={6}
              size="large"
              placeholder="000000"
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
              אמת קוד
            </Button>
          </Form.Item>
        </Form>

        <div className="resend-button">
          <Button type="link" onClick={handleResend} disabled={!canResend}>
            שלח קוד חדש
          </Button>
          {!canResend && <span className="timer">{timer} שניות</span>}
        </div>
      </Card>
    </div>
  );
};

export default VerifyPhone;
