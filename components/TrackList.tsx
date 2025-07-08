import React from 'react';
import type { Track } from '../types';
import TrackCard from './TrackCard';

interface TrackListProps {
  tracks: Track[];
  onSelectTrack: (trackId: number) => void;
  currentTrackId?: number | null;
  ipfsToGatewayUrl: (uri: string | null) => string;
}

const TrackList: React.FC<TrackListProps> = ({ tracks, onSelectTrack, currentTrackId, ipfsToGatewayUrl }) => {
  if (tracks.length === 0) {
    return <p className="text-center text-tezos-text-secondary mt-10">No tracks found.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {tracks.map(track => (
        <TrackCard
          key={track.id}
          track={track}
          onSelect={() => onSelectTrack(track.id)}
          isPlaying={currentTrackId === track.id}
          ipfsToGatewayUrl={ipfsToGatewayUrl}
        />
      ))}
    </div>
  );
};

export default TrackList;