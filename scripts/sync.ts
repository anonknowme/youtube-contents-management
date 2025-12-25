/**
 * GitHub Actions용 독립 Sync 스크립트
 * Vercel 없이 직접 YouTube API + Supabase 업데이트
 */

// 로컬 실행을 위한 환경 변수 로드
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
    // 환경 변수 로드 후 모듈 가져오기 (Hoisting 방지)
    const { syncAllAllowedChannels } = await import('../lib/adminSync');

    console.log('🚀 채널 동기화 시작...');
    console.log(`⏰ 시간: ${new Date().toISOString()}`);

    try {
        const results = await syncAllAllowedChannels();

        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        console.log('\n========================================');
        console.log('✅ 동기화 완료!');
        console.log(`성공: ${successCount}/${results.length}`);
        if (failCount > 0) {
            console.log(`실패: ${failCount}`);
            results.filter(r => !r.success).forEach(r => {
                console.log(`  ❌ ${r.name}: ${r.error}`);
            });
        }
        console.log('========================================\n');

        // 실패가 있으면 exit code 1
        if (failCount > 0) {
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ 치명적 에러:', error);
        process.exit(1);
    }
}

main();
