import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { axiosInstance } from "./lib/axios";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    // Goal: keep login across refresh/new tabs, but require login after closing & reopening the browser.
    // Approach: Only auto-restore auth if we can prove there is another active tab right now.
    // If not, proactively clear the cookie session so the app asks to log in.
    const SESSION_KEY = "chatapp:session:active";
    const CHANNEL = "chatapp:session";

    const alreadyActiveInThisTab = sessionStorage.getItem(SESSION_KEY) === "1";
    if (alreadyActiveInThisTab) {
      checkAuth();
      return;
    }

    let didHearFromOtherTab = false;
    let bc;

    const tryBroadcastChannel = () => {
      if (typeof window === "undefined") return;
      if (typeof window.BroadcastChannel !== "function") return;

      bc = new window.BroadcastChannel(CHANNEL);
      bc.onmessage = (event) => {
        const data = event?.data;
        if (data?.type === "session:pong") {
          didHearFromOtherTab = true;
        }
        if (data?.type === "session:ping") {
          // Reply if this tab is already active.
          if (sessionStorage.getItem(SESSION_KEY) === "1") {
            bc.postMessage({ type: "session:pong" });
          }
        }
      };
      bc.postMessage({ type: "session:ping" });
    };

    tryBroadcastChannel();

    const timer = window.setTimeout(async () => {
      try {
        if (didHearFromOtherTab) {
          sessionStorage.setItem(SESSION_KEY, "1");
          checkAuth();
          return;
        }

        // No other active tab: treat this as a fresh browser reopen.
        // Clear server cookie so user must log in again.
        try {
          await axiosInstance.post("/auth/logout");
        } catch {
          // ignore
        }
        useAuthStore.setState({ authUser: null, isCheckingAuth: false });
        useAuthStore.getState().disconnectSocket?.();
      } finally {
        try {
          bc?.close?.();
        } catch {
          // ignore
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      try {
        bc?.close?.();
      } catch {
        // ignore
      }
    };
  }, [checkAuth]);

  // Mark this tab as active once we have an authenticated user.
  useEffect(() => {
    if (authUser) {
      sessionStorage.setItem("chatapp:session:active", "1");
    }
  }, [authUser]);

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : isCheckingAuth ? <Navigate to="/login" /> : <Navigate to="/login" />}
        />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
