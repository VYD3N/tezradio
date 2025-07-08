
import React, { useState, useEffect, useCallback } from 'react';
import type { Track } from '../types';
import { PlayIcon, PauseIcon, NextIcon, PreviousIcon, VolumeUpIcon, MusicNoteIcon } from './Icons';

interface MusicPlayerProps {
    track: Track;
    isPlaying: boolean;
    onPlayPause: () => void;
    onNext: () => void;
    onPrevious: () => void;
    ipfsToGatewayUrl: (uri: string | null) => string;
    audioRef: React.RefObject<HTMLAudioElement>;
}

const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const MusicPlayer: React.FC<MusicPlayerProps> = ({
    track,
    isPlaying,
    onPlayPause,
    onNext,
    onPrevious,
    ipfsToGatewayUrl,
    audioRef
}) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const thumbnailUrl = ipfsToGatewayUrl(track.thumbnail_ipfs_uri);

    const handleTimeUpdate = useCallback(() => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    }, [audioRef]);

    const handleLoadedMetadata = useCallback(() => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    }, [audioRef]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.addEventListener('timeupdate', handleTimeUpdate);
            audio.addEventListener('loadedmetadata', handleLoadedMetadata);
            setVolume(audio.volume);

            return () => {
                audio.removeEventListener('timeupdate', handleTimeUpdate);
                audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            };
        }
    }, [audioRef, handleTimeUpdate, handleLoadedMetadata]);

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            const newTime = Number(e.target.value);
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            const newVolume = Number(e.target.value);
            audioRef.current.volume = newVolume;
            setVolume(newVolume);
        }
    };
    
    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-tezos-gray-medium/80 backdrop-blur-xl border-t border-tezos-gray-light/20 z-30 flex items-center px-4 sm:px-6">
            <div className="w-full grid grid-cols-3 items-center">
                {/* Track Info */}
                <div className="flex items-center gap-3 w-full overflow-hidden">
                    <div className="w-14 h-14 rounded-md bg-tezos-gray-light flex-shrink-0">
                        {thumbnailUrl ? (
                            <img src={thumbnailUrl} alt={track.track_title || ''} className="w-full h-full object-cover rounded-md"/>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <MusicNoteIcon className="w-6 h-6 text-tezos-gray-dark" />
                            </div>
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-semibold text-tezos-text-primary truncate">{track.track_title}</p>
                        <p className="text-sm text-tezos-text-secondary truncate">{track.artist_name}</p>
                    </div>
                </div>

                {/* Player Controls & Progress */}
                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-4">
                        <button onClick={onPrevious} className="text-tezos-text-secondary hover:text-white transition-colors"><PreviousIcon className="w-5 h-5" /></button>
                        <button onClick={onPlayPause} className="w-10 h-10 flex items-center justify-center rounded-full bg-tezos-blue hover:bg-tezos-blue-light transition-colors">
                            {isPlaying ? <PauseIcon className="w-5 h-5 text-white" /> : <PlayIcon className="w-5 h-5 text-white pl-0.5" />}
                        </button>
                        <button onClick={onNext} className="text-tezos-text-secondary hover:text-white transition-colors"><NextIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="w-full max-w-sm flex items-center gap-2 mt-1">
                        <span className="text-xs text-tezos-text-secondary">{formatTime(currentTime)}</span>
                        <input
                            type="range"
                            min="0"
                            max={duration}
                            value={currentTime}
                            onChange={handleProgressChange}
                            className="w-full h-1 bg-tezos-gray-light rounded-full appearance-none cursor-pointer accent-tezos-blue"
                        />
                        <span className="text-xs text-tezos-text-secondary">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center justify-end gap-2">
                    <VolumeUpIcon className="w-5 h-5 text-tezos-text-secondary"/>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-1 bg-tezos-gray-light rounded-full appearance-none cursor-pointer accent-tezos-blue"
                    />
                </div>
            </div>
        </div>
    );
};

export default MusicPlayer;
