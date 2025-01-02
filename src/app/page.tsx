'use client';

import { useEffect, RefObject } from 'react';
import { useAnimate } from 'framer-motion';
import Link from 'next/link';
import './globals.css';

export default function Home() {
  const [scope1, animate1] = useAnimate();
  const [scope2, animate2] = useAnimate();

  // Properly type the parameters
  function handleHover(
    animate: typeof animate1,
    scope: RefObject<HTMLDivElement>
  ) {
    if (scope.current) {
      animate([
        [scope.current, { rotate: -90 }],
        [scope.current, { scale: 1.15 }],
        [scope.current, { rotate: 0 }],
        [scope.current, { scale: 1.5 }],
      ]);
    }
  }

  function handleLeave(
    animate: typeof animate1,
    scope: RefObject<HTMLDivElement>
  ) {
    if (scope.current) {
      animate([[scope.current, { scale: 1 }]]);
    }
  }

  // Add the useEffect hook for Chrome-specific fallback
  useEffect(() => {
    if (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) {
      const emojiImages = [
        { id: 'rock', src: '/images/rock-emoji.png', alt: 'Rock' },
        { id: 'paper', src: '/images/paper-emoji.png', alt: 'Paper' },
        { id: 'scissors', src: '/images/scissors-emoji.png', alt: 'Scissors' },
      ];

      emojiImages.forEach(({ id, src, alt }) => {
        const container = document.querySelector(`.emoji-container#${id}`);
        if (container) {
          container.innerHTML = `<img src="${src}" alt="${alt}" class="emoji" />`;
        }
      });
    }
  }, []); // Runs once on component mount

  return (
    <>
      {/* Main Content */}
      <div className="-page">
        <h1>
          Howdy <span className="emoji">&#x1F920;</span>
        </h1>
        <p>
          If you are looking for my qualifications and skillsets, check out my{' '}
          <span className="link">
            <Link href="/about">About</Link>
          </span>{' '}
          page.
        </p>

        <div className="cards-container">
          {/* Card 1 */}
          <div
            className="animated-card"
            ref={scope1}
            onMouseEnter={() => handleHover(animate1, scope1)}
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

          {/* Card 2 */}
          <div
            className="animated-card"
            ref={scope2}
            onMouseEnter={() => handleHover(animate2, scope2)}
            onMouseLeave={() => handleLeave(animate2, scope2)}
          >
            <Link href="/rps" style={{ textDecoration: 'none' }}>
              <div className="card-content">
                <h2>
                  <span className="emoji">&#9824;&#65039;</span>
                  <span className="emoji" id="heart">&#9829;&#65039;</span>
                  <span className="emoji">&#9827;&#65039;</span>
                </h2>
              </div>
            </Link>
          </div>
        </div>

        <div className="card-title">
          <h1>Rock, Paper, Scissors</h1>
          <h1 className="card-poker">Texas Hold &#39;Em</h1>
        </div>
      </div>
    </>
  );
}
