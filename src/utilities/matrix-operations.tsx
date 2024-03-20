export type MatrixValue = number[][];
export type MatrixCoordinate = {
  row: number,
  col: number
}
export type MatrixOperationFunction = (value: MatrixValue) => MatrixValue;

export const matrixPipeline = (operations: Array<MatrixOperationFunction>) => {
  return {
    run: (value: MatrixValue) => {
      let lastValue = value;
      for (let i = 0; i < operations.length; i++) {
        lastValue = operations[i](lastValue);
      }
      return lastValue;
    }
  };
};

export enum HResizeDirection {
  Left, Right, Both
};

export enum VResizeDirection {
  Up, Down, Both
};

type MatrixInitialiseFunction = (row: number, col: number, defaultValue?: number) => MatrixValue;
export const initialise: MatrixInitialiseFunction = (row, col, defaultValue = 0) => {
  const matrix: MatrixValue = [];
  for(let i = 0; i < row; i++) {
    matrix[i] = [];
    for(let j = 0; j < col; j++) {
      matrix[i][j] = defaultValue;
    }
  }

  return matrix;
};

const calculateVOffset = (row: number, newRow: number, vDirection: VResizeDirection): number => {
  if (row === newRow) { return 0; }

  let rowOffset = 0;
  switch(vDirection) {
    case VResizeDirection.Down:
      rowOffset = 0;
      break;
    case VResizeDirection.Up:
      rowOffset = row - newRow;
      break;
    default:
      rowOffset = row > newRow ? Math.ceil((row - newRow) / 2) : Math.floor((row - newRow) / 2);
      break;
  }

  return rowOffset;
};

const calculateHOffset = (col: number, newCol: number, hDirection: HResizeDirection): number => {
  if (col === newCol) { return 0; }

  let colOffset = 0;
  switch(hDirection) {
    case HResizeDirection.Right:
      colOffset = 0;
      break;
    case HResizeDirection.Left:
      colOffset = col - newCol;
      break;
    default:
      colOffset = col > newCol ? Math.ceil((col - newCol) / 2) : Math.floor((col - newCol) / 2);
      break;
  }

  return colOffset;
};

type MatrixResizeFunction = (matrix: MatrixValue, newRow: number, newCol: number, vDirection?: VResizeDirection, hDirection?: HResizeDirection, defaultValue?: number) => MatrixValue;
export const resize: MatrixResizeFunction = (matrix, newRow, newCol, vDirection = VResizeDirection.Both, hDirection = HResizeDirection.Both, defaultValue = 0) => {
  const newMatrix: MatrixValue = [];

  const row = matrix.length;
  const rowOffset = calculateVOffset(row, newRow, vDirection);

  const col = matrix[0].length;
  const colOffset = calculateHOffset(col, newCol, hDirection);

  for(let i = 0; i < newRow; i++) {
    newMatrix[i] = [];
    for(let j = 0; j < newCol; j++) {
      let newValue: number;

      const isRowOutside: boolean = (i + rowOffset < 0) || (i + rowOffset >= row);
      const isColOutside: boolean = (j + colOffset < 0) || (j + colOffset >= col);
      if (isRowOutside || isColOutside) {
        newValue = defaultValue;
      }
      else {
        newValue = matrix[i + rowOffset][j + colOffset];
      }

      newMatrix[i][j] = newValue;
    }
  }

  return newMatrix;
};

export enum PeekDirection {
  UpperLeft, Up, UpperRight,
  Left, Right,
  LowerLeft, Down, LowerRight
};

type MatrixPeekFunction = (matrix: MatrixValue, start: MatrixCoordinate, direction: PeekDirection) => number | undefined
export const peek: MatrixPeekFunction = (matrix, start, direction) => {
  const { row, col } = start;
  if (row < 0 || row >= matrix.length) { return undefined; }
  if (col < 0 || col >= matrix[row].length) { return undefined; }

  switch (direction) {
    case PeekDirection.UpperLeft:
    case PeekDirection.Up:
    case PeekDirection.UpperRight:
      if (row === 0) { return undefined; }
      break;

    case PeekDirection.LowerLeft:
    case PeekDirection.Down:
    case PeekDirection.LowerRight:
      if (row === matrix.length - 1) { return undefined; }
      break;

    case PeekDirection.Left:
      if (col === 0) { return undefined; }
      break;

    case PeekDirection.Right:
      if (col === matrix[row].length - 1) { return undefined; }
      break;
  }

  switch (direction) {
    case PeekDirection.UpperLeft: return matrix[row-1][col-1];
    case PeekDirection.Up: return matrix[row-1][col];
    case PeekDirection.UpperRight: return matrix[row-1][col+1];
    case PeekDirection.Left: return matrix[row][col-1];
    case PeekDirection.Right: return matrix[row][col+1];
    case PeekDirection.LowerLeft: return matrix[row+1][col-1];
    case PeekDirection.Down: return matrix[row+1][col];
    case PeekDirection.LowerRight: return matrix[row+1][col+1];
  }

  return undefined;
};

export const copy: MatrixOperationFunction = (value) => {
  const matrixCopy: MatrixValue = [];

  for (let i = 0; i < value.length; i++) {
    matrixCopy[i] = [];
    for (let j = 0; j < value[i].length; j++) {
      matrixCopy[i][j] = value[i][j];
    }
  }

  return matrixCopy;
};

type MatrixResetFunction = (matrix: MatrixValue, initialValue?: number) => MatrixValue;
export const reset: MatrixResetFunction = (matrix, initialValue = 0) => {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      matrix[i][j] = initialValue;
    }
  }

  return matrix;
}

type MatrixDiffFunction = (source: MatrixValue, target: MatrixValue) => MatrixValue;
export const diff: MatrixDiffFunction = (source, target) => {
  if (source.length !== target.length) { return copy(target); }

  const diffValue: MatrixValue = [];
  for (let i = 0; i < source.length; i++) {
    if (source[i].length !== target[i].length) { return copy(target); }

    diffValue[i] = [];
    for (let j = 0; j < source[i].length; j++) {
      diffValue[i][j] = target[i][j] - source[i][j];
    }
  }

  return diffValue;
}

type MatrixApplyChangesFunction = (original: MatrixValue, changes: MatrixValue, ignoreValue?: number) => MatrixValue;
export const applyChanges: MatrixApplyChangesFunction = (original, changes, ignoreValue = 0) => {
  if (original.length !== changes.length) { return original; }

  for (let i = 0; i < original.length; i++) {
    if (original[i].length !== changes[i].length) { return original; }
    for (let j = 0; j < original[i].length; j++) {
      if (changes[i][j] === ignoreValue) { continue; }

      original[i][j] = changes[i][j];
    }
  }

  return original;
}
