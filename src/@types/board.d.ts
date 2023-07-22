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
  colors: number[],
}

interface Cage {
  total: number;
  path: CellPosition[];
}

interface Thermo {
  path: CellPosition[];
}

interface SumArrow {
  path: CellPosition[];
}

interface Meta {
  cages: Cage[];
  thermos: Thermo[];
  sumArrows: SumArrow[];
}

interface State {
  highlightedCell: CellPosition | null;
  revealed: boolean;
  debug: boolean;
  showControls: boolean;
  selectedCells: CellPosition[];
  cells: Cell[];
  meta: Meta;
  historyCursor: number;
  history: string[];
}
