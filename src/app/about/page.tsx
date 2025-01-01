import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function About() {
  return (
    <div className="-page">
      
      <div className="skills-container">
        <div className="skills-text">
          <h1>
            <span>Skills</span>
          </h1>
          <h1>
            <span className="link">
            <Link href="/resume" className="resume-link">
              Resume
            </Link>
            </span>
          </h1>
        </div>

        <div className="skills">
          <div className="skill-category">
            <h3>JavaScript:</h3>
            <ul className="skill-list">
              <li>• Web Deployment</li>
              <li>• React, JSX</li>
              <li>• TypeScript</li>
              <li>• 3D with Babylon</li>
              <li>• Managing Packages</li>
            </ul>
          </div>
          <div className="skill-category">
            <h3>Python:</h3>
            <ul className="skill-list">
              <li>• File Management</li>
              <li>• Socket Networking</li>
              <li>• Machine Learning</li>
              <li>• Data Visualization</li>
              <li>• Raspberry Pi</li>
            </ul>
          </div>
          <div className="skill-category">
            <h3>Web Stack:</h3>
            <ul className="skill-list">
              <li>• Back-end, Front-end</li>
              <li>• HTML5, CSS</li>
              <li>• JavaScript</li>
              <li>• PHP, Apache, SQL</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="about-bio">
        <p>
          The <span className='link'><Link href="/rps">Rock, Paper, Scissors Simulator</Link></span> runs through many iterations of gameplay where the user decision is random and the AI computer makes guesses based on past decisions and their previous turn on a decision matrix known as a Markov Chain. It balances its decisions with a dynamic exponent to use the regret tracking data to minimize the counterfactual regret. Different computer move patterns can be selected with a dropdown before starting the simulation allowing for different results.
        </p>
        <p>
          The <span className='link'><Link href="/poker2d">2D Poker Game</Link></span> uses an AI logic with a decision matrix and counterfactual regret minimization that is based around the concepts I explored in the rock, paper, scissors game. The AI will make turns and over many iterations will learn to play better hands. The win likelihood percentage is calculated from an external &quot;pokersolver&quot; library with credit and thanks to goldfire.
        </p>
        <p>
          The <span className='link'><Link href="/chord-player">Chord Player</Link></span> will play any four note piano chord by simultaneously playing four separate .mp3 files each containing the sound of a different piano note. The GUI contains dropdown elements to choose the root note and the chord type, and then displays the selected notes. It also contains buttons to translate the chord to a higher inversion which involves playing one of the same notes in a higher octave, effectively making it higher pitched. The &quot;Play Chord&quot; button can be pushed many times and duplicates of the sound files are loaded to support the latency.
        </p>
        <p>
          The <span className='link'><Link href="/pokerfrogs">3D Poker Game</Link></span> showcases draggable panel components that are imported and update with live data from the cards dealt within the game logic that runs alongside the Babylon 3D scene in the page.tsx that contains the code for the webpage.
        </p>
      </div>
    </div>

  );
}
