import ChordPlayer from '../../components/ChordPlayer';

export const dynamic = 'force-dynamic';

export default function Jazzbot() {
  return (
    <div className="-page">
      
      <h1>Chord Player</h1>
      <h4>Use the dropdowns and buttons and click Play Chord</h4>
      
      <h4>Create different chords from individual piano note files</h4>
      <ChordPlayer />
    </div>
  );
}
