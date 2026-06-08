import { useRef } from "react";

/**
 * RippleButton - A button component that adds a ripple effect on click
 *
 * @param {string} variant - Button style variant: 'primary', 'secondary', 'danger', 'default'
 * @param {string} rippleColor - Override ripple color (e.g., 'rgba(255,255,255,0.5)')
 * @param {number} rippleDuration - Ripple animation duration in ms (default: 600)
 * @param {boolean} disabled - Disable the button
 * @param {string} className - Additional CSS classes
 * @param {function} onClick - Click handler
 * @param {ReactNode} children - Button content
 * @param {...props} rest - Other HTML button props
 */
const RippleButton = ({
  variant = "default",
  rippleColor,
  rippleDuration = 600,
  disabled = false,
  className = "",
  onClick,
  children,
  ...rest
}) => {
  const buttonRef = useRef(null);

  // Variant to ripple color mapping
  const variantRippleColors = {
    primary: "rgba(255, 255, 255, 0.5)", // White ripple on teal
    secondary: "rgba(0, 0, 0, 0.2)", // Dark ripple on gray
    danger: "rgba(255, 255, 255, 0.5)", // White ripple on red
    default: "rgba(255, 255, 255, 0.5)", // White ripple by default
  };

  const getRippleColor = () => {
    if (rippleColor) return rippleColor;
    return variantRippleColors[variant] || variantRippleColors.default;
  };

  const handleClick = (e) => {
    if (disabled) return;

    const button = buttonRef.current;
    if (!button) return;

    // Get click position relative to button
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create ripple element
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.setProperty("--ripple-x", `${x}px`);
    ripple.style.setProperty("--ripple-y", `${y}px`);
    ripple.style.setProperty("--ripple-color", getRippleColor());
    ripple.style.setProperty("--ripple-duration", `${rippleDuration}ms`);

    // Add ripple to button
    button.appendChild(ripple);

    // Remove ripple after animation completes
    setTimeout(() => {
      ripple.remove();
    }, rippleDuration);

    // Call original onClick handler
    if (onClick) onClick(e);
  };

  // Build className based on variant
  const variantClasses = {
    primary:
      "text-white shadow-md shadow-gray-900/10 hover:shadow-gray-900/20 hover:shadow-lg cursor-pointer font-bold uppercase text-xs rounded-md transition",
    secondary:
      "border border-gray-700 text-gray-700 hover:opacity-75 cursor-pointer font-bold uppercase text-xs rounded-md transition",
    danger: "text-white hover:bg-red-100 cursor-pointer transition",
    icon: "w-10 h-10 rounded-lg cursor-pointer hover:bg-gray-900/10 flex items-center justify-center transition",
    default: "cursor-pointer transition",
  };

  const baseClasses = variantClasses[variant] || variantClasses.default;
  const disabledClasses = disabled
    ? "disabled:opacity-50 disabled:pointer-events-none"
    : "";
  const finalClassName =
    `${baseClasses} ${disabledClasses} ${className}`.trim();

  // For touch events (mobile), use touchstart
  const handleTouchStart = (e) => {
    if (disabled) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.setProperty("--ripple-x", `${x}px`);
    ripple.style.setProperty("--ripple-y", `${y}px`);
    ripple.style.setProperty("--ripple-color", getRippleColor());
    ripple.style.setProperty("--ripple-duration", `${rippleDuration}ms`);

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, rippleDuration);
  };

  // Render as HTML button element
  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      disabled={disabled}
      className={`ripple-container ${finalClassName}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
};

export default RippleButton;
