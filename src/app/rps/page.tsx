"use client";

import React, { useState, useEffect, useRef } from 'react';

export const dynamic = 'force-dynamic';

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
  const [behaviorType, setBehaviorType] = useState<'patterned' | 'reactive' | 'random'>('patterned');
  const [aiResponseMatrix, setAiResponseMatrix] = useState<Record<keyof RegretRecord, Record<keyof RegretRecord, number>>>({
    Rock: { Rock: 0, Paper: 0, Scissors: 0 },
    Paper: { Rock: 0, Paper: 0, Scissors: 0 },
    Scissors: { Rock: 0, Paper: 0, Scissors: 0 },
  });
  

  // Constants for AI behavior
  
  const baseTransitionExp = 2.5; // Default transition exponent
  const minTransitionExp = 1.5;  // Minimum allowable exponent
  const maxTransitionExp = 4.0;  // Maximum allowable exponent
  const adjustmentFactor = 0.1;  // Rate of exponent adjustment
  const [dynamicTransitionExp, setDynamicTransitionExp] = useState(baseTransitionExp);


  const baseUserWeight = 0.8; // Default weight for user move prediction
  const baseAiWeight = 0.2;  // Default weight for AI response matrix

  // Amplification for regret updates
  const regretAmplification = 3;

  
  const choices: (keyof RegretRecord)[] = ['Rock', 'Paper', 'Scissors'];

  const rewards: Record<keyof RegretRecord, Record<keyof RegretRecord, number>> = {
    Rock: { Rock: 0, Paper: -2, Scissors: 3 },
    Paper: { Rock: 3, Paper: 0, Scissors: -2 },
    Scissors: { Rock: -2, Paper: 3, Scissors: 0 },
  };

  const resetGame = () => {
    setUserChoice(null);
    setComputerChoice(null);
    setResult(null);
    setRegrets({ Rock: 0, Paper: 0, Scissors: 0 });
    setScores({ user: 0, computer: 0, ties: 0 });
    setIterations(0);
    setTransitionMatrix({
      Rock: { Rock: 0, Paper: 0, Scissors: 0 },
      Paper: { Rock: 0, Paper: 0, Scissors: 0 },
      Scissors: { Rock: 0, Paper: 0, Scissors: 0 },
    });
    lastSimulatedUserMoveRef.current = null;
    setLastUserMove(null);
    console.log("Game has been reset");
  };
  

  const playGame = (userSelection: keyof RegretRecord) => {
    const aiSelection = selectComputerMove();
  
    if (lastUserMove) {
      updateTransitionMatrix(lastUserMove, userSelection);
      updateAiResponseMatrix(aiSelection, userSelection);
    }
  
    setLastUserMove(userSelection);
    determineWinner(userSelection, aiSelection);
    updateRegrets(userSelection);
  };
  
  const calculatePerformanceRatio = () => {
    const totalGames = scores.user + scores.computer + scores.ties;
    if (totalGames === 0) return 0.5; // Neutral ratio if no games played
  
    return scores.computer / (scores.user + scores.computer);
  };
  

  const selectComputerMove = (): keyof RegretRecord => {
    const lastMove = lastSimulatedUserMoveRef.current || lastUserMove;

    if (lastMove) {
        const userProbabilities = transitionMatrix[lastMove];
        const aiProbabilities = aiResponseMatrix[lastMove];

        const totalUserTransitions = Object.values(userProbabilities).reduce((a, b) => a + b, 0);
        const totalAiResponses = Object.values(aiProbabilities).reduce((a, b) => a + b, 0);

        if (totalUserTransitions > 0) {
            // Calculate combined probabilities
            const combinedProbabilities: Record<keyof RegretRecord, number> = { Rock: 0, Paper: 0, Scissors: 0 };

            choices.forEach((choice) => {
                const userWeighting = (userProbabilities[choice] / totalUserTransitions) ** dynamicTransitionExp;
                const aiWeighting = totalAiResponses > 0
                    ? (aiProbabilities[choice] / totalAiResponses) ** 1.5 // Reactive behavior
                    : 0;

                combinedProbabilities[choice] =
                    baseUserWeight * userWeighting +
                    baseAiWeight * aiWeighting;
            });

            const total = Object.values(combinedProbabilities).reduce((a, b) => a + b, 0);
            const normalized = choices.map((choice) => combinedProbabilities[choice] / total);

            // Predict the most probable user move
            let random = Math.random();
            for (let i = 0; i < choices.length; i++) {
                if (random < normalized[i]) {
                    const predictedMove = choices[i];
                    // Use `selectCounterMove` to counter the predicted move
                    return selectCounterMove(predictedMove);
                }
                random -= normalized[i];
            }
        }
    }

    // Fallback to regret minimization
    const totalPositiveRegret = Object.values(regrets).filter((r) => r > 0).reduce((a, b) => a + b, 0);

    if (totalPositiveRegret > 0) {
        const probabilities = choices.map((choice) => Math.max(0, regrets[choice]) / totalPositiveRegret);
        let random = Math.random();
        for (let i = 0; i < choices.length; i++) {
            if (random < probabilities[i]) {
                return choices[i];
            }
            random -= probabilities[i];
        }
    }

    // Random fallback
    return choices[Math.floor(Math.random() * choices.length)];
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





  const updateAiResponseMatrix = (aiMove: keyof RegretRecord, userMove: keyof RegretRecord) => {
    setAiResponseMatrix((prevMatrix) => {
      const newMatrix = { ...prevMatrix };
      newMatrix[aiMove][userMove] += 1;
      return newMatrix;
    });
  };
  







  const updateRegrets = (user: keyof RegretRecord) => {
    const newRegrets = { ...regrets };
  
    choices.forEach((choice) => {
      if (choice === user) return;
  
      const counterfactualReward = rewards[choice][user];
      const actualReward = rewards[user][user];
  
      const regretDifference = (counterfactualReward - actualReward) * regretAmplification;
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
        console.log({
          prevMove,
          currentMove,
          beforeUpdate: prevMatrix[prevMove][currentMove],
          afterUpdate: newMatrix[prevMove][currentMove],
        });        
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
  
  
  

  
  
  
  
  
  

  const selectCounterMove = (predictedMove: keyof RegretRecord): keyof RegretRecord => {
    if (predictedMove === 'Rock') return 'Paper';
    if (predictedMove === 'Paper') return 'Scissors';
    return 'Rock';
  };
  

  const simulateGame = () => {
    const userSelection: keyof RegretRecord = choices[Math.floor(Math.random() * choices.length)];
    const aiSelection = selectComputerMove();
  
    if (lastSimulatedUserMoveRef.current) {
      updateTransitionMatrix(lastSimulatedUserMoveRef.current, userSelection);
      updateAiResponseMatrix(aiSelection, userSelection);
    }
  
    lastSimulatedUserMoveRef.current = userSelection;
    determineWinner(userSelection, aiSelection);
    updateRegrets(userSelection);
  
    setIterations((prev) => prev + 1);
  };
  
  
  type Position = { x: number; y: number };
  type Positions = {
    c1: Position;
    c2: Position;
    c3: Position;
    c4: Position;
    c5: Position;
    c6: Position;
  };

  const useDraggable = (
    id: keyof Positions,
    setPositions: React.Dispatch<React.SetStateAction<Positions>>
  ): {
    position: Position;
    zIndex: number;
    handleMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  } => {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
    const [zIndex, setZIndex] = useState<number>(0);
  
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>): void => {
      setIsDragging(true);
      setZIndex(9999);
  
      const elementPosition = positions[id]; // Get the current position from state
      setOffset({
        x: event.clientX - elementPosition.x, // Calculate the offset relative to the stored position
        y: event.clientY - elementPosition.y,
      });
    };
  
    const handleMouseUp = (): void => {
      setIsDragging(false);
      setZIndex(6); // Reset z-index
    };
  
    const handleMouseMove = (event: MouseEvent): void => {
      if (!isDragging) return;
  
      setPositions((prev) => ({
        ...prev,
        [id]: {
          x: event.clientX - offset.x, // Adjust position by the offset
          y: event.clientY - offset.y,
        },
      }));
    };
  
    useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
  
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, offset]);
  
    return { position: positions[id], zIndex, handleMouseDown };
  };
  





  const [positions, setPositions] = useState<Positions>({
    c1: { x: 0, y: 0 },
    c2: { x: 0, y: 0 },
    c3: { x: 0, y: 0 },
    c4: { x: 0, y: 0 },
    c5: { x: 0, y: 0 },
    c6: { x: 0, y: 0 },
  });
  
  useEffect(() => {
    setPositions(initializePositions());
  }, []);
  
  
  const c1Draggable = useDraggable('c1', setPositions);
  const c2Draggable = useDraggable('c2', setPositions);
  const c3Draggable = useDraggable('c3', setPositions);
  const c4Draggable = useDraggable('c4', setPositions);
  const c5Draggable = useDraggable('c5', setPositions);
  const c6Draggable = useDraggable('c6', setPositions);
  
  const initializePositions = (): Positions => {
    const isSmallScreen = window.innerWidth <= 1300;
    const isVerySmallScreen = window.innerWidth <= 480;
  
    if (isVerySmallScreen) {
      return {
        c1: { x: window.innerWidth * 0.1, y: window.innerHeight * 0.05 },
        c2: { x: window.innerWidth * 0.3, y: window.innerHeight * 0.05 },
        c3: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.05 },
        c4: { x: window.innerWidth * 0.7, y: window.innerHeight * 0.3 },
        c5: { x: window.innerWidth * 0.9, y: window.innerHeight * 0.3 },
        c6: { x: window.innerWidth * 0.7, y: window.innerHeight * 0.6 },
      };
    }
  
    if (isSmallScreen) {
      return {
        c1: { x: window.innerWidth * 0.02, y: window.innerHeight * 0 }, // 5% from left, 10% from top
        c2: { x: window.innerWidth * 0.343, y: window.innerHeight * 0 }, // 35% from left, 10% from top
        c3: { x: window.innerWidth * 0.665, y: window.innerHeight * 0 }, // 65% from left, 10% from top
        c4: { x: window.innerWidth * 0.327, y: window.innerHeight * 0.45 }, // 25% from left, 50% from top
        c5: { x: window.innerWidth * 0.53, y: window.innerHeight * 0.45 },  // 50% from left, 50% from top
        c6: { x: window.innerWidth * 0.75, y: window.innerHeight * 0.485 }, // 75% from left, 50% from top
      };
    }
  
    return {
      c1: { x: window.innerWidth * 0.02, y: window.innerHeight * 0 }, // 5% from left, 10% from top
      c2: { x: window.innerWidth * 0.25, y: window.innerHeight * 0 }, // 35% from left, 10% from top
      c3: { x: window.innerWidth * 0.48, y: window.innerHeight * 0 }, // 65% from left, 10% from top
      c4: { x: window.innerWidth * 0.24, y: window.innerHeight * 0.35 }, // 25% from left, 50% from top
      c5: { x: window.innerWidth * 0.47, y: window.innerHeight * 0.35 },  // 50% from left, 50% from top
      c6: { x: window.innerWidth * 0.7, y: window.innerHeight * 0.37 }, // 75% from left, 50% from top
    };
  };
  
  const startSimulation = () => {
    setIsRunning(true);
  };

  const stopSimulation = () => {
    setIsRunning(false);
  };
  
  
  /* Ai Performance Check*/
  useEffect(() => {
    const performanceRatio = calculatePerformanceRatio();
  
    setDynamicTransitionExp((prevExp) => {
      if (performanceRatio < 0.5) {
        // AI is losing: Increase the exponent to emphasize patterns
        return Math.min(prevExp + adjustmentFactor, maxTransitionExp);
      } else if (performanceRatio > 0.5) {
        // AI is winning: Decrease the exponent to stabilize decisions
        return Math.max(prevExp - adjustmentFactor, minTransitionExp);
      }
  
      // Keep it stable for ties or neutral performance
      return prevExp;
    });
  }, [scores]); // Trigger whenever scores are updated
  

  // Run Simulation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      simulateGame();
    }, 10); // Simulate every x(ms)

    return () => clearInterval(interval); // Cleanup on stop
  }, [isRunning]);


  // Update Positions
  useEffect(() => {
    const updatePositions = () => {
      setPositions({
        c1: { x: window.innerWidth * 0.05, y: window.innerHeight * 0.0 },
        c2: { x: window.innerWidth * 0.35, y: window.innerHeight * 0.0 },
        c3: { x: window.innerWidth * 0.65, y: window.innerHeight * 0.0 },
        c4: { x: window.innerWidth * 0.4, y: window.innerHeight * 0.4 },
        c5: { x: window.innerWidth * 0.6, y: window.innerHeight * 0.4 },
        c6: { x: window.innerWidth * 0.8, y: window.innerHeight * 0.4 },
      });
    };
  
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, []);



  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      document.documentElement.style.setProperty('--dynamic-scale', Math.min(window.innerWidth / 1200, 1).toString());
    };
  
    window.addEventListener('resize', handleResize);
    handleResize();
  
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const updateDynamicPositions = () => {
      const newPositions = initializePositions();
      setPositions(newPositions);
    };
  
    updateDynamicPositions(); // Set initial positions
    window.addEventListener('resize', updateDynamicPositions);
  
    return () => {
      window.removeEventListener('resize', updateDynamicPositions);
    };
  }, [initializePositions]);
  
  
  

  return (
    <div className="flex-container">
      <div
        id="c1"
        className="flex-item"
        style={{
          position: 'absolute',
          left: c1Draggable.position.x,
          top: c1Draggable.position.y,
          zIndex: c1Draggable.zIndex, 
        }}
        onMouseDown={c1Draggable.handleMouseDown}
      >
        <h1>Rock, Paper, Scissors AI</h1>
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
          <button
            onClick={resetGame} disabled={isRunning} className="btn">
            Reset
          </button>
        </div>
      </div>
      <div
        id="c2"
        className="flex-item"
        style={{
          position: 'absolute',
          left: c2Draggable.position.x,
          top: c2Draggable.position.y,
          zIndex: c2Draggable.zIndex, // Apply dynamic z-index
        }}
        onMouseDown={c2Draggable.handleMouseDown}
      >
        <h1>Iterations: {iterations}</h1>
        <div className='horiz-container'>
          <p>User: {scores.user}</p>
          <p>AI: {scores.computer}</p>
          <p>Ties: {scores.ties}</p>
        </div>
        <div>
          <h3>Dynamic Exponent: {dynamicTransitionExp.toFixed(2)}</h3>
        </div>
      </div>
      <div
        id="c3"
        className="flex-item"
        style={{
          position: 'absolute',
          left: c3Draggable.position.x,
          top: c3Draggable.position.y,
          zIndex: c3Draggable.zIndex, // Apply dynamic z-index
        }}
        onMouseDown={c3Draggable.handleMouseDown}
      >
        <h2>Make your choice:</h2>
        <div className='horiz-container'>
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
            <h3><span>Your choice: </span><span>{userChoice}</span></h3>
            <h3><span>AI&#39;s choice: </span><span>{computerChoice}</span></h3>
            <h4>{result}</h4>
          </div>
        )}
        </div>
      </div>
      <div className='stats-container'>
      <div
        id="c4"
        className="stats-box"
        style={{
          position: 'absolute',
          left: c4Draggable.position.x,
          top: c4Draggable.position.y,
          zIndex: c4Draggable.zIndex, // Apply dynamic z-index
        }}
        onMouseDown={c4Draggable.handleMouseDown}
      >
          <h3>Rounds Won:</h3>
          <p>User: {scores.user}</p>
          <p>AI: {scores.computer}</p>
          <p>Ties: {scores.ties}</p>
        </div>
        <div
        id="c5"
        className="stats-box"
        style={{
          position: 'absolute',
          left: c5Draggable.position.x,
          top: c5Draggable.position.y,
          zIndex: c5Draggable.zIndex, // Apply dynamic z-index
        }}
        onMouseDown={c5Draggable.handleMouseDown}
      >
          <h3>Regret Tracking:</h3>
          <p>Rock: {regrets.Rock.toFixed(2)}</p>
          <p>Paper: {regrets.Paper.toFixed(2)}</p>
          <p>Scissors: {regrets.Scissors.toFixed(2)}</p>
        </div>
        <div
          id="c6"
          className="matrix-box"
          style={{
            position: 'absolute',
            left: c6Draggable.position.x,
            top: c6Draggable.position.y,
            zIndex: c6Draggable.zIndex, // Apply dynamic z-index
          }}
          onMouseDown={c6Draggable.handleMouseDown}
        >
          <h3>(Markov Chain) Transition Matrix:</h3>
          {formatTransitionMatrix()}
        </div>
      </div>
    </div>
  );
};

export default RockPaperScissors;
