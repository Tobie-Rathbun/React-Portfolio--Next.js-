// File: src/app/components/PokerGUI.tsx

import React, { useState, useEffect } from 'react';

interface PokerGUIProps {
    blind: number;
    increaseBet: () => void;
    decreaseBet: () => void;
    sliderValue: number;
    handleSliderChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setSliderValue: React.Dispatch<React.SetStateAction<number>>;
}

const PokerGUI: React.FC<PokerGUIProps> = ({ sliderValue, setSliderValue, blind }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [guiPosition, setGuiPosition] = useState({ x: '50%', y: '50%' });
    const [isMinimized, setIsMinimized] = useState(false);
    const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
    const [initialGuiPosition, setInitialGuiPosition] = useState({ x: 0, y: 0 });

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement; // Cast event.target to HTMLElement
        if (!target.classList.contains('slider') && !target.classList.contains('gui-button')) {
            setIsDragging(true);
            setInitialMousePosition({ x: event.clientX, y: event.clientY });

            const xValue = guiPosition.x.includes('%')
                ? (parseFloat(guiPosition.x) / 100) * window.innerWidth
                : parseFloat(guiPosition.x);

            const yValue = guiPosition.y.includes('%')
                ? (parseFloat(guiPosition.y) / 100) * window.innerHeight
                : parseFloat(guiPosition.y);

            setInitialGuiPosition({ x: xValue, y: yValue });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (event: MouseEvent) => {
        if (isDragging) {
            const deltaX = event.clientX - initialMousePosition.x;
            const deltaY = event.clientY - initialMousePosition.y;
            const newX = Math.max(0, Math.min(window.innerWidth - (isMinimized ? 100 : 400), initialGuiPosition.x + deltaX));
            const newY = Math.max(0, Math.min(window.innerHeight - (isMinimized ? 40 : 200), initialGuiPosition.y + deltaY));
            setGuiPosition({ x: `${newX}px`, y: `${newY}px` });
        }
    };

    const handleMouseLeave = () => setIsDragging(false);

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => setSliderValue(parseInt(event.target.value));

    const increaseBet = () => setSliderValue((prev) => Math.min(prev + 100, 1000));
    const decreaseBet = () => setSliderValue((prev) => Math.max(prev - 100, blind));
    const toggleGui = () => setIsMinimized((prev) => !prev);

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

    return (
        <div
            className="gui-container purple-gui"
            style={{
                left: guiPosition.x,
                top: guiPosition.y,
                position: 'absolute',
                height: isMinimized ? '40px' : '200px',
                width: isMinimized ? '100px' : '400px',
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="gui-button" onClick={toggleGui} style={{ marginLeft: 'auto', marginRight: '5px' }}>
                    {isMinimized ? '+' : '-'}
                </button>
            </div>
            {!isMinimized && (
                <>
                    <div className="slider-container">
                        <input
                            type="range"
                            min={blind}
                            max="1000"
                            value={sliderValue}
                            onChange={handleSliderChange}
                            className="slider"
                            id="myRange"
                        />
                        <p>Value: {sliderValue}</p>
                    </div>
                    <div className="button-container">
                        <button className="gui-button" onClick={() => { /* fold logic */ }}>Fold</button>
                        <button className="gui-button" onClick={() => { /* check logic */ }}>Check</button>
                        <button className="gui-button" onClick={() => { /* call logic */ }}>Call</button>
                        <button className="gui-button" onClick={() => { /* raise logic */ }}>Raise</button>
                        <button className="gui-button" onClick={decreaseBet}>-</button>
                        <button className="gui-button" onClick={increaseBet}>+</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PokerGUI;
