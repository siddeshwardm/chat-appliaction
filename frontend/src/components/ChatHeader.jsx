import { ChevronLeft, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const handleMobileBack = () => {
    if (typeof window === "undefined") return setSelectedUser(null);

    const state = window.history?.state;
    // If we created a history entry for the open chat, go back so the
    // device/browser back button and UI back button stay in sync.
    if (state && state.__chatOpen) {
      window.history.back();
      return;
    }

    setSelectedUser(null);
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button (mobile/tablet) */}
          <button
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={handleMobileBack}
            type="button"
            aria-label="Back"
          >
            <ChevronLeft />
          </button>

          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button className="hidden lg:inline-flex" onClick={() => setSelectedUser(null)} type="button">
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
