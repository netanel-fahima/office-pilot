import { useState, useEffect } from "react";
import { Button, Card, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { doc, updateDoc } from "firebase/firestore";
import OtpInput from "react-otp-input";
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
  const [otp, setOtp] = useState("");
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

  const onVerify = async () => {
    if (otp.length !== 6) {
      message.error(t("auth.verify_phone.validation.code_length"));
      return;
    }

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
      setOtp("");
    }
  };

  return (
    <div className="verify-phone-container">
      <Card className="verify-phone-card">
        <h1 className="verify-phone-title">{t("auth.verify_phone.title")}</h1>
        <p className="verify-phone-subtitle">
          {t("auth.verify_phone.subtitle", { phoneNumber: phoneNumber })}
        </p>

        <div className="otp-container">
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            renderInput={(props) => <input {...props} />}
            inputStyle="otp-input"
            shouldAutoFocus
            inputType="tel"
            containerStyle="direction: ltr"
          />
        </div>

        <Button
          type="primary"
          onClick={onVerify}
          className="verify-button"
          loading={loading}
          block
        >
          {t("auth.verify_phone.buttons.verify")}
        </Button>

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
