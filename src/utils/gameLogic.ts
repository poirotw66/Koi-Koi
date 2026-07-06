import { Card, YakuResult } from '../types';
import { DECK } from '../constants';

export function shuffle(array: Card[]): Card[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function deal() {
  const deck = shuffle(DECK);
  const playerHand = deck.splice(0, 8);
  const botHand = deck.splice(0, 8);
  const field = deck.splice(0, 8);
  return { deck, playerHand, botHand, field };
}

export function calculateYaku(captured: Card[]): { yaku: YakuResult[], totalPoints: number } {
  const yaku: YakuResult[] = [];
  let totalPoints = 0;

  const hikari = captured.filter(c => c.type === 'hikari');
  const tane = captured.filter(c => c.type === 'tane');
  const tanzaku = captured.filter(c => c.type === 'tanzaku');
  const kasu = captured.filter(c => c.type === 'kasu');

  // Hikari Yaku
  const hasRainMan = hikari.some(c => c.subType === 'rain_man');
  if (hikari.length === 5) {
    yaku.push({ name: '五光 (Gokou)', points: 10 });
    totalPoints += 10;
  } else if (hikari.length === 4) {
    if (hasRainMan) {
      yaku.push({ name: '雨四光 (Ame-Shikou)', points: 7 });
      totalPoints += 7;
    } else {
      yaku.push({ name: '四光 (Shikou)', points: 8 });
      totalPoints += 8;
    }
  } else if (hikari.length === 3 && !hasRainMan) {
    yaku.push({ name: '三光 (Sankou)', points: 5 });
    totalPoints += 5;
  }

  // Tane Yaku
  const hasBoar = tane.some(c => c.subType === 'boar');
  const hasDeer = tane.some(c => c.subType === 'deer');
  const hasButterfly = tane.some(c => c.subType === 'butterfly');
  if (hasBoar && hasDeer && hasButterfly) {
    yaku.push({ name: '豬鹿蝶 (Ino-Shika-Cho)', points: 5 });
    totalPoints += 5;
  }
  
  const hasSake = tane.some(c => c.subType === 'sake');
  const hasMoon = hikari.some(c => c.subType === 'moon');
  const hasCurtain = hikari.some(c => c.subType === 'curtain');
  
  if (hasSake && hasMoon) {
    yaku.push({ name: '月見酒 (Tsukimi-zake)', points: 5 });
    totalPoints += 5;
  }
  if (hasSake && hasCurtain) {
    yaku.push({ name: '花見酒 (Hanami-zake)', points: 5 });
    totalPoints += 5;
  }

  if (tane.length >= 5) {
    const pts = 1 + (tane.length - 5);
    yaku.push({ name: '種 (Tane)', points: pts });
    totalPoints += pts;
  }

  // Tanzaku Yaku
  const akatan = tanzaku.filter(c => c.subType === 'akatan');
  const aotan = tanzaku.filter(c => c.subType === 'aotan');
  
  if (akatan.length === 3) {
    yaku.push({ name: '赤短 (Akatan)', points: 5 });
    totalPoints += 5;
  }
  if (aotan.length === 3) {
    yaku.push({ name: '青短 (Aotan)', points: 5 });
    totalPoints += 5;
  }
  if (tanzaku.length >= 5) {
    const pts = 1 + (tanzaku.length - 5);
    yaku.push({ name: '短冊 (Tanzaku)', points: pts });
    totalPoints += pts;
  }

  // Kasu Yaku
  const kasuCount = kasu.length + (hasSake ? 1 : 0);
  if (kasuCount >= 10) {
    const pts = 1 + (kasuCount - 10);
    yaku.push({ name: '菓子 (Kasu)', points: pts });
    totalPoints += pts;
  }

  return { yaku, totalPoints };
}

export function getMatchingCards(card: Card, field: Card[]): Card[] {
  return field.filter(c => c.month === card.month);
}

export const WIN_SCORE = 12;

export function getMatchWinner(playerScore: number, botScore: number): 'player' | 'bot' | null {
  const playerWins = playerScore >= WIN_SCORE;
  const botWins = botScore >= WIN_SCORE;
  if (!playerWins && !botWins) return null;
  if (playerWins && botWins) return playerScore >= botScore ? 'player' : 'bot';
  return playerWins ? 'player' : 'bot';
}

export function scoreToWin(currentScore: number): number {
  return Math.max(0, WIN_SCORE - currentScore);
}

export interface RoundResolution {
  playerScore: number;
  botScore: number;
  phase: 'round_end' | 'game_over';
  winner: 'player' | 'bot' | null;
}

export function resolveRoundScores(
  playerScore: number,
  botScore: number,
  playerGain: number,
  botGain: number,
): RoundResolution {
  const nextPlayer = playerScore + playerGain;
  const nextBot = botScore + botGain;
  const winner = getMatchWinner(nextPlayer, nextBot);
  return {
    playerScore: nextPlayer,
    botScore: nextBot,
    phase: winner ? 'game_over' : 'round_end',
    winner,
  };
}
