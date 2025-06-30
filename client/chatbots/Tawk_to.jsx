import { useEffect } from "react";

const TawkToChat = () => {
  useEffect(() => {
    const Tawk_API = window.Tawk_API || {};
    const Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = import.meta.env.VITE_TAWKTO_SCRIPT;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    document.head.appendChild(s1);

    return () => {
      // Optional script removing
      document.head.removeChild(s1);
    };
  }, []);

  return null;
};

export default TawkToChat;
