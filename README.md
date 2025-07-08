# Tezos Radio

A sleek, filterable music player for Tezos-based music NFTs. This application connects to a pre-configured Supabase database to discover and play music NFTs minted on the Tezos blockchain.

🎵 **[Live Demo](https://tezradio.vercel.app/)** - Try the radio player now!

## How the Radio Finds Music

The radio application discovers music through a Supabase database that indexes music NFTs from the Tezos blockchain. Here's how it works:

1. **Database Connection**: The app connects to a read-only Supabase PostgreSQL database
2. **Music Discovery**: It queries the `music_nfts` table to find available tracks
3. **IPFS Integration**: Audio files are stored on IPFS, and the app uses IPFS gateways to stream the music
4. **Real-time Updates**: The database is continuously updated with new music NFTs from the Tezos blockchain

## Database Connection

The application connects to an existing Supabase database with these credentials:

- **Database URL**: `https://hxerlgynhtwbxqwkghog.supabase.co`
- **Read-only Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZXJsZ3luaHR3Ynhxd2tnaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjA1NjEsImV4cCI6MjA2NzQ5NjU2MX0.trdCEb8X6_IUwMEW0zO4L2CKfU6tuU3NNG3tYzijAnM`

These credentials are already configured in `services/supabase.ts` and provide read-only access to the music NFT database.

## Database Schema

The application reads from a `music_nfts` table with the following schema:

```sql
CREATE TABLE music_nfts (
    id SERIAL PRIMARY KEY,
    contract_address VARCHAR(42) NOT NULL,
    token_id INTEGER NOT NULL,
    track_title VARCHAR(255),
    artist_address VARCHAR(42),
    artist_name VARCHAR(255),
    audio_ipfs_uri VARCHAR(255),
    thumbnail_ipfs_uri VARCHAR(255),
    mime_type VARCHAR(50),
    duration_seconds INTEGER,
    file_size_bytes BIGINT,
    description TEXT,
    minted_at TIMESTAMP WITH TIME ZONE,
    inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Field Descriptions

#### Required Fields
- `id`: Unique identifier (auto-generated)
- `contract_address`: The Tezos smart contract address (e.g., "KT1...")
- `token_id`: The NFT token ID within the contract
- `inserted_at`: Timestamp when the record was added

#### Essential Fields for Playback
- `audio_ipfs_uri`: IPFS URI for the audio file (format: "ipfs://Qm...")
- `track_title`: Display name for the track
- `artist_name`: Artist or creator name

#### Optional Metadata
- `artist_address`: Tezos address of the artist
- `thumbnail_ipfs_uri`: IPFS URI for cover art
- `mime_type`: Audio format (e.g., "audio/mpeg", "audio/wav")
- `duration_seconds`: Track length in seconds
- `file_size_bytes`: File size in bytes
- `description`: Additional track information
- `minted_at`: When the NFT was originally minted

## How Data is Fetched

The `fetchTracks` function in `services/supabase.ts` handles data retrieval:

1. **Pagination**: Automatically fetches all tracks using pagination (1000 records per page)
2. **Sorting**: Orders tracks by ID in descending order (newest first)
3. **Filtering**: Client-side filtering removes tracks without valid `audio_ipfs_uri`
4. **Deduplication**: Removes duplicate tracks based on title and artist combination
5. **Fallback Values**: Provides default values for missing titles and artist names

```typescript
const { data, error } = await supabase
    .from('music_nfts')
    .select('*')
    .order('id', { ascending: false })
    .range(from, to);
```

## Running the Application

**Prerequisites:** Node.js 16+

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the app:**
   ```bash
   npm run dev
   ```

3. **Access the radio:**
   - Open your browser to `http://localhost:5173`
   - The app will automatically fetch tracks from the database

## IPFS Gateway Configuration

The app uses IPFS gateways to stream audio files. The gateway is configured in `constants.ts`:

```typescript
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
```

The application converts IPFS URIs like `ipfs://QmExampleHash123` to HTTP URLs like `https://ipfs.io/ipfs/QmExampleHash123` for playback.

## How Music Discovery Works

1. **On App Start**: The application fetches all available tracks from the database
2. **Filtering**: Tracks must have valid `audio_ipfs_uri` values to be playable
3. **Search**: Users can search by track title or artist name
4. **Playback**: Audio files are streamed directly from IPFS via the configured gateway

## Troubleshooting

### No Music Appearing

1. **Check Network Connection**: Ensure you can reach the Supabase database
2. **Verify Database Access**: The read-only key should provide access to the `music_nfts` table
3. **Check Browser Console**: Look for any network errors or CORS issues

### Audio Won't Play

1. **IPFS Gateway Issues**: Try a different IPFS gateway if files won't load
2. **CORS Errors**: Some IPFS gateways may have CORS restrictions
3. **File Format**: Ensure the audio format is supported by your browser
4. **Network Speed**: Large audio files may take time to buffer

### Performance Issues

1. **Large Dataset**: The database contains many tracks, initial load may be slow
2. **IPFS Speed**: Audio streaming speed depends on IPFS gateway performance
3. **Browser Caching**: Subsequent loads should be faster due to caching

## Development

### Data Flow

1. **Database Query**: `fetchTracks()` retrieves all records from `music_nfts`
2. **Data Processing**: Filters, deduplicates, and normalizes track data
3. **IPFS Resolution**: Converts IPFS URIs to HTTP URLs for playback
4. **State Management**: React state manages current track, playback status, and search

### Key Components

- **`services/supabase.ts`**: Database connection and data fetching
- **`constants.ts`**: IPFS gateway configuration
- **`App.tsx`**: Main application logic and state management
- **`components/MusicPlayer.tsx`**: Audio playback controls
- **`components/TrackList.tsx`**: Track display and selection

### Database Query Details

The application performs a single query to fetch all tracks:

```sql
SELECT * FROM music_nfts 
ORDER BY id DESC 
LIMIT 1000 OFFSET 0;
```

This query is repeated with increasing offsets until all tracks are fetched. The read-only access ensures the application can only query data, not modify it.

## Production Deployment

For production deployments, consider:

- **CDN for IPFS**: Use a dedicated IPFS gateway or CDN for better performance
- **Caching**: Implement caching for database queries to reduce load times
- **Error Handling**: Add retry logic for failed IPFS requests
- **Analytics**: Track popular tracks and usage patterns
