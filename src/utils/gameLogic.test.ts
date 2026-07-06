import { describe, expect, it } from 'vitest';
import {
  getMatchWinner,
  resolveRoundScores,
  scoreToWin,
  WIN_SCORE,
} from './gameLogic';

describe('getMatchWinner', () => {
  it('returns null when neither player reaches the win score', () => {
    expect(getMatchWinner(5, 8)).toBeNull();
  });

  it('returns player when only player reaches the win score', () => {
    expect(getMatchWinner(12, 6)).toBe('player');
  });

  it('returns bot when only bot reaches the win score', () => {
    expect(getMatchWinner(8, 12)).toBe('bot');
  });

  it('returns higher score when both reach the win score', () => {
    expect(getMatchWinner(14, 12)).toBe('player');
    expect(getMatchWinner(12, 15)).toBe('bot');
  });
});

describe('scoreToWin', () => {
  it('returns remaining points to win', () => {
    expect(scoreToWin(0)).toBe(WIN_SCORE);
    expect(scoreToWin(7)).toBe(5);
    expect(scoreToWin(12)).toBe(0);
    expect(scoreToWin(15)).toBe(0);
  });
});

describe('resolveRoundScores', () => {
  it('continues match when no one reaches the win score', () => {
    const result = resolveRoundScores(4, 3, 5, 0);

    expect(result).toEqual({
      playerScore: 9,
      botScore: 3,
      phase: 'round_end',
      winner: null,
    });
  });

  it('ends match when player reaches the win score', () => {
    const result = resolveRoundScores(10, 5, 3, 0);

    expect(result.playerScore).toBe(13);
    expect(result.botScore).toBe(5);
    expect(result.phase).toBe('game_over');
    expect(result.winner).toBe('player');
  });

  it('ends match when bot reaches the win score', () => {
    const result = resolveRoundScores(6, 9, 0, 4);

    expect(result.playerScore).toBe(6);
    expect(result.botScore).toBe(13);
    expect(result.phase).toBe('game_over');
    expect(result.winner).toBe('bot');
  });

  it('awards dealer point on draw without ending match early', () => {
    const result = resolveRoundScores(11, 10, 1, 0);

    expect(result.playerScore).toBe(12);
    expect(result.botScore).toBe(10);
    expect(result.phase).toBe('game_over');
    expect(result.winner).toBe('player');
  });
});
