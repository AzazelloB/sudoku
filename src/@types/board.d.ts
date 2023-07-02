type Tool = 'digits' | 'colors';
type InsertionMode = 'normal' | 'corner' | 'middle';

interface Cell {
  value: number | null;
  answer: number,
  revealed: boolean,
  corner: number[],
  middle: number[],
  x: number,
  y: number,
  colors: string[],
}

interface Point {
  x: number;
  y: number;
}

interface State {
  highlightedCell: Point | null;
  mouseDown: boolean;
  revealed: boolean;
  debug: boolean;
  showControls: boolean;
  selectedCells: Point[];
  cells: Cell[];
  historyCursor: number;
  history: string[];
}
