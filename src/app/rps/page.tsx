"use client";

import React, { useState, useEffect } from 'react';


interface RegretRecord {
  Rock: number;
  Paper: number;
  Scissors: number;
}

const RockPaperScissors: React.FC = () => {
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [computerChoice, setComputerChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [regrets, setRegrets] = useState<RegretRecord>({ Rock: 0, Paper: 0, Scissors: 0 });
  const [scores, setScores] = useState({ user: 0, computer: 0, ties: 0 });
  const [isRunning, setIsRunning] = useState(false); 
  const [iterations, setIterations] = useState(0); 
  

  const choices: (keyof RegretRecord)[] = ['Rock', 'Paper', 'Scissors'];

  const rewards: Record<keyof RegretRecord, Record<keyof RegretRecord, number>> = {
    Rock: { Rock: 0, Paper: -1, Scissors: 1 },
    Paper: { Rock: 1, Paper: 0, Scissors: -1 },
    Scissors: { Rock: -1, Paper: 1, Scissors: 0 },
  };

  const playGame = (userSelection: keyof RegretRecord) => {
    const computerSelection = selectComputerMove();
    setUserChoice(userSelection);
    setComputerChoice(computerSelection);
    determineWinner(userSelection, computerSelection);
    updateRegrets(userSelection);
  };

  const selectComputerMove = (): keyof RegretRecord => {
    // Calculate the total positive regret
    const totalPositiveRegret = Object.values(regrets)
      .filter((r) => r > 0)
      .reduce((a, b) => a + b, 0);
  
    // If no positive regrets, choose randomly
    if (totalPositiveRegret === 0) {
      return choices[Math.floor(Math.random() * choices.length)];
    }
  
    // Calculate the probabilities for each choice
    const probabilities = choices.map((choice) => 
      Math.max(0, regrets[choice]) / totalPositiveRegret
    );
  
    // Choose a move based on the probabilities
    let random = Math.random();
    for (let i = 0; i < choices.length; i++) {
      if (random < probabilities[i]) {
        return choices[i];
      }
      random -= probabilities[i];
    }
  
    // Fallback (shouldn't happen due to rounding issues)
    return choices[0];
  };
  

  const determineWinner = (user: keyof RegretRecord, computer: keyof RegretRecord) => {
    if (user === computer) {
      setResult('It\'s a tie!');
      setScores((prev) => ({ ...prev, ties: prev.ties + 1 }));
    } else if (
      (user === 'Rock' && computer === 'Scissors') ||
      (user === 'Paper' && computer === 'Rock') ||
      (user === 'Scissors' && computer === 'Paper')
    ) {
      setResult('You win!');
      setScores((prev) => ({ ...prev, user: prev.user + 1 }));
    } else {
      setResult('You lose!');
      setScores((prev) => ({ ...prev, computer: prev.computer + 1 }));
    }
  };

  const updateRegrets = (user: keyof RegretRecord) => {
    const newRegrets = { ...regrets };
  
    choices.forEach((choice) => {
      if (choice === user) return;
  
      const counterfactualReward = rewards[choice][user]; // Reward if this choice was made
      const actualReward = rewards[user][user]; // Actual reward for the selected choice
  
      // Amplify the regret difference to strengthen learning
      const regretDifference = (counterfactualReward - actualReward) * 1.5;
      newRegrets[choice] += regretDifference;
    });
  
    setRegrets(newRegrets);
  };
  

  const simulateGame = () => {
    const userSelection: keyof RegretRecord = choices[Math.floor(Math.random() * choices.length)];
    const computerSelection = selectComputerMove();
    determineWinner(userSelection, computerSelection);
    updateRegrets(userSelection);
    setIterations((prev) => prev + 1);
  };

  const startSimulation = () => {
    setIsRunning(true);
  };

  const stopSimulation = () => {
    setIsRunning(false);
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      simulateGame();
    }, 10); // Simulate every 100ms

    return () => clearInterval(interval); // Cleanup on stop
  }, [isRunning]);

  return (
    <div style={{ textAlign: 'center', margin: '2rem' }}>
      <h1>Rock, Paper, Scissors</h1>
      <div>
        <button onClick={startSimulation} disabled={isRunning} style={{ margin: '1rem', padding: '0.5rem 1rem' }}>
          Start Simulation
        </button>
        <button onClick={stopSimulation} disabled={!isRunning} style={{ margin: '1rem', padding: '0.5rem 1rem' }}>
          Stop Simulation
        </button>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h3>Iterations: {iterations}</h3>
        <h3>Scores:</h3>
        <p>User Wins: {scores.user}</p>
        <p>Computer Wins: {scores.computer}</p>
        <p>Ties: {scores.ties}</p>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <h2>Make your choice:</h2>
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => playGame(choice)}
            style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}
          >
            {choice}
          </button>
        ))}
      </div>
      {userChoice && computerChoice && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Your choice: {userChoice}</h3>
          <h3>Computer's choice: {computerChoice}</h3>
          <h2>{result}</h2>
        </div>
      )}
      <div style={{ marginTop: '2rem', textAlign: 'left', padding: '1rem', border: '1px solid #ccc', display: 'inline-block' }}>
        <h3>Scores:</h3>
        <p>User Wins: {scores.user}</p>
        <p>Computer Wins: {scores.computer}</p>
        <p>Ties: {scores.ties}</p>
      </div>
      <div style={{ marginTop: '2rem', textAlign: 'left', padding: '1rem', border: '1px solid #ccc', display: 'inline-block' }}>
        <h3>Regret Tracking:</h3>
        <p>Rock: {regrets.Rock.toFixed(2)}</p>
        <p>Paper: {regrets.Paper.toFixed(2)}</p>
        <p>Scissors: {regrets.Scissors.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default RockPaperScissors;
