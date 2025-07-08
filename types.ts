
export interface Track {
  id: number;
  contract_address: string;
  token_id: number;
  track_title: string | null;
  artist_address: string | null;
  artist_name: string | null;
  audio_ipfs_uri: string | null;
  thumbnail_ipfs_uri: string | null;
  mime_type: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  description: string | null;
  minted_at: string | null;
  inserted_at: string;
}
