import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card as CardComponent } from './components/Card';
import { Card, GameState, Phase, YakuResult } from './types';
import { deal, calculateYaku, getMatchingCards } from './utils/gameLogic';
import { motion, AnimatePresence } from 'motion/react';

const initialState: GameState = {
  deck: [],
  field: [],
  playerHand: [],
  botHand: [],
  playerCaptured: [],
  botCaptured: [],
  playerYaku: [],
  botYaku: [],
  playerPoints: 0,
  botPoints: 0,
  phase: 'idle',
  selectedHandCard: null,
  drawnCard: null,
  matchingFieldCards: [],
  message: '歡迎來到花牌 (Koi-Koi)！點擊開始遊戲。',
  playerScore: 0,
  botScore: 0,
  round: 1,
  dealer: 'player',
  koiKoiCount: { player: 0, bot: 0 },
};

export default function App() {
  const [state, setState] = useState<GameState>(initialState);
  const lockRef = useRef(false);

  useEffect(() => {
    if (['player_turn_hand', 'player_turn_hand_match', 'player_turn_draw_match', 'player_koi_koi', 'idle', 'round_end'].includes(state.phase)) {
      lockRef.current = false;
    }
  }, [state.phase]);

  const startGame = (isNextRound = false) => {
    if (lockRef.current) return;
    lockRef.current = true;
    const { deck, playerHand, botHand, field } = deal();
    setState(s => ({
      ...initialState,
      deck,
      playerHand,
      botHand,
      field,
      phase: s.dealer === 'player' ? 'player_turn_hand' : 'bot_turn',
      message: s.dealer === 'player' ? '你的回合：請從手牌選擇一張牌。' : '對手的回合...',
      playerScore: s.playerScore,
      botScore: s.botScore,
      round: isNextRound ? s.round + 1 : s.round,
      dealer: s.dealer,
    }));
  };

  const endTurn = (nextPlayer: 'player' | 'bot') => {
    setState(s => {
      // Check if hands are empty (round over, draw)
      if (s.playerHand.length === 0 && s.botHand.length === 0) {
        // Dealer gets 1 point for draw (Oya-ken)
        const newPlayerScore = s.playerScore + (s.dealer === 'player' ? 1 : 0);
        const newBotScore = s.botScore + (s.dealer === 'bot' ? 1 : 0);
        return {
          ...s,
          phase: 'round_end',
          message: '流局！莊家獲得 1 分親權。',
          playerScore: newPlayerScore,
          botScore: newBotScore,
        };
      }

      return {
        ...s,
        phase: nextPlayer === 'player' ? 'player_turn_hand' : 'bot_turn',
        message: nextPlayer === 'player' ? '你的回合：請從手牌選擇一張牌。' : '對手的回合...',
        selectedHandCard: null,
        drawnCard: null,
        matchingFieldCards: [],
      };
    });
  };

  const handleYakuCheck = (player: 'player' | 'bot', newState: GameState) => {
    const captured = player === 'player' ? newState.playerCaptured : newState.botCaptured;
    const currentPoints = player === 'player' ? newState.playerPoints : newState.botPoints;
    
    const { yaku, totalPoints } = calculateYaku(captured);
    
    if (totalPoints > currentPoints) {
      // New Yaku formed!
      if (player === 'player') {
        setState({
          ...newState,
          playerYaku: yaku,
          playerPoints: totalPoints,
          phase: 'player_koi_koi',
          message: `你組成了役！獲得 ${totalPoints} 分。要喊 Koi-Koi 繼續嗎？`,
        });
      } else {
        // Bot logic for Koi-Koi
        // Simple AI: If points < 5 and bot has cards, Koi-Koi. Else Agari.
        const shouldKoiKoi = totalPoints < 5 && newState.botHand.length > 0;
        if (shouldKoiKoi) {
          setState({
            ...newState,
            botYaku: yaku,
            botPoints: totalPoints,
            koiKoiCount: { ...newState.koiKoiCount, bot: newState.koiKoiCount.bot + 1 },
            message: `對手組成了役 (${totalPoints} 分) 並喊了 Koi-Koi！`,
          });
          setTimeout(() => endTurn('player'), 2000);
        } else {
          // Bot Agari
          let finalPoints = totalPoints;
          if (newState.koiKoiCount.player > 0) finalPoints *= 2; // Double if player called Koi-Koi
          
          setState({
            ...newState,
            botYaku: yaku,
            botPoints: totalPoints,
            botScore: newState.botScore + finalPoints,
            phase: 'round_end',
            message: `對手結束了遊戲！獲得 ${finalPoints} 分。`,
            dealer: 'bot',
          });
        }
      }
    } else {
      // No new Yaku, next turn
      endTurn(player === 'player' ? 'bot' : 'player');
    }
  };

  const executeDrawPhase = (currentState: GameState, player: 'player' | 'bot') => {
    const deck = [...currentState.deck];
    const drawnCard = deck.pop();
    
    if (!drawnCard) {
      endTurn(player === 'player' ? 'bot' : 'player');
      return;
    }

    const matches = getMatchingCards(drawnCard, currentState.field);
    
    let nextState = { ...currentState, deck, drawnCard };

    if (matches.length === 0) {
      nextState.field = [...nextState.field, drawnCard];
      nextState.message = `${player === 'player' ? '你' : '對手'}翻開了 ${drawnCard.name}，沒有配對。`;
      setState(nextState);
      setTimeout(() => handleYakuCheck(player, nextState), 1500);
    } else if (matches.length === 1) {
      nextState.field = nextState.field.filter(c => c.id !== matches[0].id);
      const captured = player === 'player' ? nextState.playerCaptured : nextState.botCaptured;
      if (player === 'player') {
        nextState.playerCaptured = [...captured, drawnCard, matches[0]];
      } else {
        nextState.botCaptured = [...captured, drawnCard, matches[0]];
      }
      nextState.message = `${player === 'player' ? '你' : '對手'}翻開了 ${drawnCard.name} 並配對成功！`;
      setState(nextState);
      setTimeout(() => handleYakuCheck(player, nextState), 1500);
    } else if (matches.length === 2) {
      if (player === 'player') {
        nextState.phase = 'player_turn_draw_match';
        nextState.matchingFieldCards = matches;
        nextState.message = `翻開了 ${drawnCard.name}，場上有兩張可配對，請選擇一張。`;
        setState(nextState);
      } else {
        // Bot picks the first one
        nextState.field = nextState.field.filter(c => c.id !== matches[0].id);
        nextState.botCaptured = [...nextState.botCaptured, drawnCard, matches[0]];
        nextState.message = `對手翻開了 ${drawnCard.name} 並配對成功！`;
        setState(nextState);
        setTimeout(() => handleYakuCheck('bot', nextState), 1500);
      }
    } else if (matches.length === 3) {
      nextState.field = nextState.field.filter(c => c.month !== drawnCard.month);
      const captured = player === 'player' ? nextState.playerCaptured : nextState.botCaptured;
      if (player === 'player') {
        nextState.playerCaptured = [...captured, drawnCard, ...matches];
      } else {
        nextState.botCaptured = [...captured, drawnCard, ...matches];
      }
      nextState.message = `${player === 'player' ? '你' : '對手'}翻開了 ${drawnCard.name} 並收走了場上三張！`;
      setState(nextState);
      setTimeout(() => handleYakuCheck(player, nextState), 1500);
    }
  };

  const handleHandCardClick = (card: Card) => {
    if (state.phase !== 'player_turn_hand' || lockRef.current) return;
    lockRef.current = true;

    const matches = getMatchingCards(card, state.field);
    const newHand = state.playerHand.filter(c => c.id !== card.id);

    if (matches.length === 0) {
      setState(s => ({
        ...s,
        playerHand: newHand,
        field: [...s.field, card],
        phase: 'player_turn_draw',
        message: '沒有配對，牌放到場上。準備翻牌...',
      }));
      setTimeout(() => executeDrawPhase({ ...state, playerHand: newHand, field: [...state.field, card] }, 'player'), 1000);
    } else if (matches.length === 1) {
      setState(s => ({
        ...s,
        playerHand: newHand,
        field: s.field.filter(c => c.id !== matches[0].id),
        playerCaptured: [...s.playerCaptured, card, matches[0]],
        phase: 'player_turn_draw',
        message: '配對成功！準備翻牌...',
      }));
      setTimeout(() => executeDrawPhase({
        ...state,
        playerHand: newHand,
        field: state.field.filter(c => c.id !== matches[0].id),
        playerCaptured: [...state.playerCaptured, card, matches[0]]
      }, 'player'), 1000);
    } else if (matches.length === 2) {
      setState(s => ({
        ...s,
        playerHand: newHand,
        selectedHandCard: card,
        matchingFieldCards: matches,
        phase: 'player_turn_hand_match',
        message: '場上有兩張可配對，請選擇一張。',
      }));
    } else if (matches.length === 3) {
      setState(s => ({
        ...s,
        playerHand: newHand,
        field: s.field.filter(c => c.month !== card.month),
        playerCaptured: [...s.playerCaptured, card, ...matches],
        phase: 'player_turn_draw',
        message: '配對成功，收走場上三張！準備翻牌...',
      }));
      setTimeout(() => executeDrawPhase({
        ...state,
        playerHand: newHand,
        field: state.field.filter(c => c.month !== card.month),
        playerCaptured: [...state.playerCaptured, card, ...matches]
      }, 'player'), 1000);
    }
  };

  const handleFieldCardClick = (card: Card) => {
    if (lockRef.current) return;

    if (state.phase === 'player_turn_hand_match' && state.selectedHandCard) {
      if (!state.matchingFieldCards.find(c => c.id === card.id)) return;
      lockRef.current = true;

      const nextState = {
        ...state,
        field: state.field.filter(c => c.id !== card.id),
        playerCaptured: [...state.playerCaptured, state.selectedHandCard, card],
        selectedHandCard: null,
        matchingFieldCards: [],
        phase: 'player_turn_draw' as Phase,
        message: '配對成功！準備翻牌...',
      };
      setState(nextState);
      setTimeout(() => executeDrawPhase(nextState, 'player'), 1000);
    } else if (state.phase === 'player_turn_draw_match' && state.drawnCard) {
      if (!state.matchingFieldCards.find(c => c.id === card.id)) return;
      lockRef.current = true;

      const nextState = {
        ...state,
        field: state.field.filter(c => c.id !== card.id),
        playerCaptured: [...state.playerCaptured, state.drawnCard, card],
        drawnCard: null,
        matchingFieldCards: [],
        message: '配對成功！檢查役...',
      };
      setState(nextState);
      setTimeout(() => handleYakuCheck('player', nextState), 1000);
    }
  };

  const handleKoiKoi = () => {
    if (lockRef.current) return;
    lockRef.current = true;
    setState(s => ({
      ...s,
      koiKoiCount: { ...s.koiKoiCount, player: s.koiKoiCount.player + 1 },
      message: '你喊了 Koi-Koi！遊戲繼續。',
    }));
    setTimeout(() => endTurn('bot'), 1500);
  };

  const handleAgari = () => {
    if (lockRef.current) return;
    lockRef.current = true;
    let finalPoints = state.playerPoints;
    if (state.koiKoiCount.bot > 0) finalPoints *= 2; // Double if bot called Koi-Koi
    
    setState(s => ({
      ...s,
      playerScore: s.playerScore + finalPoints,
      phase: 'round_end',
      message: `你結束了遊戲！獲得 ${finalPoints} 分。`,
      dealer: 'player',
    }));
  };

  // Bot Logic
  useEffect(() => {
    if (state.phase === 'bot_turn') {
      const playBotTurn = async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 1. Find a match from hand
        let selectedCard = state.botHand[0];
        let bestMatch: Card | null = null;
        let matches: Card[] = [];

        // Simple AI: Prefer matching Hikari, then Tane, then Tanzaku
        const typeValues = { hikari: 4, tane: 3, tanzaku: 2, kasu: 1 };
        let bestValue = -1;

        for (const card of state.botHand) {
          const fieldMatches = getMatchingCards(card, state.field);
          if (fieldMatches.length > 0) {
            const val = typeValues[card.type] + typeValues[fieldMatches[0].type];
            if (val > bestValue) {
              bestValue = val;
              selectedCard = card;
              matches = fieldMatches;
              bestMatch = fieldMatches[0];
            }
          }
        }

        const newHand = state.botHand.filter(c => c.id !== selectedCard.id);
        let nextState = { ...state, botHand: newHand };

        if (matches.length === 0) {
          nextState.field = [...nextState.field, selectedCard];
          nextState.message = `對手打出了 ${selectedCard.name}，沒有配對。`;
        } else if (matches.length === 1 || matches.length === 2) {
          // If 2, bot just picks the first one (bestMatch)
          nextState.field = nextState.field.filter(c => c.id !== bestMatch!.id);
          nextState.botCaptured = [...nextState.botCaptured, selectedCard, bestMatch!];
          nextState.message = `對手配對了 ${selectedCard.name}！`;
        } else if (matches.length === 3) {
          nextState.field = nextState.field.filter(c => c.month !== selectedCard.month);
          nextState.botCaptured = [...nextState.botCaptured, selectedCard, ...matches];
          nextState.message = `對手收走了場上三張 ${selectedCard.month}月牌！`;
        }

        setState(nextState);
        
        // 2. Draw phase
        setTimeout(() => executeDrawPhase(nextState, 'bot'), 1500);
      };

      playBotTurn();
    }
  }, [state.phase]);

  return (
    <div className="min-h-screen bg-green-900 text-white font-sans flex flex-col items-center py-4 px-2 sm:px-8">
      <div className="w-full max-w-6xl flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">花牌 Koi-Koi</h1>
          <p className="text-sm text-green-200">第 {state.round} 局 | 莊家: {state.dealer === 'player' ? '你' : '對手'}</p>
        </div>
        <div className="flex gap-8 text-lg font-semibold">
          <div className="text-center">
            <div className="text-green-300">對手分數</div>
            <div className="text-2xl">{state.botScore}</div>
          </div>
          <div className="text-center">
            <div className="text-green-300">你的分數</div>
            <div className="text-2xl">{state.playerScore}</div>
          </div>
        </div>
      </div>

      {state.phase === 'idle' && (
        <button 
          onClick={() => startGame(false)}
          className="mt-20 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-xl shadow-lg transition-transform hover:scale-105"
        >
          開始遊戲
        </button>
      )}

      {state.phase !== 'idle' && (
        <div className="w-full max-w-6xl flex flex-col gap-4 flex-1">
          
          {/* Bot Area */}
          <div className="flex justify-between items-start bg-green-950/50 p-4 rounded-xl border border-green-800">
            <div className="flex-1">
              <div className="text-sm text-green-400 mb-2">對手手牌 ({state.botHand.length})</div>
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                {state.botHand.map(c => (
                  <CardComponent key={c.id} card={c} hidden />
                ))}
              </div>
            </div>
            <div className="w-1/3 pl-4 border-l border-green-800">
              <div className="text-sm text-green-400 mb-2 flex justify-between">
                <span>對手獲得 ({state.botPoints} 分)</span>
                {state.koiKoiCount.bot > 0 && <span className="text-yellow-400 font-bold">Koi-Koi!</span>}
              </div>
              <div className="flex gap-1 flex-wrap">
                {state.botCaptured.map(c => (
                  <CardComponent key={c.id} card={c} className="scale-75 origin-top-left" />
                ))}
              </div>
              <div className="text-xs text-yellow-200 mt-2">
                {state.botYaku.map(y => y.name).join(', ')}
              </div>
            </div>
          </div>

          {/* Field Area */}
          <div className="flex-1 flex flex-col items-center justify-center relative py-8">
            <div className="absolute top-0 w-full text-center text-lg font-bold text-yellow-300 bg-black/30 py-2 rounded">
              {state.message}
            </div>

            {/* Drawn Card Display */}
            <AnimatePresence>
              {state.drawnCard && (
                <motion.div 
                  initial={{ opacity: 0, y: -50, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1.2 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="text-center mb-2 font-bold text-yellow-300 drop-shadow-md">翻開的牌</div>
                  <CardComponent card={state.drawnCard} className="shadow-2xl ring-4 ring-yellow-400" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-4xl mt-8">
              {state.field.map(c => (
                <CardComponent 
                  key={c.id} 
                  card={c} 
                  onClick={() => handleFieldCardClick(c)}
                  highlighted={state.matchingFieldCards.some(mc => mc.id === c.id)}
                />
              ))}
            </div>
          </div>

          {/* Player Area */}
          <div className="flex justify-between items-end bg-green-950/50 p-4 rounded-xl border border-green-800">
            <div className="flex-1">
              <div className="text-sm text-green-400 mb-2">你的手牌</div>
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                {state.playerHand.map(c => (
                  <CardComponent 
                    key={c.id} 
                    card={c} 
                    onClick={() => handleHandCardClick(c)}
                    selected={state.selectedHandCard?.id === c.id}
                    className={state.phase === 'player_turn_hand' ? 'hover:-translate-y-2' : ''}
                  />
                ))}
              </div>
            </div>
            <div className="w-1/3 pl-4 border-l border-green-800">
              <div className="text-sm text-green-400 mb-2 flex justify-between">
                <span>你獲得 ({state.playerPoints} 分)</span>
                {state.koiKoiCount.player > 0 && <span className="text-yellow-400 font-bold">Koi-Koi!</span>}
              </div>
              <div className="flex gap-1 flex-wrap">
                {state.playerCaptured.map(c => (
                  <CardComponent key={c.id} card={c} className="scale-75 origin-top-left" />
                ))}
              </div>
              <div className="text-xs text-yellow-200 mt-2">
                {state.playerYaku.map(y => y.name).join(', ')}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Modals */}
      {state.phase === 'player_koi_koi' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-green-900 border-2 border-yellow-500 p-8 rounded-2xl text-center max-w-md">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">組成役！</h2>
            <p className="text-xl mb-2">你目前獲得 {state.playerPoints} 分</p>
            <p className="text-sm text-green-200 mb-8">
              {state.playerYaku.map(y => `${y.name} (${y.points}分)`).join(' + ')}
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleAgari}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors"
              >
                結束並結算 (勝負)
              </button>
              <button 
                onClick={handleKoiKoi}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors"
              >
                Koi-Koi (繼續)
              </button>
            </div>
          </div>
        </div>
      )}

      {state.phase === 'round_end' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-green-900 border-2 border-yellow-500 p-8 rounded-2xl text-center max-w-md">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">回合結束</h2>
            <p className="text-xl mb-8">{state.message}</p>
            <button 
              onClick={() => startGame(true)}
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-xl transition-transform hover:scale-105"
            >
              下一局
            </button>
          </div>
        </div>
      )}

      <p className="mt-6 max-w-6xl text-center text-[10px] text-green-300/80">
        牌面圖素材：Louie Mantia ·{' '}
        <a
          href="https://commons.wikimedia.org/wiki/Category:SVG_Hanafuda_with_traditional_colors_(black_border)"
          className="underline hover:text-green-200"
          target="_blank"
          rel="noreferrer"
        >
          Wikimedia Commons
        </a>
        {' '}· CC BY-SA 4.0（保底素材，後續可替換自訂主題）
      </p>
    </div>
  );
}
