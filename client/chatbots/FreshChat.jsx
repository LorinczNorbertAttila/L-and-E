import { useEffect } from "react";

const FreshChat = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//eu.fw-cdn.com/13118087/1068627.js";
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
