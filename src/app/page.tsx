import Link from 'next/link'; // Use Next.js Link
import './globals.css'; // Adjust the path if needed

export default function Home() {
  return (
    <div className="-page">
      <h1>Howdy</h1>
      <p>
        <Link href="/about">About page</Link> contains my qualifications and skillsets
      </p>
      <p>
        <Link href="/jazzbot">Chord Player</Link> showcases file loading and JavaScript logic as well as GUI
      </p>
      <p>
        <Link href="/pokerfrogs">Poker Frogs</Link> showcases file loading, polished and interactive GUI, as well as 3D rendering and manual tool design
      </p>
    </div>
  );
}
