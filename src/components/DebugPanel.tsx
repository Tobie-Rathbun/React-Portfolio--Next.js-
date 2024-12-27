// File: src/app/components/DebugPanel.tsx

import React, { useState, useEffect } from 'react';

interface DebugPanelProps {
    cardNames: string[];
}

const DebugPanel: React.FC<DebugPanelProps> = ({ cardNames }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [panelPosition, setPanelPosition] = useState({ x: '25%', y: '25%' });
    const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
    const [initialPanelPosition, setInitialPanelPosition] = useState({ x: 0, y: 0 });

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        setInitialMousePosition({ x: event.clientX, y: event.clientY });

        const xValue = panelPosition.x.includes('%')
            ? (parseFloat(panelPosition.x) / 100) * window.innerWidth
            : parseFloat(panelPosition.x);

        const yValue = panelPosition.y.includes('%')
            ? (parseFloat(panelPosition.y) / 100) * window.innerHeight
            : parseFloat(panelPosition.y);

        setInitialPanelPosition({ x: xValue, y: yValue });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (event: MouseEvent) => {
        if (isDragging) {
            const deltaX = event.clientX - initialMousePosition.x;
            const deltaY = event.clientY - initialMousePosition.y;
            const newX = Math.max(0, Math.min(window.innerWidth - 400, initialPanelPosition.x + deltaX));
            const newY = Math.max(0, Math.min(window.innerHeight - 200, initialPanelPosition.y + deltaY));
            setPanelPosition({ x: `${newX}px`, y: `${newY}px` });
        }
    };

    const handleMouseLeave = () => setIsDragging(false);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isDragging]);

    useEffect(() => {
        console.log("DebugPanel Received cardNames:", cardNames);
    }, [cardNames]);

    if (!cardNames || cardNames.length < 15) {
        return <div className="debug-panel">Loading cards...</div>;
    }

    return (
        <div
            className="debug-panel"
            style={{
                left: panelPosition.x,
                top: panelPosition.y,
                position: 'absolute',
                width: '300px',
                height: '200px',
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '10px',
            }}
            onMouseDown={handleMouseDown}
        >
            <h3>Debug Panel</h3>
            <p>Player 0: {cardNames[0]}, {cardNames[1]}</p>
            <p>Player 1: {cardNames[2]}, {cardNames[3]}</p>
            <p>Player 2: {cardNames[4]}, {cardNames[5]}</p>
            <p>Player 3: {cardNames[6]}, {cardNames[7]}</p>
            <p>Player 4: {cardNames[8]}, {cardNames[9]}</p>
            <p>Community Cards: {cardNames[10]}, {cardNames[11]}, {cardNames[12]}, {cardNames[13]}, {cardNames[14]}</p>
        </div>
    );
};

export default DebugPanel;
