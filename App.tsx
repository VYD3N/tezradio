import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchTracks } from './services/supabase';
import type { Track } from './types';
import { IPFS_GATEWAY } from './constants';
import SearchBar from './components/SearchBar';
import TrackList from './components/TrackList';
import MusicPlayer from './components/MusicPlayer';
import { LogoIcon } from './components/Icons';

const App: React.FC = () => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const audioRef = useRef<HTMLAudioElement>(null);

    const ipfsToGatewayUrl = useCallback((ipfsUri: string | null): string => {
        if (!ipfsUri || !ipfsUri.startsWith('ipfs://')) return '';
        return `${IPFS_GATEWAY}${ipfsUri.substring(7)}`;
    }, []);

    useEffect(() => {
        const loadTracks = async () => {
            setIsLoading(true);
            try {
                const fetchedTracks = await fetchTracks();
                
                const normalizedTracks = fetchedTracks
                    .filter(t => t.audio_ipfs_uri)
                    .map(t => ({
                        ...t,
                        track_title: t.track_title || 'Untitled Track',
                        artist_name: t.artist_name || 'Unknown Artist',
                    }));

                const uniqueTracks: Track[] = [];
                const seen = new Set<string>();

                for (const track of normalizedTracks) {
                    const uniqueKey = `${track.track_title?.toLowerCase()}|${track.artist_name?.toLowerCase()}`;
                    if (!seen.has(uniqueKey)) {
                        seen.add(uniqueKey);
                        uniqueTracks.push(track);
                    }
                }

                setTracks(uniqueTracks);
                setFilteredTracks(uniqueTracks);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };
        loadTracks();
    }, []);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = tracks.filter(track =>
            track.track_title?.toLowerCase().includes(lowercasedFilter) ||
            track.artist_name?.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredTracks(filtered);
    }, [searchTerm, tracks]);

    const currentTrack = currentTrackIndex !== null ? filteredTracks[currentTrackIndex] : null;

    // A single, robust effect for controlling audio playback
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (!currentTrack) {
            audio.pause();
            audio.src = '';
            return;
        }

        // A track is selected. Update src if it's different.
        const newSrc = ipfsToGatewayUrl(currentTrack.audio_ipfs_uri);
        if (audio.src !== newSrc) {
            audio.src = newSrc;
        }

        // Now handle play/pause state
        if (isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // AbortError is expected when quickly changing tracks, we can safely ignore it.
                    if (error.name !== 'AbortError') {
                        console.error("Playback failed:", error);
                        setIsPlaying(false);
                    }
                });
            }
        } else {
            audio.pause();
        }
    }, [currentTrack, isPlaying, ipfsToGatewayUrl]);

    const handleSelectTrack = useCallback((trackId: number) => {
        const trackIndexInFiltered = filteredTracks.findIndex(t => t.id === trackId);
        if (trackIndexInFiltered !== -1) {
            setCurrentTrackIndex(trackIndexInFiltered);
            setIsPlaying(true);
        }
    }, [filteredTracks]);

    const handlePlayPause = useCallback(() => {
        if (currentTrack) {
            setIsPlaying(prev => !prev);
        } else if (filteredTracks.length > 0) {
            setCurrentTrackIndex(0);
            setIsPlaying(true);
        }
    }, [currentTrack, filteredTracks.length]);

    const handleNext = useCallback(() => {
        if (currentTrackIndex !== null) {
            const nextIndex = (currentTrackIndex + 1) % filteredTracks.length;
            setCurrentTrackIndex(nextIndex);
            setIsPlaying(true);
        }
    }, [currentTrackIndex, filteredTracks.length]);

    const handlePrevious = useCallback(() => {
        if (currentTrackIndex !== null) {
            const prevIndex = (currentTrackIndex - 1 + filteredTracks.length) % filteredTracks.length;
            setCurrentTrackIndex(prevIndex);
            setIsPlaying(true);
        }
    }, [currentTrackIndex, filteredTracks.length]);

    return (
        <div className="min-h-screen bg-tezos-gray-dark text-tezos-text-primary flex flex-col">
            <header className="p-4 sm:p-6 sticky top-0 bg-tezos-gray-dark/80 backdrop-blur-lg z-20 border-b border-tezos-gray-light/20">
                <div className="container mx-auto flex justify-between items-center gap-4">
                    <div className="flex items-center">
                        <LogoIcon className="h-8 w-8 text-tezos-blue" />
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Radio</h1>
                    </div>
                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </div>
            </header>

            <main className="flex-grow container mx-auto p-4 sm:p-6 pb-32">
                {isLoading && <div className="text-center text-tezos-text-secondary mt-10">Loading music...</div>}
                {error && <div className="text-center text-red-500 mt-10">Error: {error}</div>}
                {!isLoading && !error && (
                    <TrackList 
                        tracks={filteredTracks} 
                        onSelectTrack={handleSelectTrack} 
                        currentTrackId={currentTrack?.id} 
                        ipfsToGatewayUrl={ipfsToGatewayUrl}
                    />
                )}
            </main>
            
            {currentTrack && (
                <MusicPlayer
                    key={currentTrack.id} // Re-mount player on track change to reset internal state
                    track={currentTrack}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    ipfsToGatewayUrl={ipfsToGatewayUrl}
                    audioRef={audioRef}
                />
            )}
             <audio ref={audioRef} onEnded={handleNext} />
        </div>
    );
};

export default App;