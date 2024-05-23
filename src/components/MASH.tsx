import { twMerge } from "tailwind-merge";
import { EliminationStatus } from "../types";

export const mashKeys = ["mansion", "apartment", "shack", "house"] as const;

export type MashKey = (typeof mashKeys)[number];

interface MASHProps {
  states: {
    [key in MashKey]: EliminationStatus;
  };
}

export const MASH = (props: MASHProps) => {
  return (
    <div className="flex justify-center gap-2">
      <MASHCircleLetter letter="M" state={props.states.mansion} />
      <MASHCircleLetter letter="A" state={props.states.apartment} />
      <MASHCircleLetter letter="S" state={props.states.shack} />
      <MASHCircleLetter letter="H" state={props.states.house} />
    </div>
  );
};

interface MASHCircleLetterProps {
  letter: string;
  state: EliminationStatus;
}

const MASHCircleLetter = (props: MASHCircleLetterProps) => {
  return (
    <span
      className={twMerge(
        "flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-semibold shadow-md transition-colors",
        props.state === "current" && "bg-amber-200",
        props.state === "eliminated" && "bg-red-300",
        props.state === "final" && "bg-green-300",
      )}
    >
      {props.letter}
    </span>
  );
};
