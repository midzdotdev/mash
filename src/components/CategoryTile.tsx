import { produce } from "limu";
import { FaCirclePlus, FaTrash } from "react-icons/fa6";
import { Input } from "./primitives/Input";
import { Category } from "../types";
import { CategoryOptionRow } from "./CategoryOptionRow";
import { IconButton } from "./primitives/IconButton";

export const AddCategory = (props: { onAdd: () => void }) => {
  return (
    <button
      type="button"
      onClick={props.onAdd}
      className="flex flex-1 basis-52 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-white p-5 text-2xl font-semibold text-gray-400 shadow-sm"
    >
      <FaCirclePlus />
      <span>Add Category</span>
    </button>
  );
};

interface CategoryProps {
  isEditable: boolean;
  category: Category;
  onRemoveCategory: () => void;
  onTitleChange: (value: Category["title"]) => void;
  onOptionsChange: (value: Category["options"]) => void;
}

export const CategoryTile = (props: CategoryProps) => {
  return (
    <div className="flex flex-1 basis-52 flex-col gap-2 rounded-xl bg-white p-2 shadow-sm">
      <div className="flex items-center gap-1">
        <Input
          value={props.category.title}
          placeholder="Category Title"
          onInput={(e) => props.onTitleChange(e.currentTarget.value)}
          className="flex-1 text-2xl font-semibold"
          disabled={!props.isEditable}
        />

        <IconButton
          title="Remove Category"
          disabled={!props.isEditable}
          onClick={props.onRemoveCategory}
        >
          <FaTrash />
        </IconButton>
      </div>

      <div className="flex flex-col">
        {/*
          Include the "Add Option" row here to maintain focus when adding on first key press.
          Also, note the key prop of "Add Option" must match the key of the newly added option from state.
        */}
        {Array.from({ length: props.category.options.length + 1 }).map(
          (_, i) => (
            <CategoryOptionRow
              key={i}
              isEditable={props.isEditable}
              categoryOption={props.category.options[i] ?? "new"}
              onRemoveOption={() => {
                props.onOptionsChange(
                  produce(props.category.options, (options) => {
                    options.splice(i, 1);
                  }),
                );
              }}
              onNameChange={(value) => {
                props.onOptionsChange(
                  produce(props.category.options, (options) => {
                    options[i] ??= { name: "", status: null };
                    options[i].name = value;
                  }),
                );
              }}
              onBlur={() => {
                // remove item if blank
                if (props.category.options[i]?.name.trim() === "") {
                  props.onOptionsChange(
                    produce(props.category.options, (options) => {
                      options.splice(i, 1);
                    }),
                  );
                }
              }}
            />
          ),
        )}
      </div>
    </div>
  );
};
