
import { YoutubeTranscript } from '@danielxceron/youtube-transcript';

// 사용자가 지정한 '자막 없는 영상' ID
const VIDEO_ID = 'AQBf-Uo8T3M';

async function main() {
    console.log(`Checking transcript for ${VIDEO_ID}...`);
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(VIDEO_ID);
        console.log('✅ Transcript found!');
        console.log(`Length: ${transcript.length} items`);
    } catch (error: any) {
        console.log('❌ Failed to fetch transcript.');
        console.log('---------------------------------------------------');
        console.log('[Error Message]:', error.message);
        console.log('[Error Name]:', error.name);
        console.log('---------------------------------------------------');

        // 에러 메시지 분석
        if (error.message.includes('Transcript is disabled on this video')) {
            console.log('👉 판정: [자막 없음] (확실함)');
        } else if (error.message.includes('No transcripts available')) {
            console.log('👉 판정: [자막 없음] (가능성 높음)');
        } else {
            console.log('👉 판정: [기타 에러] (네트워크 등 재시도 필요)');
        }
    }
}

main();
