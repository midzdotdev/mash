import { ComponentProps, useCallback, useRef, useState } from "react";
import { AddCategory, CategoryTile } from "./components/CategoryTile";
import { createDraft, finishDraft, produce } from "limu";
import { Category, EliminationStatus } from "./types";
import { MASH, mashKeys } from "./components/MASH";
import { useInterval } from "./hooks/useInterval";
import { ELIMINATION_INTERVAL } from "./constants";
import { twMerge } from "tailwind-merge";
import { Button } from "./components/primitives/Button";

const initCategories = (
  categoryInit: {
    title: string;
    options: string[];
  }[],
) =>
  categoryInit.map<Category>((x) => ({
    title: x.title,
    options: x.options.map((x) => ({ name: x, status: null })),
  }));

type EliminationTarget = {
  get: () => EliminationStatus;
  set: (value: EliminationStatus) => void;
};

const exampleCategories: Category[] = initCategories([
  {
    title: "Partner",
    options: ["Spongebob", "Patrick", "Squidward", "Sandy"],
  },
  {
    title: "Children",
    options: ["None", "1", "2", "3", "50"],
  },
  {
    title: "Job",
    options: ["Doctor", "Teacher", "Engineer", "Garbage Collector"],
  },
  {
    title: "Salary",
    options: ["$1,000,000", "$200,000", "$5,000", "$1"],
  },
  {
    title: "City",
    options: ["Miami", "London", "Paris", "Mars"],
  },
  {
    title: "Car",
    options: ["Tesla", "Toyota", "Ford", "G-Wiz"],
  },
]);

const initialMashStates = {
  mansion: null,
  apartment: null,
  shack: null,
  house: null,
};

function App() {
  const [mashStates, setMashStates] =
    useState<ComponentProps<typeof MASH>["states"]>(initialMashStates);

  const [categories, setCategories] = useState<Category[]>([]);

  interface Position {
    groupIndex: number;
    targetIndex: number;
  }

  const eqPosition = (a: Position, b: Position) =>
    a.groupIndex === b.groupIndex && a.targetIndex === b.targetIndex;

  const [position, setPosition] = useState<Position | null>(null);

  const incrementPosition = useCallback(
    (eliminationGroups: EliminationTarget[][], position: Position) => {
      // increment targetIndex if not last in group
      if (
        position.targetIndex + 1 <
        eliminationGroups[position.groupIndex].length
      ) {
        return {
          groupIndex: position.groupIndex,
          targetIndex: position.targetIndex + 1,
        };
      }

      // increment groupIndex if not last group
      if (position.groupIndex + 1 < eliminationGroups.length) {
        return {
          groupIndex: position.groupIndex + 1,
          targetIndex: 0,
        };
      }

      // otherwise tick over to the first target of the first group
      return {
        groupIndex: 0,
        targetIndex: 0,
      };
    },
    [position],
  );

  const [magicNumber, setMagicNumber] = useState(3);

  const [mode, setMode] = useState<"eliminating" | "finished" | null>(null);

  const sinceLastElimination = useRef(0);

  useInterval(
    () => {
      if (!mode) return;

      if (position === null) {
        setPosition({
          groupIndex: 0,
          targetIndex: 0,
        });

        sinceLastElimination.current = 1;

        return;
      }

      const mashStatesDraft = createDraft(mashStates);
      const categoriesDraft = createDraft(categories);

      const eliminationGroups = [
        mashKeys.map<EliminationTarget>((key) => ({
          get: () => mashStatesDraft[key],
          set: (value) => {
            mashStatesDraft[key] = value;
          },
        })),

        ...categoriesDraft.map(({ options }) =>
          options.map<EliminationTarget>((option) => ({
            get: () => option.status,
            set: (value) => {
              option.status = value;
            },
          })),
        ),
      ];

      if (sinceLastElimination.current === magicNumber) {
        // eliminate the current target
        const target =
          eliminationGroups[position.groupIndex][position.targetIndex];
        target.set("eliminated");
        sinceLastElimination.current = 0;

        // check if there is only one option left in the group
        const remainingTargets = eliminationGroups[position.groupIndex].filter(
          (x) => x.get() !== "eliminated" && x.get() !== "final",
        );

        if (remainingTargets.length === 1) {
          remainingTargets[0].set("final");
        }
      }

      const nextPosition = (() => {
        for (
          let pos = incrementPosition(eliminationGroups, position);
          !eqPosition(pos, position);
          pos = incrementPosition(eliminationGroups, pos)
        ) {
          const targetState =
            eliminationGroups[pos.groupIndex][pos.targetIndex].get();

          if (targetState === null) {
            return pos;
          }
        }

        return null;
      })();

      setPosition(nextPosition);
      setMashStates(finishDraft(mashStatesDraft));
      setCategories(finishDraft(categoriesDraft));

      if (nextPosition === null) {
        setMode("finished");
        return;
      }

      sinceLastElimination.current++;
    },
    mode === "eliminating" ? ELIMINATION_INTERVAL : null,
  );

  const resolvedMashStates = produce(mashStates, (mashStates) => {
    if (!position || position.groupIndex !== 0) return;

    if (mashStates[mashKeys[position.targetIndex]] === "eliminated") {
      return;
    }

    mashStates[mashKeys[position.targetIndex]] = "current";
  });

  const resolvedCategories = produce(categories, (categories) => {
    if (!position || position.groupIndex === 0) return;

    categories[position.groupIndex - 1].options[position.targetIndex].status =
      "current";
  });

  const finalOptions = [
    {
      name: "MASH",
      value: mashKeys.find((key) => resolvedMashStates[key] === "final"),
    },
    ...resolvedCategories.flatMap((category) => ({
      name: category.title,
      value: category.options.find((option) => option.status === "final")?.name,
    })),
  ];

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-gray-100 px-3 py-5">
      <MASH states={resolvedMashStates} />

      <div className="flex justify-center gap-3">
        <Button
          disabled={mode !== null}
          onClick={() => {
            setMode("eliminating");
          }}
        >
          Start
        </Button>

        <Button
          disabled={mode !== "finished"}
          onClick={() => {
            setMashStates(initialMashStates);
            setCategories((x) =>
              x.map((category) => ({
                ...category,
                options: category.options.map((option) => ({
                  ...option,
                  status: null,
                })),
              })),
            );

            setMode(null);
          }}
        >
          Reset
        </Button>

        <Button
          variant="secondary"
          disabled={mode !== null}
          onClick={() => {
            setCategories(exampleCategories);
          }}
        >
          Load Example
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2">
        <span className="font-semibold">Enter your magic number:</span>
        <input
          type="number"
          value={magicNumber}
          min={2}
          max={30}
          required
          disabled={mode !== null}
          className="rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm outline outline-0 outline-blue-200 transition-all focus:bg-gray-50 focus:outline-2"
          onInput={(e) => {
            setMagicNumber(parseInt(e.currentTarget.value));
          }}
        />
      </div>

      <div
        className={twMerge(
          "flex flex-wrap justify-around gap-3 rounded-md bg-white shadow-md",
          !mode && "hidden",
        )}
      >
        {finalOptions.map((option, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-1 rounded-md p-3"
          >
            <span className="font-semibold capitalize">{option.name}</span>
            <span className="capitalize">{option.value ?? "-"}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {resolvedCategories.map((category, index) => (
          <CategoryTile
            key={index}
            isEditable={!mode}
            category={category}
            onRemoveCategory={() =>
              setCategories(
                produce((categories) => {
                  delete categories[index];
                }),
              )
            }
            onTitleChange={(title) =>
              setCategories(
                produce((categories) => {
                  categories[index].title = title;
                }),
              )
            }
            onOptionsChange={(options) =>
              setCategories(
                produce((categories) => {
                  categories[index].options = options;
                }),
              )
            }
          />
        ))}

        <AddCategory
          onAdd={() =>
            setCategories([...categories, { title: "", options: [] }])
          }
        />
      </div>
    </div>
  );
}

export default App;
