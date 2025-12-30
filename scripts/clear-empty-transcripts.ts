
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
    console.log('🧹 Cleaning up empty transcripts...');

    // Dynamic import to ensure env vars are loaded
    const { supabaseAdmin } = await import('../lib/supabase');

    if (!supabaseAdmin) {
        console.error('❌ Supabase Admin key is missing or not configured!');
        process.exit(1);
    }

    // 1. Check count
    const { count, error: countError } = await supabaseAdmin
        .from('video_transcripts')
        .select('*', { count: 'exact', head: true })
        .eq('content', '');

    if (countError) {
        console.error('❌ Failed to count:', countError);
        return;
    }

    console.log(`🔍 Found ${count} empty transcripts.`);

    if (count === 0) {
        console.log('✨ Clean! Nothing to delete.');
        return;
    }

    // 2. Delete
    console.log('🗑️ Deleting...');
    const { error: deleteError } = await supabaseAdmin
        .from('video_transcripts')
        .delete()
        .eq('content', '');

    if (deleteError) {
        console.error('❌ Failed to delete:', deleteError);
        return;
    }

    console.log(`✅ Successfully deleted ${count} empty records.`);
    console.log('🔄 Now you can run "npm run sync:transcripts" again to re-verify strictly.');
}

main().catch(console.error);
