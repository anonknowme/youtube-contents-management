
import { config } from 'dotenv';
config({ path: '.env.local' });

async function debug() {
    // Dynamic import to ensure env vars are loaded first
    const { fetchTranscript } = await import('../lib/youtubeService');
    const { saveTranscript } = await import('../lib/databaseService');
    const { supabaseAdmin } = await import('../lib/supabase');

    const videoId = 'NIZd3sxSCh8'; // A video known to have captions (from previous context)

    console.log(`Debug Video ID: ${videoId}`);

    if (!supabaseAdmin) {
        console.error('Supabase admin not initialized');
        return;
    }

    // 1. Check caption integrity via fetchTranscript directly
    console.log('Fetching transcript...');
    const transcript = await fetchTranscript(videoId);
    console.log('Transcript result:', transcript ? `${transcript.length} chars` : 'null');

    if (transcript) {
        // 2. Try saving
        console.log('Attempting to save...');
        try {
            await saveTranscript(videoId, transcript);
            console.log('Save function execution complete.');

            // 3. Verify in DB
            const { data, error } = await supabaseAdmin
                .from('video_transcripts')
                .select('*')
                .eq('video_id', videoId)
                .single();

            if (error) {
                console.error('Verification query failed:', error);
            } else {
                console.log('DB Verification Success:', data);
            }

        } catch (e) {
            console.error('Save failed with error:', e);
        }
    }
}

debug();
