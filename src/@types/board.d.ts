type Tool = 'digits' | 'colors';
type InsertionMode = 'normal' | 'corner' | 'middle';

interface Point {
  x: number;
  y: number;
}

interface CellPosition {
  col: number;
  row: number;
}

interface Cell extends CellPosition {
  value: number | null;
  answer: number,
  revealed: boolean,
  corner: number[],
  middle: number[],
  colors: string[],
}

interface State {
  highlightedCell: CellPosition | null;
  revealed: boolean;
  debug: boolean;
  castSpell: boolean;
  showControls: boolean;
  selectedCells: CellPosition[];
  cells: Cell[];
  historyCursor: number;
  history: string[];
}
