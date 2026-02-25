import React from 'react';
import { Card as CardType } from '../types';

interface Props {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  highlighted?: boolean;
  hidden?: boolean;
  className?: string;
}

export const Card: React.FC<Props> = ({ card, onClick, selected, highlighted, hidden, className = '' }) => {
  if (hidden) {
    return (
      <div className={`w-16 h-24 sm:w-20 sm:h-32 rounded bg-red-800 border-2 border-black shadow-md ${className}`} />
    );
  }

  const monthColors: Record<number, string> = {
    1: 'text-green-800',
    2: 'text-pink-700',
    3: 'text-pink-400',
    4: 'text-purple-600',
    5: 'text-indigo-600',
    6: 'text-red-500',
    7: 'text-orange-700',
    8: 'text-yellow-600',
    9: 'text-yellow-500',
    10: 'text-red-700',
    11: 'text-green-600',
    12: 'text-gray-800',
  };

  const monthNames = ['松', '梅', '櫻', '藤', '菖蒲', '牡丹', '萩', '芒', '菊', '紅葉', '柳', '桐'];

  return (
    <div 
      onClick={onClick}
      className={`w-16 h-24 sm:w-20 sm:h-32 rounded bg-white border-2 flex flex-col items-center justify-between p-1 cursor-pointer shadow-sm transition-all duration-200
        ${selected ? 'border-yellow-400 border-4 -translate-y-2 shadow-lg' : 'border-black'}
        ${highlighted ? 'border-blue-400 border-4 shadow-blue-400/50 shadow-lg animate-pulse' : ''}
        ${className}
      `}
    >
      <div className="text-[10px] sm:text-xs font-bold text-gray-500 w-full text-left flex justify-between">
        <span>{card.month}月</span>
        <span className={monthColors[card.month]}>{monthNames[card.month - 1]}</span>
      </div>
      <div className="text-xs sm:text-sm font-black text-center leading-tight flex-1 flex items-center justify-center flex-col">
        <span>{card.name.split('與')[0]}</span>
        {card.name.split('與')[1] && <span>{card.name.split('與')[1]}</span>}
      </div>
      <div className="text-[10px] sm:text-xs w-full text-right font-semibold">
        {card.type === 'hikari' && <span className="text-yellow-600 bg-yellow-100 px-1 rounded">光</span>}
        {card.type === 'tane' && <span className="text-green-600 bg-green-100 px-1 rounded">種</span>}
        {card.type === 'tanzaku' && <span className="text-red-600 bg-red-100 px-1 rounded">短</span>}
        {card.type === 'kasu' && <span className="text-gray-400 bg-gray-100 px-1 rounded">素</span>}
      </div>
    </div>
  );
}
