'use client';
// Import Declarations
import { useState, useEffect } from 'react';
import { useAnimate } from 'framer-motion';
import Link from 'next/link';
import './globals.css';

export default function Home() {
  // Constant Declarations
  const [wrapper1, animateWrapper1] = useAnimate();
  const [wrapper2, animateWrapper2] = useAnimate();
  const [scope1, animate1] = useAnimate();
  const [scope2, animate2] = useAnimate();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
 
  // Animations 
  const hoverSequence = [
    { rotate: -90, duration: 0.2 },
    { scale: 1.15, duration: 0.25 },
    { rotate: 0, duration: 0.3 },
    { scale: 1.5, duration: 0.35 },
  ];

  const startFloatingAnimation = () => {
    animateWrapper1(
      { y: [-10, 0] },
      { repeat: Infinity, duration: 4, ease: 'easeInOut' }
    );

    animateWrapper2(
      { y: [-10, 0] },
      { repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 2 }
    );
  };

  useEffect(() => {
    startFloatingAnimation();
  }, []);

  const applyBackgroundColor = (scope: HTMLElement | null, color: string) => {
    if (scope) {
      scope.style.transition = 'background-color 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
      scope.style.backgroundColor = color;
    }
  };

  const handleHover = async (
    animate: typeof animate1,
    scope: HTMLElement | null,
    cardIndex: number
  ) => {
    setHoveredCard(cardIndex);
    applyBackgroundColor(scope, 'var(--highlight-color)');
  
    if (scope) {
      try {
        for (const step of hoverSequence) {
          // Allow animations to complete in sequence
          await animate(scope, step, { duration: step.duration, ease: 'easeInOut' });
        }
      } catch (e) {
        console.warn('Hover animation interrupted:', e);
      }
    }
  };
  
  const handleLeave = async (
    animate: typeof animate1,
    scope: HTMLElement | null
  ) => {
    setHoveredCard(null);
    applyBackgroundColor(scope, 'var(--highlight-color-light)');
  
    if (scope) {
      try {
        // Immediately reset to a neutral state if not already there
        await animate(scope, { scale: 1, rotate: 0 }, { ease: 'easeInOut', duration: 0.2 });
  
        // Play the bounce-out animation
        await animate(scope, { scale: 1.1, y: -10 }, { type: 'spring', stiffness: 300, damping: 15 });
        await animate(scope, { scale: 1, y: 0 }, { duration: 0.2 });
      } catch (e) {
        console.warn('Leave animation interrupted:', e);
      }
    }
  };
  
  

  const getTitleStyle = (cardIndex: number) => {
    const isHovered = hoveredCard === cardIndex;
    const animationDelay = cardIndex === 1 ? '0s' : '2s';
    return {
      color: isHovered ? '#bb86fc' : 'inherit',
      animation: 'float 4s ease-in-out infinite',
      animationDelay,
    };
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
            <Link href="https://portfolio.tobie-developer.com">Portfolio</Link>
          </span>{' '}
          page.
        </p>

        <div className='cards-flexbox'>

          <div className="card-title">
            <Link href="/rockpaperscissors" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1
                style={getTitleStyle(1)}
                onMouseEnter={() => handleHover(animate1, scope1.current, 1)}
                onMouseLeave={() => handleLeave(animate1, scope1.current)}
              >
                Rock, Paper, Scissors
              </h1>
            </Link>
            <Link href="/texasholdem" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1
                style={getTitleStyle(2)}
                onMouseEnter={() => handleHover(animate2, scope2.current, 2)}
                onMouseLeave={() => handleLeave(animate2, scope2.current)}
              >
                Texas Hold &#39;Em
              </h1>
            </Link>
          </div>

          <div className="cards-container">
            <div
              ref={wrapper1}
              className="wrapper"
              style={{ animation: 'float 4s ease-in-out infinite' }}
              onMouseEnter={() => handleHover(animate1, scope1.current, 1)}
              onMouseLeave={() => handleLeave(animate1, scope1.current)}
            >
              <div className="animated-card" ref={scope1}>
                <Link href="/rockpaperscissors" style={{ textDecoration: 'none' }}>
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
            </div>

            <div
              ref={wrapper2}
              className="wrapper"
              style={{ animation: 'float 4s ease-in-out infinite', animationDelay: '2s' }}
              onMouseEnter={() => handleHover(animate2, scope2.current, 2)}
              onMouseLeave={() => handleLeave(animate2, scope2.current)}
            >
              <div className="animated-card" ref={scope2}>
                <Link href="/texasholdem" style={{ textDecoration: 'none' }}>
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
          </div>

        </div>
      </div>
    </>
  );
}
