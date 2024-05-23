import { twMerge } from "tailwind-merge";
import { Input } from "./primitives/Input";
import { FaSquareMinus } from "react-icons/fa6";
import { CategoryOption } from "../types";
import { IconButton } from "./primitives/IconButton";

interface CategoryOptionProps {
  isEditable: boolean;
  categoryOption: CategoryOption | "new";
  onRemoveOption: () => void;
  onNameChange: (value: CategoryOption["name"]) => void;
  onBlur: () => void;
}

export const CategoryOptionRow = (props: CategoryOptionProps) => {
  const categoryOption =
    props.categoryOption === "new"
      ? { name: "", status: null }
      : props.categoryOption;

  return (
    <div className="flex items-center gap-1">
      <Input
        value={categoryOption.name}
        placeholder="Add Option"
        onInput={(e) => props.onNameChange(e.currentTarget.value)}
        onBlur={props.onBlur}
        className={twMerge(
          "text-md flex-1 font-medium",
          categoryOption.status === "eliminated" &&
            "bg-red-300 line-through opacity-70",
          categoryOption.status === "current" && "bg-amber-200",
          categoryOption.status === "final" && "bg-green-300",
          !props.isEditable && props.categoryOption === "new" && "opacity-0",
        )}
        disabled={!props.isEditable}
      />

      {props.categoryOption !== "new" && (
        <IconButton
          disabled={!props.isEditable}
          title="Remove Option"
          onClick={props.onRemoveOption}
        >
          <FaSquareMinus />
        </IconButton>
      )}
    </div>
  );
};
