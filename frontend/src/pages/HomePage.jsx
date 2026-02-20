import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const isSmallScreen = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(max-width: 1023px)")?.matches ?? false;
};

const HomePage = () => {
  const { selectedUser } = useChatStore();

  // Mobile back button support:
  // - When a chat opens on small screens, push a history state marker.
  // - When the user presses the device/browser back button, clear the selected chat.
  useEffect(() => {
    if (!isSmallScreen()) return;

    const onPopState = () => {
      const state = useChatStore.getState();
      if (state.selectedUser) {
        state.setSelectedUser(null);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!isSmallScreen()) return;

    const currentState = window.history.state || {};

    if (selectedUser && !currentState.__chatOpen) {
      window.history.pushState({ ...currentState, __chatOpen: true }, "", window.location.href);
      return;
    }

    // If the chat was closed without navigating back, remove the marker
    if (!selectedUser && currentState.__chatOpen) {
      const { __chatOpen, ...rest } = currentState;
      window.history.replaceState(rest, "", window.location.href);
    }
  }, [selectedUser]);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            <div className={selectedUser ? "flex flex-1" : "hidden lg:flex lg:flex-1"}>
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
