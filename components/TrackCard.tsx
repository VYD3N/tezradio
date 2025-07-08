import React from 'react';
import type { Track } from '../types';
import { MusicNoteIcon, PlayIcon, VolumeUpIcon } from './Icons';

interface TrackCardProps {
  track: Track;
  onSelect: () => void;
  isPlaying: boolean;
  ipfsToGatewayUrl: (uri: string | null) => string;
}

const formatTime = (seconds: number | null) => {
    if (seconds === null || isNaN(seconds)) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const TrackCard: React.FC<TrackCardProps> = ({ track, onSelect, isPlaying, ipfsToGatewayUrl }) => {
    const thumbnailUrl = ipfsToGatewayUrl(track.thumbnail_ipfs_uri);

    return (
        <div 
            onClick={onSelect} 
            className={`flex items-center gap-4 p-2 rounded-md cursor-pointer transition-colors duration-200 ${
                isPlaying ? 'bg-tezos-blue/20' : 'hover:bg-tezos-gray-medium'
            }`}
            aria-label={`Play track: ${track.track_title} by ${track.artist_name}`}
        >
            <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-tezos-gray-light group">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={track.track_title || 'Track artwork'} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <MusicNoteIcon className="w-6 h-6 text-tezos-gray-dark" />
                    </div>
                )}
                
                {!isPlaying && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <PlayIcon className="w-6 h-6 text-white" />
                    </div>
                )}
            </div>
            
            <div className="flex-grow overflow-hidden">
                 <h3 className={`font-semibold truncate ${isPlaying ? 'text-tezos-blue-light' : 'text-tezos-text-primary'}`}>{track.track_title}</h3>
                 <p className="text-sm text-tezos-text-secondary truncate">{track.artist_name}</p>
            </div>
            
            <div className="flex items-center gap-4 ml-auto text-sm text-tezos-text-secondary flex-shrink-0">
                {isPlaying && <VolumeUpIcon className="w-5 h-5 text-tezos-blue-light" aria-label="Currently playing" />}
                <span className="w-10 text-right">{formatTime(track.duration_seconds)}</span>
            </div>
        </div>
    );
};

export default TrackCard;