'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

// Dynamically generate pianoSounds from static files
const generatePianoSounds = () => {
    const notes = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'];
    const octaves = [0, 1, 2, 3, 4, 5, 6, 7]; // Start from A0
    const sounds: Record<string, string> = {};

    notes.forEach((note) => {
        octaves.forEach((octave) => {
            const filePath = `/audio/Piano.ff.${note}${octave}.mp3`;
            if ((note !== 'A' && octave === 0)) {
                // Skip notes that don't exist in the 0th octave
                return;
            }
            sounds[`${note}${octave}`] = filePath;
        });
    });

    return sounds;
};

// Dynamically generated pianoSounds object
const pianoSounds: Record<string, string> = generatePianoSounds();

const chordIntervals: Record<string, number[]> = {
    'Major 7': [0, 4, 7, 11],
    'Minor 7': [0, 3, 7, 10],
    'Dominant 7': [0, 4, 7, 10],
};

const baseNoteOrder = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const ChordPlayer: React.FC = () => {
    const [currentRootNote, setCurrentRootNote] = useState<string>('C');
    const [currentChordType, setCurrentChordType] = useState<string>('Major 7');
    const [selectedChordNotes, setSelectedChordNotes] = useState<string[]>([]);
    const [isSamplerLoaded, setIsSamplerLoaded] = useState<boolean>(false);
    const [inversion, setInversion] = useState<number>(0);

    const samplerRef = useRef<Tone.Sampler | null>(null);

    useEffect(() => {
        // Initialize Tone.Sampler with dynamically generated pianoSounds
        const newSampler = new Tone.Sampler({
            urls: pianoSounds,
            release: 1,
            onload: () => {
                setIsSamplerLoaded(true);
                samplerRef.current = newSampler as Tone.Sampler;
            },
        }).toDestination();
    }, []);

    const selectChordNotes = useCallback(() => {
        const intervals = chordIntervals[currentChordType];
        const startIndex = baseNoteOrder.indexOf(currentRootNote);

        // Start from octave 3 (adjust as needed)
        const startingOctave = 3;
        const chordNotes = intervals.map((interval: number) => {
            const noteIndex = (startIndex + interval) % 12;
            const note = baseNoteOrder[noteIndex];
            const octave = startingOctave + Math.floor((startIndex + interval) / 12);
            return `${note}${octave}`;
        });

        for (let i = 0; i < inversion; i++) {
            let note = chordNotes.shift();
            if (!note) continue; // Skip undefined notes
            note = note.replace(/[0-9]/, (match) => (parseInt(match) + 1).toString());
            chordNotes.push(note);
        }

        setSelectedChordNotes(chordNotes);
    }, [currentRootNote, currentChordType, inversion]);

    useEffect(() => {
        if (isSamplerLoaded) {
            selectChordNotes();
        }
    }, [isSamplerLoaded, selectChordNotes]);

    const invertChordUp = () => setInversion((prev) => prev + 1);
    const invertChordDown = () => setInversion((prev) => Math.max(prev - 1, 0));
    const playChord = async () => {
        // Ensure the AudioContext is started after a user gesture
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }

        selectedChordNotes.forEach((note: string) => {
            samplerRef.current?.triggerAttackRelease(note, '1n');
        });
    };

    return (
        <div className="chord-player">
            {isSamplerLoaded ? (
                <>
                    <div>
                        <select
                            className="chord-select"
                            value={currentRootNote}
                            onChange={(e) => setCurrentRootNote(e.target.value)}
                        >
                            {baseNoteOrder.map((note) => (
                                <option key={note} value={note}>
                                    {note}
                                </option>
                            ))}
                        </select>
                        <select
                            className="chord-select"
                            value={currentChordType}
                            onChange={(e) => setCurrentChordType(e.target.value)}
                        >
                            {Object.keys(chordIntervals).map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="chord-status">
                        Selected Notes: {selectedChordNotes.join(', ')}
                    </div>
                    <div>
                        <button className="chord-button" onClick={invertChordDown}>
                            Invert Down
                        </button>
                        <button className="chord-button" onClick={invertChordUp}>
                            Invert Up
                        </button>
                    </div>
                    <button className="chord-button" onClick={playChord}>
                        Play Chord
                    </button>
                </>
            ) : (
                <div className="chord-status">Loading sounds...</div>
            )}
        </div>
    );
};

export default ChordPlayer;
