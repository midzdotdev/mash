import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const Input = (props: ComponentProps<"input">) => (
  <input
    size={1}
    {...props}
    className={twMerge(
      "overflow-ellipsis rounded-md px-2 py-1 outline outline-0 outline-gray-200 transition-all",
      !props.disabled && "hover:bg-gray-50 focus:bg-gray-50 focus:outline-2",
      props.className,
    )}
  />
);
