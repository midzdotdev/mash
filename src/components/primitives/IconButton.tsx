import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const IconButton = (props: ComponentProps<"button">) => {
  return (
    <button
      type="button"
      {...props}
      className={twMerge(
        "flex-none rounded-md p-3 text-gray-300 transition-all",
        !props.disabled ? "hover:bg-gray-50 active:bg-gray-100" : "opacity-50",
        props.className,
      )}
    >
      {props.children}
    </button>
  );
};
