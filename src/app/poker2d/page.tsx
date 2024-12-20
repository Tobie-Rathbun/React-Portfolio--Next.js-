
"use client";

import React, { useState, useEffect } from 'react';
import { Hand } from "pokersolver";


interface Player {
  name: string;
  cards: string[];
  chips: number;
  regrets: Record<string, number>;
  totalBet: number;
  active: boolean;
  lastAction: string;
  winLikelihood: number;
}

const PokerGame: React.FC = () => {
  const SMALL_BLIND = 500;
  const BIG_BLIND = 1000;
  const STARTING_CHIPS = 100000;

  const [players, setPlayers] = useState<Player[]>([
    { name: "You", cards: [], chips: STARTING_CHIPS, regrets: { fold: 0, call: 0, raise: 0 }, totalBet: 0, active: true, lastAction: "", winLikelihood: 0 },
    { name: "Opponent 1", cards: [], chips: STARTING_CHIPS, regrets: { fold: 0, call: 0, raise: 0 }, totalBet: 0, active: true, lastAction: "", winLikelihood: 0 },
    { name: "Opponent 2", cards: [], chips: STARTING_CHIPS, regrets: { fold: 0, call: 0, raise: 0 }, totalBet: 0, active: true, lastAction: "", winLikelihood: 0 },
    { name: "Opponent 3", cards: [], chips: STARTING_CHIPS, regrets: { fold: 0, call: 0, raise: 0 }, totalBet: 0, active: true, lastAction: "", winLikelihood: 0 },
    { name: "Opponent 4", cards: [], chips: STARTING_CHIPS, regrets: { fold: 0, call: 0, raise: 0 }, totalBet: 0, active: true, lastAction: "", winLikelihood: 0 },
  ]);

  const [deck, setDeck] = useState<string[]>(generateDeck());
  const [pot, setPot] = useState<number>(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(-1);
  const [communityCards, setCommunityCards] = useState<string[]>([]);
  const [bettingRound, setBettingRound] = useState<number>(1);
  const [gameRound, setGameRound] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [blindIndex, setBlindIndex] = useState<number>(0); // Starts with the first player
  const isUserTurn = players[currentPlayerIndex]?.name === "You";
  const [playersWhoActed, setPlayersWhoActed] = useState<number[]>([]);
  const [lastValidBet, setLastValidBet] = useState<number>(0);
  const aiTurnTimer = 1000;






  useEffect(() => {
    if (!gameOver && players[currentPlayerIndex]?.name !== "You" && players[currentPlayerIndex]?.active) {
      setTimeout(aiTakeTurn, aiTurnTimer);
    }
  }, [currentPlayerIndex, gameOver]);

  function generateDeck(): string[] {
    const suits = ["♠", "♥", "♦", "♣"];
    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const deck: string[] = [];
    suits.forEach((suit) => {
      ranks.forEach((rank) => {
        deck.push(`${rank}${suit}`);
      });
    });
    return deck.sort(() => Math.random() - 0.5);
  }

  function startNewGame() {
    setPlayersWhoActed([]); // Reset at the start of a new game
    setLastValidBet(0);
    setGameOver(false);
    setGameStarted(true);
    setCommunityCards(["", "", "", "", ""]);
    setPot(0);
    setBettingRound(1);
    setGameRound(gameRound + 1);
    setBlindIndex((prev) => (prev + 1) % players.length); // Rotate blinds
    const resetPlayers = players.map((player) => ({
        ...player,
        active: true,
        totalBet: 0,
        lastAction: "",
        cards: [],
        winLikelihood: 0,
      }));
      setPlayers(resetPlayers);
    dealCards();
  }

  function dealCards() {
    const newPlayers = [...players];
    const newDeck = [...deck];

    newPlayers.forEach((player) => {
      player.cards = [newDeck.pop()!, newDeck.pop()!];
      player.totalBet = 0;
      player.active = true;
      player.lastAction = "";
      player.winLikelihood = 0;
    });

    setPlayers(newPlayers);
    setDeck(newDeck);
    postBlinds();
  }

  function postBlinds() {
    const newPlayers = [...players];
    const smallBlindIndex = blindIndex % players.length;
    const bigBlindIndex = (blindIndex + 1) % players.length;
  
    // Assign blinds
    newPlayers[smallBlindIndex].chips -= SMALL_BLIND;
    newPlayers[smallBlindIndex].totalBet += SMALL_BLIND;
    newPlayers[smallBlindIndex].lastAction = "Small Blind";
  
    newPlayers[bigBlindIndex].chips -= BIG_BLIND;
    newPlayers[bigBlindIndex].totalBet += BIG_BLIND;
    newPlayers[bigBlindIndex].lastAction = "Big Blind";
  
    setPot(SMALL_BLIND + BIG_BLIND);
    setPlayers(newPlayers);
  
    // Set the first player to act (player after the big blind)
    let startingIndex = (bigBlindIndex + 1) % players.length;
  
    // Skip folded players
    while (!newPlayers[startingIndex].active) {
      startingIndex = (startingIndex + 1) % players.length;
    }
  
    setCurrentPlayerIndex(startingIndex);
  }
  
  
  
  function simulateWinLikelihood(
    playerCards: string[],
    communityCards: string[],
    activePlayers: Player[]
  ): number {
    // Generate the remaining deck excluding player cards, community cards, and opponents' cards
    const dealtCards = [
      ...playerCards,
      ...communityCards,
      ...activePlayers.flatMap((player) => player.cards),
    ];
    const remainingDeck = generateDeck().filter(
      (card) => !dealtCards.includes(card)
    );
  
    let wins = 0;
    const totalSimulations = 1000;
  
    for (let i = 0; i < totalSimulations; i++) {
      const shuffledDeck = [...remainingDeck].sort(() => Math.random() - 0.5);
      const simulatedCommunity = [
        ...communityCards,
        ...shuffledDeck.slice(0, 5 - communityCards.length),
      ];
  
      const opponentHands = activePlayers.map((player) =>
        Hand.solve([...player.cards, ...simulatedCommunity])
      );
  
      const playerHand = Hand.solve([...playerCards, ...simulatedCommunity]);
      const bestHand = [...opponentHands, playerHand].reduce((best, hand) =>
        hand.rank < best.rank ? hand : best
      );
  
      if (playerHand.rank === bestHand.rank) {
        wins++;
      }
    }
  
    return wins / totalSimulations;
  }
  
  
  

  function updateWinLikelihoods() {
    const newPlayers = [...players];
  
    newPlayers.forEach((player) => {
      if (player.active) {
        const winProbability = simulateWinLikelihood(player.cards, communityCards, newPlayers.filter(p => p.active && p !== player));
        player.winLikelihood = winProbability;
  
        console.log(`${player.name}: Simulated likelihood ${player.winLikelihood}`);
      } else {
        player.winLikelihood = 0; // Folded players have no likelihood
      }
    });
  
    setPlayers(newPlayers);
  }
  
  

  
  

  function revealCommunityCards(round: number) {
    const newCommunityCards = [...communityCards];
    const newDeck = [...deck];
  
    if (round === 1) {
      // Reveal the flop (3 cards)
      newCommunityCards[0] = newDeck.pop()!;
      newCommunityCards[1] = newDeck.pop()!;
      newCommunityCards[2] = newDeck.pop()!;
    } else if (round === 2) {
      // Reveal the turn (1 card)
      newCommunityCards[3] = newDeck.pop()!;
    } else if (round === 3) {
      // Reveal the river (1 card)
      newCommunityCards[4] = newDeck.pop()!;
    }
  
    setCommunityCards(newCommunityCards);
    setDeck(newDeck);
    updateWinLikelihoods(); // Update win likelihoods based on new cards
  }
  

  function endGame() {
    const activePlayers = players.filter((player) => player.active);
    const winner = activePlayers[0];
    winner.chips += pot;
    setPot(0);
    alert(`${winner.name} wins the pot of ${pot} chips!`);
    setGameOver(true);
    setCurrentPlayerIndex(-1); // Use -1 to indicate no active turn
  }
  

  function fold() {
    const newPlayers = [...players];
    const currentPlayer = newPlayers[currentPlayerIndex];
    
    currentPlayer.lastAction = "Fold"; // Update last action
    currentPlayer.active = false; // Mark as inactive for this round
    setPlayers(newPlayers);
  
    // Add the player to the list of those who have acted
    setPlayersWhoActed((prev) => [...new Set([...prev, currentPlayerIndex])]);
  
    checkWin();
    
  
    // Find the next active player
    let nextIndex = currentPlayerIndex;
    do {
      nextIndex = (nextIndex + 1) % players.length; // Move to the next player
    } while (!players[nextIndex].active);
  
    setCurrentPlayerIndex(nextIndex);
  }
  
  function endBettingRound() {
    setPlayersWhoActed([]); // Reset actions for the next round
  
    if (bettingRound === 1) {
      revealCommunityCards(1); // Flop: Reveal 3 cards
    } else if (bettingRound === 2) {
      revealCommunityCards(2); // Turn: Reveal 1 card
    } else if (bettingRound === 3) {
      revealCommunityCards(3); // River: Reveal 1 card
    } else {
      checkWin(); // End the game after the final betting round
    }
  
    setBettingRound((prev) => prev + 1);
  }
  
  
  

  function check() {
    const currentPlayer = players[currentPlayerIndex];
    const maxBet = Math.max(...players.map((player) => player.totalBet));
  
    if (currentPlayer.totalBet === maxBet) {
      currentPlayer.lastAction = "Check";
  
      // Add current player to the list of players who acted
      setPlayersWhoActed((prev) => [...new Set([...prev, currentPlayerIndex])]);
  
      // Move to the next active player
      let nextIndex = currentPlayerIndex;
      do {
        nextIndex = (nextIndex + 1) % players.length; // Increment index
      } while (!players[nextIndex].active); // Skip folded players
  
      setCurrentPlayerIndex(nextIndex);
  
      // Check if all active players have acted
      const activePlayers = players.filter((player) => player.active);
      if (playersWhoActed.length >= activePlayers.length - 1) {
        if (areAllBetsEqual()) {
          nextTurn(); // Advance to the next betting round
          setPlayersWhoActed([]); // Reset for the next round
        }
      }
    } else {
      alert("Cannot check, bets do not match!");
    }
  }

  function call() {
    const currentPlayer = players[currentPlayerIndex];
    const maxBet = Math.max(...players.map((player) => player.totalBet));
    const callAmount = maxBet - currentPlayer.totalBet;
  
    if (currentPlayer.chips >= callAmount) {
      currentPlayer.chips -= callAmount;
      currentPlayer.totalBet += callAmount;
      setPot((prev) => prev + callAmount);
      currentPlayer.lastAction = "Call";
      setLastValidBet(currentPlayer.totalBet); // Set the last valid bet
      // Add the player to the list of those who have acted
      setPlayersWhoActed((prev) => [...new Set([...prev, currentPlayerIndex])]);
      // Find the next active player
      let nextIndex = currentPlayerIndex;
      do {
        nextIndex = (nextIndex + 1) % players.length;
      } while (!players[nextIndex].active);
  
      setCurrentPlayerIndex(nextIndex);
    } else {
      alert("Not enough chips to call!");
    }
  }
  
  
  
  
  function raise(amount: number) {
    const currentPlayer = players[currentPlayerIndex];
  
    // Validation: Ensure the raise is valid
    if (amount <= lastValidBet) {
      alert("Raise must be greater than the previous bet.");
      return;
    }
  
    if (amount > currentPlayer.chips) {
      alert("You cannot raise more than your available chips.");
      return;
    }
  
    // Deduct the raise amount from the player's chips
    currentPlayer.chips -= amount;
    currentPlayer.totalBet += amount;
    setPot((prev) => prev + amount);
  
    // Calculate the raise amount
    const raiseAmount = currentPlayer.totalBet - lastValidBet;
  
    // Update the last valid bet
    setLastValidBet(currentPlayer.totalBet);
  
    // Update the player's last action
    currentPlayer.lastAction = `Raise ${raiseAmount}`;
  
    setPlayersWhoActed((prev) => [...new Set([...prev, currentPlayerIndex])]);

    // Advance to the next turn
    nextTurn();
  }
  
  
  

  function areAllBetsEqual() {
    const activePlayers = players.filter((player) => player.active);
    const maxBet = Math.max(...activePlayers.map((player) => player.totalBet));
  
    return activePlayers.every((player) => player.totalBet === maxBet);
  }
  
  
  function checkWin() {
    // Check if only one player is left active
    const activePlayers = players.filter((player) => player.active);
    if (activePlayers.length === 1) {
      const winner = activePlayers[0];
      winner.chips += pot; // Award the pot to the last active player
      setPot(0);
      alert(`${winner.name} wins the pot of ${pot} chips!`);
      setGameOver(true);
      return;
    }
  
    // Check if the round should end
    if (playersWhoActed.length >= activePlayers.length) {
      if (areAllBetsEqual()) {
        endBettingRound();
        
        return;
      }
    }
  }
  
  
  
  function getNextActivePlayer(startIndex: number) {
    let nextIndex = startIndex;
    do {
      nextIndex = (nextIndex + 1) % players.length;
    } while (!players[nextIndex].active);
    return nextIndex;
  }
  

  function aiTakeTurn() {
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer.active) {
      nextTurn();
      return;
    }

    const maxBet = Math.max(...players.map((player) => player.totalBet));
    const decision = Math.random();

    if (decision < 0.3) {
      fold();
    } else if (decision < 0.7) {
      call();
    } else {
      const raiseAmount = Math.max(SMALL_BLIND, Math.min(currentPlayer.chips, maxBet + SMALL_BLIND));
      raise(raiseAmount);
    }
  }

  function nextTurn() {
    let nextIndex = currentPlayerIndex;
  
    do {
      nextIndex = (nextIndex + 1) % players.length;
    } while (!players[nextIndex].active || players[nextIndex].lastAction === "Fold");
  
    setCurrentPlayerIndex(nextIndex);
  }
  

  
  
  

  return (
    <div style={{ margin: "2rem", position: "relative" }}>
  {/* Start New Game Button */}
  <button
    onClick={startNewGame}
    className="start-button"
  >
    Start New Game
  </button>

  {/* Game Info in One Line */}
  <div className="game-info-line">
    <span>Pot: {pot} chips</span>
    <span>Previous Bet: {lastValidBet !== null ? `${lastValidBet} chips` : "None"}</span>
    <span>Round: {bettingRound}</span>
    <span>Game: {gameRound}</span>
    <span>
        Current Turn: {currentPlayerIndex >= 0 ? players[currentPlayerIndex]?.name : "Nobody"}
    </span>
  </div>

  {/* Community Cards */}
  <div className="community-cards">
    {communityCards.map((card, index) => (
        <div
        key={index}
        className="card"
        style={{
            backgroundColor: card ? "white" : "gray",
            color: card ? "black" : "transparent",
        }}
        >
        {card || "?"} {/* Display placeholders as "?" */}
        </div>
    ))}
    </div>


  {/* Player Actions */}
  <div className="player-actions">
    <button
      onClick={fold}
      disabled={gameOver || !gameStarted || !isUserTurn}
      className="action-button"
    >
      Fold
    </button>
    <button
      onClick={check}
      disabled={gameOver || !gameStarted || !isUserTurn}
      className="action-button"
    >
      Check
    </button>
    <button
      onClick={call}
      disabled={gameOver || !gameStarted || !isUserTurn}
      className="action-button"
    >
      Call
    </button>
    <button
      onClick={() => {
        const betAmount = prompt("Enter bet amount:");
        if (betAmount) raise(Number(betAmount));
      }}
      disabled={gameOver || !gameStarted || !isUserTurn}
      className="action-button"
    >
      Raise
    </button>
  </div>

  {/* Players Container */}
  <div className="players-container">
    {players.map((player, index) => (
      <div
      key={player.name}
      className={`player-box ${player.lastAction === "Fold" ? "player-folded" : ""} ${
        index === currentPlayerIndex ? "player-current" : ""
      }`}
    >
    
        <h3>{player.name}</h3>
        <p>Cards: {player.cards.length ? player.cards.join(", ") : "Not dealt"}</p>
        <p>Chips: {player.chips}</p>
        <p>Total Bet: {player.totalBet}</p>
        <p>Last Action: {player.lastAction}</p>
        <p>Win Likelihood: {(player.winLikelihood * 100).toFixed(2)}%</p>
      </div>
    ))}
  </div>
</div>

  );
};

export default PokerGame;
