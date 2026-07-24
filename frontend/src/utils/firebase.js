import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopmentMode123456",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "parxee-city-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "parxee-city-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "parxee-city-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475610",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475610:web:abc123def4567890"
};

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Recaptcha Verifier helper
export const initRecaptcha = (buttonOrContainerId) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonOrContainerId, {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved - allow signInWithPhoneNumber
      },
      'expired-callback': () => {
        // Reset reCAPTCHA if expired
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.render().then((widgetId) => {
            window.grecaptcha.reset(widgetId);
          });
        }
      }
    });
  }
  return window.recaptchaVerifier;
};

// Send Phone OTP helper
export const sendPhoneOtp = async (phoneNumber, containerId = 'recaptcha-container') => {
  try {
    const appVerifier = initRecaptcha(containerId);
    
    // Ensure phone number starts with country code (+91 by default if missing)
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone.replace(/\D/g, '');
    }

    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    window.confirmationResult = confirmationResult;
    return { success: true, confirmationResult, formattedPhone };
  } catch (error) {
    console.error('Firebase Phone Auth Error:', error);
    // Reset recaptcha if failed so user can try again
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      } catch (e) {
        // ignore reset error
      }
    }
    throw error;
  }
};

// Verify Phone OTP helper
export const verifyPhoneOtp = async (code) => {
  if (!window.confirmationResult) {
    throw new Error('No pending OTP request found. Please request OTP again.');
  }
  const result = await window.confirmationResult.confirm(code);
  const user = result.user;
  const token = await user.getIdToken();
  return { user, token };
};
