import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "pern-classplus.firebaseapp.com",
  projectId: "pern-classplus",
  storageBucket: "pern-classplus.appspot.com",
  messagingSenderId: "289492822943",
  appId: "1:289492822943:web:db767523225828b0a3ebaa",
  measurementId: "G-EJ57YRLWLX",
};

export const app = initializeApp(firebaseConfig);
