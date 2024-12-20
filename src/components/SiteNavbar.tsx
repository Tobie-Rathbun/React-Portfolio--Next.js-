import Link from 'next/link';

const SiteNavbar = () => {
  return (
    <nav className="site-navbar">
      <Link href="/" className="navbar-brand">Tobie Rathbun</Link>
      <div>
        <Link href="/" className="nav-link">Home</Link>
        <Link href="/about" className="nav-link">About</Link>
        <a href="https://github.com/Tobie-Rathbun" className="nav-link">GitHub</a>
        <Link href="/pokerfrogs" className="nav-link">Poker Frogs</Link>
        <Link href="/rps" className="nav-link">RPS</Link>
        <Link href="/chord-player" className="nav-link">Chord Player</Link>
        <Link href="/login" className="nav-link">Login</Link>
      </div>
    </nav>
  );
};

export default SiteNavbar;
