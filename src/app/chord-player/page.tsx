import ChordPlayer from '../../components/ChordPlayer';

export const dynamic = 'force-dynamic';

export default function Jazzbot() {
  return (
    <div className="-page">
      <h1>Play Any Piano Chords!</h1>
      <ChordPlayer />
    </div>
  );
}
