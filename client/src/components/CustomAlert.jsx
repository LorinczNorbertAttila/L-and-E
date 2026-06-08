import React from "react";
import ReactDOM from "react-dom";
import { CircleCheckBig, CircleAlert } from "lucide-react";

export default function CustomAlert({ error, message, open }) {
  return ReactDOM.createPortal(
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-9999 w-full max-w-fit px-4 transition-all duration-300 ease-in-out ${
        open
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      {error ? (
        <div className="bg-red-200 px-6 py-4 mx-2 my-4 rounded-md text-lg flex items-center max-w-lg">
          <CircleAlert className="text-red-800 w-5 h-5 mr-3" />
          <span className="text-red-800">{message}</span>
        </div>
      ) : (
        <div className="bg-green-200 px-6 py-4 mx-2 my-4 rounded-md text-lg flex items-center max-w-lg">
          <CircleCheckBig className="text-green-800 w-5 h-5 mr-3" />
          <span className="text-green-800">{message}</span>
        </div>
      )}
    </div>,
    document.body, // rendering to DOM body
  );
}
