'use client';

import { useState, RefObject } from 'react';
import { useAnimate } from 'framer-motion';
import Link from 'next/link';
import './globals.css';

export default function Home() {
  const [scope1, animate1] = useAnimate();
  const [scope2, animate2] = useAnimate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const hoverSequence = [
    { rotate: -90 },
    { scale: 1.15 },
    { rotate: 0 },
    { scale: 1.5 },
  ];

  const leaveSequence = [
    { scale: 1, rotate: 0 },
  ];

  const floatAnimation = {
    animation: 'float 4s ease-in-out infinite',
  };

  const staggeredFloatAnimation = (index: number) => ({
    animation: `float 4s ease-in-out infinite`,
    animationDelay: `${index * 2}s`,
  });

  const handleHover = async (
    animate: typeof animate1,
    scope: RefObject<HTMLElement>,
    cardIndex: number
  ) => {
    setHoveredCard(cardIndex);
    if (scope.current) {
      await animate(scope.current, { rotate: 0, scale: 1 }, { duration: 0 }); // Reset state
      for (const step of hoverSequence) {
        await animate(scope.current, step, { duration: 0.2, ease: 'easeInOut' });
      }
    }
  };

  const handleLeave = async (
    animate: typeof animate1,
    scope: RefObject<HTMLElement>
  ) => {
    setHoveredCard(null);
    if (scope.current) {
      for (const step of leaveSequence) {
        await animate(scope.current, step, { duration: 0.2, ease: 'easeInOut' });
      }
      animate(scope.current, floatAnimation);
    }
  };

  return (
    <>
      <div className="-page">
        <h1>
          Howdy <span className="emoji" id="cowboy">&#x1F920;</span>
        </h1>
        <p>
          If you are looking for my qualifications and skillsets, check out my{' '}
          <span className="link">
            <Link href="/about">About</Link>
          </span>{' '}
          page.
        </p>

        <div className="cards-container">
          <div
            className="animated-card"
            ref={scope1}
            style={hoveredCard === 1 ? {} : staggeredFloatAnimation(0)}
            onMouseEnter={() => handleHover(animate1, scope1, 1)}
            onMouseLeave={() => handleLeave(animate1, scope1)}
          >
            <Link href="/rps" style={{ textDecoration: 'none' }}>
              <div className="card-content">
                <div className="emoji-container">
                  <div className="emoji" id="rock">
                    <img src="/images/rock-emoji.png" alt="Rock" className="emoji" />
                  </div>
                  <div className="emoji" id="paper">
                    <img src="/images/paper-emoji.png" alt="Paper" className="emoji" />
                  </div>
                  <div className="emoji" id="scissors">
                    <img src="/images/scissors-emoji.png" alt="Scissors" className="emoji" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div
            className="animated-card"
            ref={scope2}
            style={hoveredCard === 2 ? {} : staggeredFloatAnimation(1)}
            onMouseEnter={() => handleHover(animate2, scope2, 2)}
            onMouseLeave={() => handleLeave(animate2, scope2)}
          >
            <Link href="/rps" style={{ textDecoration: 'none' }}>
              <div className="card-content">
                <h2 className="emoji-flex-container">
                  <span className="emoji">&#9824;&#65039;</span>
                  <span className="emoji" id="heart">&#9829;&#65039;</span>
                  <span className="emoji">&#9827;&#65039;</span>
                </h2>
              </div>
            </Link>
          </div>
        </div>

        <div className="card-title">
          <h1
            style={{
              color: hoveredCard === 1 ? '#bb86fc' : 'inherit',
              ...staggeredFloatAnimation(0),
              marginLeft: '-2.5%',
            }}
          >
            Rock, Paper, Scissors
          </h1>
          <h1
            style={{
              color: hoveredCard === 2 ? '#bb86fc' : 'inherit',
              ...staggeredFloatAnimation(1),
              marginLeft: '6%',
            }}
          >
            Texas Hold &#39;Em
          </h1>
        </div>
      </div>
    </>
  );
}
