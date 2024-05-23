export type EliminationStatus = "current" | "eliminated" | "final" | null;

export interface Category {
  title: string;
  options: CategoryOption[];
}

export interface CategoryOption {
  name: string;
  status: EliminationStatus;
}
