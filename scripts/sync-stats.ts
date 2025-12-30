
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
    // 환경 변수 로드 후 모듈 가져오기 (Hoisting 방지)
    const { updateChannelStats } = await import('../lib/adminSync');
    const { getAllowedChannels } = await import('../lib/channelConfig');

    console.log('📊 Starting Video Statistics Sync...');
    console.log('This process updates view counts, likes, and comments for videos.');

    // Argument Parsing
    // Usage: npm run sync:stats -- --id=... --name=...
    const args = process.argv.slice(2);
    const idArg = args.find(arg => arg.startsWith('--id='))?.split('=')[1];
    const nameArg = args.find(arg => arg.startsWith('--name='))?.split('=')[1];

    let targetChannels: Array<{ id: string; name: string }> = [];

    if (idArg) {
        // --id 옵션이 제공되면 DB에서 직접 조회 (ALLOWED_CHANNELS 무시)
        console.log(`🎯 Filter by ID: ${idArg}`);
        const { supabaseAdmin } = await import('../lib/supabase');

        if (!supabaseAdmin) {
            console.error('❌ SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다!');
            return;
        }

        const { data: channel } = await supabaseAdmin
            .from('channels')
            .select('channel_id, title')
            .eq('channel_id', idArg)
            .single();

        if (channel) {
            targetChannels = [{ id: channel.channel_id, name: channel.title }];
        } else {
            console.log('⚠️ Channel not found in database.');
            return;
        }
    } else {
        // --id 옵션이 없으면 기존 로직 (ALLOWED_CHANNELS 사용)
        const allChannels = getAllowedChannels();
        targetChannels = allChannels;

        if (nameArg) {
            targetChannels = allChannels.filter(c => c.name.includes(nameArg));
            console.log(`🎯 Filter by Name (includes): ${nameArg}`);
        }
    }

    if (targetChannels.length === 0) {
        console.log('⚠️ No matching channels found.');
        const allChannels = getAllowedChannels();
        console.log('Available channels:');
        allChannels.forEach(c => console.log(` - ${c.name} (${c.id})`));
        return;
    }

    console.log(`Found ${targetChannels.length} target channels.`);

    for (const channel of targetChannels) {
        console.log(`\n---------------------------------`);
        console.log(`Checking channel: ${channel.name} (${channel.id})`);
        try {
            await updateChannelStats(channel.id);
        } catch (error) {
            console.error(`❌ Failed to update stats for channel: ${channel.name}`, error);
        }
    }

    console.log('\n=================================');
    console.log('✅ Stats Sync Completed!');
}

main().catch(console.error);
