
import { createClient } from '@supabase/supabase-js';
import type { Track } from '../types';

const supabaseUrl = 'https://hxerlgynhtwbxqwkghog.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZXJsZ3luaHR3Ynhxd2tnaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjA1NjEsImV4cCI6MjA2NzQ5NjU2MX0.trdCEb8X6_IUwMEW0zO4L2CKfU6tuU3NNG3tYzijAnM';

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is missing.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PAGE_SIZE = 1000; // Supabase default max rows per request

export const fetchTracks = async (): Promise<Track[]> => {
    let allTracks: Track[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabase
            .from('music_nfts')
            .select('*')
            .order('id', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Error fetching tracks page:', page, error);
            throw new Error(error.message);
        }

        if (data && data.length > 0) {
            allTracks = allTracks.concat(data);
            page++;
            if (data.length < PAGE_SIZE) {
                hasMore = false;
            }
        } else {
            hasMore = false;
        }
    }
    
    // Ensure we always return an array to prevent crashes
    return (allTracks || []) as Track[];
};