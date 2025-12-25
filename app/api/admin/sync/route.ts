/**
 * 관리자용 수동 sync API
 * 
 * POST /api/admin/sync?channelId=xxx - 단일 채널
 * POST /api/admin/sync - 모든 허용된 채널
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncSingleChannel, syncAllAllowedChannels } from '@/lib/adminSync';

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        const searchParams = request.nextUrl.searchParams;
        const channelId = searchParams.get('channelId');

        console.log('\n========================================');
        console.log('🔧 관리자 Sync 요청');
        console.log('========================================');

        let results;

        if (channelId) {
            // 단일 채널 sync
            console.log(`대상: 단일 채널 (${channelId})`);
            const result = await syncSingleChannel(channelId);
            results = [{ channelId, ...result }];
        } else {
            // 모든 허용된 채널 sync
            console.log('대상: 모든 허용된 채널');
            results = await syncAllAllowedChannels();
        }

        const totalTime = Date.now() - startTime;
        const successCount = results.filter((r: any) => r.success).length;

        console.log('========================================');
        console.log(`✅ Sync 완료: ${successCount}/${results.length}`);
        console.log(`⏱️  총 소요 시간: ${(totalTime / 1000).toFixed(1)}초`);
        console.log('========================================\n');

        return NextResponse.json({
            success: true,
            results,
            summary: {
                total: results.length,
                success: successCount,
                failed: results.length - successCount,
                duration: totalTime
            }
        });

    } catch (error) {
        console.error('❌ Sync 에러:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
