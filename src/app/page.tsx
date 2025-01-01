'use client';

import { useAnimate } from "framer-motion";
import Link from "next/link";
import './globals.css';

export default function Home() {
  const [scope, animate] = useAnimate();

  function handleHover() {
    animate([
      [scope.current, { rotate: -90 }],
      [scope.current, { scale: 1.15 }],
      [scope.current, { rotate: 0 }],
      [scope.current, { scale: 1.5 }]
    ]);
  }

  function handleLeave() {
    animate([
      [scope.current, { scale: 1 }]
    ]);
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
          <div
            className="animated-card"
            ref={scope}
            onMouseEnter={handleHover}
            onMouseLeave={handleLeave}
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
        </div>
      </div>
    </>
  );
}
