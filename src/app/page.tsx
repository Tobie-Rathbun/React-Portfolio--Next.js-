'use client';

import { useAnimate } from "framer-motion";
import Link from "next/link";
import './globals.css';

export default function Home() {
  const [scope1, animate1] = useAnimate();
  const [scope2, animate2] = useAnimate();

  function handleHover(animate: typeof animate1, scope: React.RefObject<HTMLDivElement>) {
    animate([
      [scope.current, { rotate: -90 }],
      [scope.current, { scale: 1.15 }],
      [scope.current, { rotate: 0 }],
      [scope.current, { scale: 1.5 }],
    ]);
  }

  function handleLeave(animate: typeof animate1, scope: React.RefObject<HTMLDivElement>) {
    animate([[scope.current, { scale: 1 }]]);
  }

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
                <h2>
                  <span className="emoji" id="rock">&#129704;</span>
                  <span className="emoji">&#128220;</span>
                  <span className="emoji">&#9986;&#65039;</span>
                </h2>
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
                  <span className="emoji"id="heart">&#9829;&#65039;</span>
                  <span className="emoji">&#9827;&#65039;</span>
                </h2>
              </div>
            </Link>
          </div>
        </div>

        <div className="card-title">
            <h1>Rock, Paper, Scissors</h1>
            <h1 className="card-poker">Texas Hold&#39; Em</h1>
        </div>



      </div>
    </>
  );
}
