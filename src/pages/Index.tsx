import { useState } from 'react';
import TetrisGame from '@/components/TetrisGame';
import StarsBackground from '@/components/StarsBackground';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Screen = 'menu' | 'game' | 'records' | 'settings' | 'help';

interface HighScore {
  score: number;
  level: number;
  lines: number;
  date: string;
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [showDialog, setShowDialog] = useState(false);
  
  const getHighScores = (): HighScore[] => {
    const scores = localStorage.getItem('tetris-highscores');
    return scores ? JSON.parse(scores) : [];
  };

  const menuItems = [
    { id: 'game' as Screen, label: 'ИГРАТЬ', icon: 'Gamepad2' },
    { id: 'records' as Screen, label: 'РЕКОРДЫ', icon: 'Trophy' },
    { id: 'settings' as Screen, label: 'НАСТРОЙКИ', icon: 'Settings' },
    { id: 'help' as Screen, label: 'ПОМОЩЬ', icon: 'HelpCircle' },
  ];

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <div className="text-center mb-8 animate-float">
        <h1 className="text-7xl md:text-8xl font-black text-glow text-primary mb-4 tracking-wider">
          ТЕТРИС
        </h1>
        <p className="text-xl text-secondary text-glow">КОСМИЧЕСКАЯ ОДИССЕЯ</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        {menuItems.map((item, index) => (
          <Button
            key={item.id}
            onClick={() => setCurrentScreen(item.id)}
            className="h-20 text-xl font-bold bg-card/50 hover:bg-primary/20 border-2 border-primary/50 neon-border text-primary hover:text-primary animate-slide-down backdrop-blur-sm"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Icon name={item.icon as any} className="mr-3" size={28} />
            {item.label}
          </Button>
        ))}
      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-sm text-muted-foreground/50">
          ← → ↑ ↓ ПРОБЕЛ для управления
        </p>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="flex flex-col min-h-screen p-4 md:p-8">
      <div className="mb-6 flex justify-between items-center">
        <Button
          onClick={() => setCurrentScreen('menu')}
          variant="outline"
          className="border-primary/50"
        >
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          МЕНЮ
        </Button>
        <h2 className="text-3xl font-bold text-glow text-primary">ИГРА</h2>
        <div className="w-24" />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <TetrisGame />
      </div>
    </div>
  );

  const renderRecords = () => {
    const scores = getHighScores();

    return (
      <div className="flex flex-col min-h-screen p-4 md:p-8">
        <div className="mb-8 flex justify-between items-center">
          <Button
            onClick={() => setCurrentScreen('menu')}
            variant="outline"
            className="border-primary/50"
          >
            <Icon name="ArrowLeft" className="mr-2" size={20} />
            МЕНЮ
        </Button>
          <h2 className="text-3xl font-bold text-glow text-primary">РЕКОРДЫ</h2>
          <div className="w-24" />
        </div>

        <Card className="max-w-2xl mx-auto w-full bg-card/50 backdrop-blur-sm border-primary/30 p-6">
          {scores.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Trophy" className="mx-auto mb-4 text-muted-foreground" size={64} />
              <p className="text-xl text-muted-foreground">Пока нет рекордов</p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Сыграйте первую игру!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.slice(0, 10).map((score, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-primary/20 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl font-bold ${
                      index === 0 ? 'text-primary' : 
                      index === 1 ? 'text-secondary' : 
                      index === 2 ? 'text-accent' : 'text-muted-foreground'
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-lg">{score.score} очков</p>
                      <p className="text-sm text-muted-foreground">
                        Уровень {score.level} • {score.lines} линий
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(score.date).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="flex flex-col min-h-screen p-4 md:p-8">
      <div className="mb-8 flex justify-between items-center">
        <Button
          onClick={() => setCurrentScreen('menu')}
          variant="outline"
          className="border-primary/50"
        >
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          МЕНЮ
        </Button>
        <h2 className="text-3xl font-bold text-glow text-primary">НАСТРОЙКИ</h2>
        <div className="w-24" />
      </div>

      <Card className="max-w-2xl mx-auto w-full bg-card/50 backdrop-blur-sm border-primary/30 p-6">
        <div className="space-y-6">
          <div className="p-6 bg-background/30 rounded-lg border border-primary/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Icon name="Volume2" size={24} />
              Звук
            </h3>
            <p className="text-sm text-muted-foreground">
              Звуковые эффекты будут добавлены в следующей версии
            </p>
          </div>

          <div className="p-6 bg-background/30 rounded-lg border border-primary/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Icon name="Palette" size={24} />
              Тема
            </h3>
            <p className="text-sm text-muted-foreground">
              Космическая тема активна
            </p>
          </div>

          <div className="p-6 bg-destructive/10 rounded-lg border border-destructive/30">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-destructive">
              <Icon name="Trash2" size={24} />
              Сброс данных
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Удалить все сохранённые рекорды
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                localStorage.removeItem('tetris-highscores');
                setShowDialog(true);
              }}
            >
              Очистить рекорды
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Рекорды удалены</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Все сохранённые результаты были успешно удалены.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderHelp = () => (
    <div className="flex flex-col min-h-screen p-4 md:p-8">
      <div className="mb-8 flex justify-between items-center">
        <Button
          onClick={() => setCurrentScreen('menu')}
          variant="outline"
          className="border-primary/50"
        >
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          МЕНЮ
        </Button>
        <h2 className="text-3xl font-bold text-glow text-primary">ПОМОЩЬ</h2>
        <div className="w-24" />
      </div>

      <div className="max-w-3xl mx-auto w-full space-y-6">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/30 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
            <Icon name="Gamepad2" size={24} />
            Как играть
          </h3>
          <p className="text-muted-foreground mb-4">
            Управляйте падающими фигурами, чтобы заполнить горизонтальные линии. 
            Когда линия полностью заполнена, она исчезает и вы получаете очки.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Заполняйте линии, чтобы они исчезали</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Чем выше уровень, тем быстрее падают фигуры</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Игра заканчивается, когда фигуры достигают верха</span>
            </li>
          </ul>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/30 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-secondary">
            <Icon name="Keyboard" size={24} />
            Управление
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-background/30 rounded-lg">
              <div className="bg-primary/20 px-3 py-2 rounded font-mono font-bold text-primary">
                ← →
              </div>
              <span className="text-sm">Движение влево/вправо</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/30 rounded-lg">
              <div className="bg-primary/20 px-3 py-2 rounded font-mono font-bold text-primary">
                ↑
              </div>
              <span className="text-sm">Поворот фигуры</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/30 rounded-lg">
              <div className="bg-primary/20 px-3 py-2 rounded font-mono font-bold text-primary">
                ↓
              </div>
              <span className="text-sm">Ускорить падение</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/30 rounded-lg">
              <div className="bg-primary/20 px-3 py-2 rounded font-mono font-bold text-primary">
                SPACE
              </div>
              <span className="text-sm">Мгновенный сброс</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/30 rounded-lg">
              <div className="bg-primary/20 px-3 py-2 rounded font-mono font-bold text-primary">
                P
              </div>
              <span className="text-sm">Пауза</span>
            </div>
          </div>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/30 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-accent">
            <Icon name="Target" size={24} />
            Подсчёт очков
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-background/30 rounded-lg">
              <span>Одна линия</span>
              <span className="font-bold text-primary">100 × уровень</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-background/30 rounded-lg">
              <span>Быстрый сброс</span>
              <span className="font-bold text-primary">+2 за клетку</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-background/30 rounded-lg">
              <span>Новый уровень</span>
              <span className="font-bold text-primary">Каждые 10 линий</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      <StarsBackground />
      {currentScreen === 'menu' && renderMenu()}
      {currentScreen === 'game' && renderGame()}
      {currentScreen === 'records' && renderRecords()}
      {currentScreen === 'settings' && renderSettings()}
      {currentScreen === 'help' && renderHelp()}
    </div>
  );
};

export default Index;
