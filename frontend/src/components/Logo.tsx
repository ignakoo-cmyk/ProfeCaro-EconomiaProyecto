import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  lightText?: boolean;
}

export const LogoIcon = ({ className = "h-8 w-8" }: { className?: string }) => {
  return (
    <img
      src="/rsc/logo.png"
      alt="VentanaWork Logo"
      className={`${className} object-contain`}
    />
  );
};

export const Logo = ({
  className = "",
  iconOnly = false,
  size = "md",
  lightText = false,
}: LogoProps) => {
  const sizeClasses = {
    sm: { icon: "h-6 w-6", text: "text-lg" },
    md: { icon: "h-9 w-9", text: "text-xl" },
    lg: { icon: "h-12 w-12", text: "text-2xl" },
    xl: { icon: "h-16 w-16", text: "text-3xl" },
  };

  const currentSize = sizeClasses[size];

  if (iconOnly) {
    return <LogoIcon className={`${currentSize.icon} ${className}`} />;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoIcon className={currentSize.icon} />
      <span
        className={`${currentSize.text} font-black tracking-tight select-none`}
      >
        <span className={lightText ? "text-white" : "text-[--focusgap-navy]"}>
          Ventana
        </span>
        <span className="text-[--focusgap-cyan]">
          Work
        </span>
      </span>
    </div>
  );
};
