
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    // Argument Parsing
    const args = process.argv.slice(2);
    let videoId = args.find(arg => arg.startsWith('--id='))?.split('=')[1];

    if (!videoId) {
        // 기본값 (테스트용) 또는 인자 강제
        if (args.length > 0 && !args[0].startsWith('--')) {
            // npx tsx scripts/check_video.ts VIDEO_ID 형식 지원
            videoId = args[0];
        } else {
            console.log('❌ Usage: npx tsx scripts/check_video.ts --id=VIDEO_ID');
            console.log('   or:  npx tsx scripts/check_video.ts VIDEO_ID');
            return;
        }
    }

    console.log(`🔍 Checking stats for video: ${videoId}`);

    const { data, error } = await supabase
        .from('videos')
        .select('title, view_count, like_count, comment_count, updated_at, transcript_status')
        .eq('video_id', videoId);

    if (error) {
        console.error('❌ Error:', error);
    } else {
        if (data && data.length > 0) {
            console.table(data);
        } else {
            console.log('⚠️ Video not found in DB');
        }
    }
}

main();
