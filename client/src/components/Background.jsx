import React from "react";

export default function Background({ children }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="src/assets/images/background.jpg"
          alt="Background"
          className="w-full h-full object-cover filter blur-sm brightness-75 scale-110"
        />
      </div>
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
