import React from 'react';
import {OPPONENT_AVATAR_URL, PLAYER_AVATAR_URL} from '../avatars';

interface PlayerAvatarProps {
  role: 'player' | 'bot';
  name: string;
  score: number;
  roundPoints: number;
  isActive: boolean;
  isDealer: boolean;
  koiKoi: boolean;
  size?: 'sm' | 'lg';
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  role,
  name,
  score,
  roundPoints,
  isActive,
  isDealer,
  koiKoi,
  size = 'sm',
}) => {
  const avatarSrc = role === 'player' ? PLAYER_AVATAR_URL : OPPONENT_AVATAR_URL;
  const sizeClass = size === 'lg' ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-16 h-16 sm:w-20 sm:h-20';

  return (
    <div className={`flex flex-col items-center gap-2 ${role === 'player' ? 'sm:items-end' : 'sm:items-start'}`}>
      <div className="relative">
        <div
          className={`${sizeClass} rounded-full overflow-hidden border-4 shadow-lg transition-all duration-300
            ${isActive ? 'avatar-active border-vermillion scale-105' : 'border-gold/60'}
            ${role === 'player' ? 'bg-cream' : 'bg-indigo-deep'}`}
        >
          <img src={avatarSrc} alt={name} className="h-full w-full object-cover" draggable={false} />
        </div>
        {isDealer && (
          <span className="absolute -top-1 -right-1 rounded-full bg-vermillion px-1.5 py-0.5 text-[10px] font-bold text-cream shadow-md border border-gold">
            莊
          </span>
        )}
        {koiKoi && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-indigo-deep shadow-md">
            Koi-Koi
          </span>
        )}
      </div>
      <div className={`text-center ${role === 'player' ? 'sm:text-right' : 'sm:text-left'}`}>
        <p className="font-display text-sm sm:text-base font-semibold text-cream">{name}</p>
        <p className="text-xs text-cream/70">
          總分 <span className="text-gold font-bold">{score}</span>
          {' · '}
          本局 <span className="text-gold font-bold">{roundPoints}</span>
        </p>
      </div>
    </div>
  );
};
