import { useEffect } from "react";

const FreshChat = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = import.meta.env.VITE_FRESHCHAT_SCRIPT;
    script.setAttribute("chat", "true");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // clear
    };
  }, []);

  return null;
};

export default FreshChat;
