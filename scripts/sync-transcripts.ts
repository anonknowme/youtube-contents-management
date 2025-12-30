
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
    // 환경 변수 로드 후 모듈 가져오기 (Hoisting 방지)
    const { syncMissingTranscripts } = await import('../lib/adminSync');
    const { getAllowedChannels } = await import('../lib/channelConfig');

    console.log('📝 Starting Transcript Sync...');
    console.log('This process checks for missing transcripts and fetches them.');
    console.log('NOTE: Transcripts are fetched via scraping (No API Key quota used), but IP rate limits apply.');

    const channels = getAllowedChannels();
    console.log(`Found ${channels.length} allowed channels.`);

    // 사실상 무제한 (백만 개)
    const LIMIT_PER_CHANNEL = 1000000;

    for (const channel of channels) {
        console.log(`\n---------------------------------`);
        console.log(`Checking channel: ${channel.name} (${channel.id})`);
        try {
            await syncMissingTranscripts(channel.id, LIMIT_PER_CHANNEL);
        } catch (error) {
            console.error(`❌ Failed to sync transcripts for channel: ${channel.name}`, error);
        }
    }

    console.log('\n=================================');
    console.log('✅ Transcript Sync Completed!');
}

main().catch(console.error);
