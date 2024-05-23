import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "primary" | "secondary";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue-500",
  secondary: "bg-gray-500",
};

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
}

export const Button = (props: ButtonProps) => {
  return (
    <button
      type="button"
      {...props}
      className={twMerge(
        "rounded-md px-4 py-2 font-medium text-white",
        variantClasses[props.variant ?? "primary"],
        props.disabled && "cursor-not-allowed opacity-50",
        props.className,
      )}
    >
      {props.children}
    </button>
  );
};
