import Link from 'next/link'; // Use Next.js Link
import './globals.css'; // Adjust the path if needed

export default function Home() {
  return (
    <div className="-page">
      <h1>Howdy <span className='emoji'>&#x1F920;</span></h1>
      <p>
        If you are looking for my qualifications and skillsets check out my <span className='link'><Link href="/about">About</Link></span> page.
      </p>
      <p>
        The <span className='link'><Link href="/rps">Rock, Paper, Scissors Simulator</Link></span> runs through many iterations of gameplay where the user decision is random and the AI computer makes guesses based on past decisions and their previous turn on a decision matrix known as a Markov Chain. It balances its decisions with a dynamic exponent to use the regret tracking data to minimize the counterfactual regret. Different computer move patterns can be selected with a dropdown before starting the simulation allowing for different results.
      </p>
      <p>
        The <span className='link'><Link href="/poker2d">2D Poker Game</Link></span> uses an AI logic with a decision matrix and counterfactual regret minimization that is based around the concepts I explored in the rock, paper, scissors game. The AI will make turns and over many iterations will learn to play better hands. The win likelihood percentage is calculated from an external "pokersolver" library with credit and thanks to goldfire.
      </p>
      <p>
        The <span className='link'><Link href="/jazzbot">Chord Player</Link></span> will play any four note piano chord by simultaneously playing four separate .mp3 files each containing the sound of a different piano notes. The GUI contains dropdown elements to choose the root note and the chord type, and then displays the selected notes. It also contains buttons to translate the chord to a higher inversion which involves playing one of the same notes in a higher octave, effectively making it higher pitched. The "Play Chord" button can be pushed many times and duplicates of the sound files are loaded to support the latency.
      </p>
      <p>
        The <span className='link'><Link href="/pokerfrogs">3D Poker Game</Link></span> is not finished, but showcases draggable panel components connected to live data, and the loading of 3D animations from animation groups stored in a typical exported file type from Blender. The scene is successfully created, and at stages of development all assets were rendered as intended (aside from the 2 of hearts card, which I couldn't make sense of).
      </p>
    </div>
  );
}
