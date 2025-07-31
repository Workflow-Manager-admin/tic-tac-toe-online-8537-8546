import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type Cell = 'X' | 'O' | '';
type Board = Cell[][];

const EMPTY_BOARD: Board = [
  ['', '', ''],
  ['', '', ''],
  ['', '', ''],
];

function cloneBoard(board: Board): Board {
  return board.map(row => row.slice());
}

/**
 * Returns the winner ('X' or 'O') if any, or null.
 */
function calcWinner(board: Board): Cell | null {
  const lines = [
    // Rows
    [ [0,0], [0,1], [0,2] ],
    [ [1,0], [1,1], [1,2] ],
    [ [2,0], [2,1], [2,2] ],
    // Columns
    [ [0,0], [1,0], [2,0] ],
    [ [0,1], [1,1], [2,1] ],
    [ [0,2], [1,2], [2,2] ],
    // Diagonals
    [ [0,0], [1,1], [2,2] ],
    [ [0,2], [1,1], [2,0] ],
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    const cellA = board[a[0]][a[1]];
    if (
      cellA &&
      cellA === board[b[0]][b[1]] &&
      cellA === board[c[0]][c[1]]
    ) {
      return cellA;
    }
  }
  return null;
}

function isBoardFull(board: Board): boolean {
  return board.every(row => row.every(cell => cell !== ''));
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  /** Signal state for fine-grained reactivity. */
  board = signal<Board>(cloneBoard(EMPTY_BOARD));
  xIsNext = signal(true);
  hasStarted = signal(false);

  /**
   * PUBLIC_INTERFACE
   * Resets the board and state.
   */
  resetGame(): void {
    this.board.set(cloneBoard(EMPTY_BOARD));
    this.xIsNext.set(true);
    this.hasStarted.set(false);
  }

  /**
   * PUBLIC_INTERFACE
   * Handles a cell click.
   */
  handleClick(rowIdx: number, colIdx: number) {
    if (!this.isCellClickable(rowIdx, colIdx)) return;
    this.hasStarted.set(true);

    const currentBoard = this.board();
    const updated = cloneBoard(currentBoard);
    updated[rowIdx][colIdx] = this.xIsNext() ? 'X' : 'O';
    this.board.set(updated);

    if (!this.winner() && !this.isTie()) {
      this.xIsNext.set(!this.xIsNext());
    }
  }

  /**
   * Returns true if cell can be played now.
   */
  isCellClickable(rowIdx: number, colIdx: number): boolean {
    return (
      !this.board()[rowIdx][colIdx] &&
      !this.winner()
    );
  }

  /**
   * Returns the winner signal ('X'|'O') or null.
   */
  winner = computed(() => calcWinner(this.board()));

  /**
   * Returns whether the board is a tie (full and no winner).
   */
  isTie = computed(() =>
    !this.winner() &&
    this.hasStarted() &&
    isBoardFull(this.board())
  );

  /**
   * Returns a short status message for the game state.
   */
  get status(): string {
    if (this.winner()) {
      return `Player ${this.winner()} wins! 🎉`;
    } else if (this.isTie()) {
      return `It's a tie!`;
    } else {
      return `Player ${this.xIsNext() ? 'X' : 'O'}'s turn`;
    }
  }
}
