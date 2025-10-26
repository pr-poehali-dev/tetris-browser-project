import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;

const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-[#0EA5E9]' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-[#F97316]' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-[#8B5CF6]' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-[#D946EF]' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-[#1EAEDB]' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-[#33C3F0]' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-[#ea384c]' }
};

type TetrominoType = keyof typeof TETROMINOS;

interface Position {
  x: number;
  y: number;
}

interface Piece {
  shape: number[][];
  color: string;
  position: Position;
  type: TetrominoType;
}

const createEmptyBoard = (): string[][] => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(''));

const TetrisGame = () => {
  const [board, setBoard] = useState<string[][]>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoType | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomTetromino = (): TetrominoType => {
    const types = Object.keys(TETROMINOS) as TetrominoType[];
    return types[Math.floor(Math.random() * types.length)];
  };

  const createPiece = (type: TetrominoType): Piece => {
    const tetromino = TETROMINOS[type];
    return {
      shape: tetromino.shape,
      color: tetromino.color,
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      type
    };
  };

  const checkCollision = (piece: Piece, board: string[][], offset: Position = { x: 0, y: 0 }): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.position.x + x + offset.x;
          const newY = piece.position.y + y + offset.y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotate = (matrix: number[][]): number[][] => {
    const rotated = matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
    return rotated;
  };

  const mergePieceToBoard = (piece: Piece, board: string[][]): string[][] => {
    const newBoard = board.map(row => [...row]);
    piece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = piece.position.y + y;
          const boardX = piece.position.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      });
    });
    return newBoard;
  };

  const clearLines = (board: string[][]): { newBoard: string[][]; linesCleared: number } => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== '')) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(''));
    }

    return { newBoard, linesCleared };
  };

  const movePiece = useCallback((direction: 'left' | 'right' | 'down'): boolean => {
    if (!currentPiece || gameOver || isPaused) return false;

    const offset = {
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      down: { x: 0, y: 1 }
    }[direction];

    if (!checkCollision(currentPiece, board, offset)) {
      setCurrentPiece({
        ...currentPiece,
        position: {
          x: currentPiece.position.x + offset.x,
          y: currentPiece.position.y + offset.y
        }
      });
      return true;
    }

    if (direction === 'down') {
      const mergedBoard = mergePieceToBoard(currentPiece, board);
      const { newBoard, linesCleared } = clearLines(mergedBoard);
      
      setBoard(newBoard);
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + linesCleared * 100 * level);
      
      if (linesCleared > 0 && lines + linesCleared >= level * 10) {
        setLevel(prev => prev + 1);
      }

      if (nextPiece) {
        const newPiece = createPiece(nextPiece);
        if (checkCollision(newPiece, newBoard)) {
          setGameOver(true);
          setIsPlaying(false);
          return false;
        }
        setCurrentPiece(newPiece);
        setNextPiece(getRandomTetromino());
      }
    }

    return false;
  }, [currentPiece, board, gameOver, isPaused, nextPiece, level, lines]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    const rotatedShape = rotate(currentPiece.shape);
    const rotatedPiece = { ...currentPiece, shape: rotatedShape };

    if (!checkCollision(rotatedPiece, board)) {
      setCurrentPiece(rotatedPiece);
    }
  }, [currentPiece, board, gameOver, isPaused]);

  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    
    while (movePiece('down')) {
      setScore(prev => prev + 2);
    }
  }, [currentPiece, gameOver, isPaused, movePiece]);

  const startGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    
    const firstType = getRandomTetromino();
    const secondType = getRandomTetromino();
    setCurrentPiece(createPiece(firstType));
    setNextPiece(secondType);
  };

  const togglePause = () => {
    if (isPlaying && !gameOver) {
      setIsPaused(prev => !prev);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece('right');
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece('down');
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotatePiece();
          break;
        case ' ':
          e.preventDefault();
          dropPiece();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver, movePiece, rotatePiece, dropPiece]);

  useEffect(() => {
    if (isPlaying && !gameOver && !isPaused) {
      const speed = Math.max(100, 1000 - (level - 1) * 100);
      gameLoopRef.current = setInterval(() => {
        movePiece('down');
      }, speed);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, isPaused, level, movePiece]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const boardY = currentPiece.position.y + y;
            const boardX = currentPiece.position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        });
      });
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className={`border border-primary/20 ${cell || 'bg-card/30'} transition-all duration-100`}
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
          />
        ))}
      </div>
    ));
  };

  const renderNextPiece = () => {
    if (!nextPiece) return null;
    const piece = TETROMINOS[nextPiece];
    
    return (
      <div className="flex flex-col items-center gap-2">
        {piece.shape.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className={`border border-primary/20 ${cell ? piece.color : 'bg-card/30'}`}
                style={{ width: 20, height: 20 }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      <div className="flex flex-col gap-4">
        <Card className="p-6 bg-card/50 backdrop-blur-sm neon-border border-primary/50">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">СЧЁТ</span>
              <span className="text-2xl font-bold text-glow text-primary">{score}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">УРОВЕНЬ</span>
              <span className="text-xl font-bold text-secondary">{level}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ЛИНИИ</span>
              <span className="text-xl font-bold text-accent">{lines}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">СЛЕДУЮЩАЯ</p>
            <div className="flex justify-center p-4 bg-background/50 rounded-lg">
              {renderNextPiece()}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {!isPlaying ? (
              <Button onClick={startGame} className="w-full bg-primary hover:bg-primary/90 text-glow">
                <Icon name="Play" className="mr-2" size={20} />
                СТАРТ
              </Button>
            ) : (
              <Button onClick={togglePause} variant="outline" className="w-full">
                <Icon name={isPaused ? "Play" : "Pause"} className="mr-2" size={20} />
                {isPaused ? 'ПРОДОЛЖИТЬ' : 'ПАУЗА'}
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-4 bg-card/50 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground mb-2">УПРАВЛЕНИЕ</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">← →</span>
              <span>Движение</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">↑</span>
              <span>Поворот</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">↓</span>
              <span>Ускорить</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ПРОБЕЛ</span>
              <span>Сброс</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">P</span>
              <span>Пауза</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-card/50 backdrop-blur-sm neon-border border-primary/30 relative overflow-hidden">
        {(gameOver || isPaused) && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <p className="text-4xl font-bold text-glow text-primary mb-4">
                {gameOver ? 'ИГРА ОКОНЧЕНА' : 'ПАУЗА'}
              </p>
              {gameOver && (
                <p className="text-xl text-muted-foreground">Счёт: {score}</p>
              )}
            </div>
          </div>
        )}
        <div className="inline-block border-4 border-primary/50 rounded-lg overflow-hidden">
          {renderBoard()}
        </div>
      </Card>
    </div>
  );
};

export default TetrisGame;
