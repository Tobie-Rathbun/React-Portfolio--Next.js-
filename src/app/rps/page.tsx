"use client";

import React, { useState, useEffect, useRef } from 'react';


interface RegretRecord {
  Rock: number;
  Paper: number;
  Scissors: number;
}

const RockPaperScissors: React.FC = () => {
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [computerChoice, setComputerChoice] = useState<string | null>(null);
  const [lastUserMove, setLastUserMove] = useState<keyof RegretRecord | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [regrets, setRegrets] = useState<RegretRecord>({ Rock: 0, Paper: 0, Scissors: 0 });
  const [scores, setScores] = useState({ user: 0, computer: 0, ties: 0 });
  const [isRunning, setIsRunning] = useState(false); 
  const [iterations, setIterations] = useState(0); 
  const lastSimulatedUserMoveRef = useRef<keyof RegretRecord | null>(null);
  const [behaviorType, setBehaviorType] = useState<'random' | 'patterned' | 'reactive'>('random');
  



  

  const choices: (keyof RegretRecord)[] = ['Rock', 'Paper', 'Scissors'];

  const rewards: Record<keyof RegretRecord, Record<keyof RegretRecord, number>> = {
    Rock: { Rock: 0, Paper: -2, Scissors: 3 },
    Paper: { Rock: 3, Paper: 0, Scissors: -2 },
    Scissors: { Rock: -2, Paper: 3, Scissors: 0 },
  };

  const playGame = (userSelection: keyof RegretRecord) => {
    updateTransitionMatrix(lastUserMove, userSelection);
    setLastUserMove(userSelection); // Update the last user move
  
    const predictedMove = predictNextMove(userSelection); // Use Markov chain to predict
    const computerSelection = selectCounterMove(predictedMove); // Counter the prediction
  
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
  
      const counterfactualReward = rewards[choice][user];
      const actualReward = rewards[user][user];
  
      // Increase the computer's ability to learn from mistakes
      const multiplier = result === 'You lose!' ? 1.5 : result === 'You win!' ? 0.75 : 1;
      const regretDifference = (counterfactualReward - actualReward) * multiplier;
  
      newRegrets[choice] += regretDifference;
    });
  
    setRegrets(newRegrets);
  };
  
  
  const [transitionMatrix, setTransitionMatrix] = useState<Record<keyof RegretRecord, Record<keyof RegretRecord, number>>>({
    Rock: { Rock: 0, Paper: 0, Scissors: 0 },
    Paper: { Rock: 0, Paper: 0, Scissors: 0 },
    Scissors: { Rock: 0, Paper: 0, Scissors: 0 },
  });

  const updateTransitionMatrix = (prevMove: keyof RegretRecord | null, currentMove: keyof RegretRecord) => {
    if (prevMove) {
      setTransitionMatrix((prevMatrix) => {
        const newMatrix = { ...prevMatrix };
        newMatrix[prevMove][currentMove] += 1;
        console.log(`Matrix Updated: ${prevMove} -> ${currentMove}: ${newMatrix[prevMove][currentMove]}`);
        return newMatrix;
      });
    }
  };
  
  
  
  
  const formatTransitionMatrix = () => {
    return (
      <table style={{ borderCollapse: 'collapse', margin: '1rem auto' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '0.5rem' }}>From/To</th>
            {choices.map((choice) => (
              <th key={choice} style={{ border: '1px solid black', padding: '0.5rem' }}>{choice}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {choices.map((from) => (
            <tr key={from}>
              <td style={{ border: '1px solid black', padding: '0.5rem' }}>{from}</td>
              {choices.map((to) => (
                <td key={to} style={{ border: '1px solid black', padding: '0.5rem' }}>
                  {transitionMatrix[from][to]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  
  

  const predictNextMove = (lastMove: keyof RegretRecord): keyof RegretRecord => {
    const probabilities = transitionMatrix[lastMove];
    const totalTransitions = Object.values(probabilities).reduce((a, b) => a + b, 0);
  
    if (totalTransitions === 0) {
      return choices[Math.floor(Math.random() * choices.length)];
    }
  
    // Normalize probabilities
    const normalizedProbabilities = Object.fromEntries(
      Object.entries(probabilities).map(([key, value]) => [
        key,
        value / totalTransitions,
      ])
    ) as Record<keyof RegretRecord, number>;
  
    // Choose the move with the highest probability
    const bestMove = Object.keys(normalizedProbabilities).reduce((a, b) =>
      normalizedProbabilities[a as keyof RegretRecord] >
      normalizedProbabilities[b as keyof RegretRecord]
        ? a
        : b
    ) as keyof RegretRecord;
  
    return bestMove;
  };
  
  
  

  const selectCounterMove = (predictedMove: keyof RegretRecord): keyof RegretRecord => {
    if (predictedMove === 'Rock') return 'Paper';
    if (predictedMove === 'Paper') return 'Scissors';
    return 'Rock';
  };
  

  const simulateGame = () => {
    // Randomly select a simulated user move
    const userSelection: keyof RegretRecord = choices[Math.floor(Math.random() * choices.length)];
  
    // Use lastSimulatedUserMoveRef or lastUserMove for the first iteration
    const prevMove = lastSimulatedUserMoveRef.current || lastUserMove || userSelection; // Fallback to current selection if null
  
    // Update the transition matrix for the current move
    updateTransitionMatrix(prevMove, userSelection);
  
    // Update the ref immediately for the next iteration
    lastSimulatedUserMoveRef.current = userSelection;
  
    const predictedMove = predictNextMove(userSelection);
    const computerSelection = selectCounterMove(predictedMove);
    determineWinner(userSelection, computerSelection);
    updateRegrets(userSelection);
  
    // Increment the simulation count
    setIterations((prev) => prev + 1);
  
    console.log(`Simulated transition from ${prevMove} to ${userSelection}`);
    console.log(`Last simulated user move updated to: ${lastSimulatedUserMoveRef.current}`);
    console.log(`Transition Matrix After Update:`, transitionMatrix);
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
    <div className="flex-container">
      <div className="flex-item">
        <h1>Rock, Paper, Scissors</h1>
        <div>
          <div>
            <label htmlFor="behavior-select">Behavior Type:</label>
            <select
              id="behavior-select"
              value={behaviorType}
              onChange={(e) => setBehaviorType(e.target.value as 'random' | 'patterned' | 'reactive')}
              disabled={isRunning} // Prevent changes during simulation
            >
              <option value="random">Random</option>
              <option value="patterned">Patterned</option>
              <option value="reactive">Reactive</option>
            </select>
          </div>

          <button onClick={startSimulation} disabled={isRunning} className="btn">
            Start Simulation
          </button>
          <button onClick={stopSimulation} disabled={!isRunning} className="btn">
            Stop Simulation
          </button>
        </div>
      </div>
      <div className="flex-item">
        <h3>Iterations: {iterations}</h3>
        <h3>Scores:</h3>
        <p>User Wins: {scores.user}</p>
        <p>Computer Wins: {scores.computer}</p>
        <p>Ties: {scores.ties}</p>
      </div>
      <div className="flex-item">
        <h2>Make your choice:</h2>
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => playGame(choice)}
            className="choice-btn"
          >
            {choice}
          </button>
        ))}
        {userChoice && computerChoice && (
          <div className="results-container">
            <h3>Your choice: {userChoice}</h3>
            <h3>Computer's choice: {computerChoice}</h3>
            <h2>{result}</h2>
          </div>
        )}
      </div>
      <div className='stats-container'>
        <div className="stats-box">
          <h3>Scores:</h3>
          <p>User Wins: {scores.user}</p>
          <p>Computer Wins: {scores.computer}</p>
          <p>Ties: {scores.ties}</p>
        </div>
        <div className="stats-box">
          <h3>Regret Tracking:</h3>
          <p>Rock: {regrets.Rock.toFixed(2)}</p>
          <p>Paper: {regrets.Paper.toFixed(2)}</p>
          <p>Scissors: {regrets.Scissors.toFixed(2)}</p>
        </div>
        <div className="stats-box matrix-box">
          <h3>Transition Matrix:</h3>
          {formatTransitionMatrix()}
        </div>
      </div>
    </div>
  );
};

export default RockPaperScissors;
