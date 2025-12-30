/**
 * 읽기 전용 사용자 API
 * DB에서만 조회, sync 없음
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isChannelAllowed } from '@/lib/channelConfig';
import { calculateViralScores } from '@/lib/viralScore';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ channelId: string }> }
) {
    const startTime = Date.now();

    try {
        const params = await context.params;
        const channelId = params.channelId;

        console.log('\n========================================');
        console.log('📖 채널 조회 (읽기 전용):', channelId);

        // 화이트리스트 체크 제거 - DB에 있으면 조회 가능하도록 변경
        // if (!isChannelAllowed(channelId)) { ... }

        // DB에서 채널 조회
        const { data: channel, error: channelError } = await supabase
            .from('channels')
            .select('*')
            .eq('channel_id', channelId)
            .single();

        if (channelError || !channel) {
            console.log('❌ 채널 없음 (아직 동기화 안 됨)');
            return NextResponse.json(
                {
                    success: false,
                    error: '이 채널은 아직 지원하지 않습니다.'
                },
                { status: 404 }
            );
        }

        // DB에서 영상 조회 (페이지네이션으로 모든 영상)
        let allVideos: any[] = [];
        let page = 0;
        const pageSize = 1000;

        while (true) {
            const { data: pageVideos } = await supabase
                .from('videos')
                .select('*')
                .eq('channel_id', channel.id)
                .order('published_at', { ascending: false })
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (!pageVideos || pageVideos.length === 0) break;
            allVideos = allVideos.concat(pageVideos);

            // 1000개 미만이면 마지막 페이지
            if (pageVideos.length < pageSize) break;
            page++;
        }

        const videos = allVideos;

        // 바이럴 점수 계산
        let videosWithScores = videos || [];
        if (videos && videos.length > 0) {
            videosWithScores = calculateViralScores(
                videos,
                'vs_neighbor_avg',
                parseInt(channel.subscriber_count || '0')
            );
        }

        const totalTime = Date.now() - startTime;
        console.log(`✅ 조회 완료: ${channel.title} - ${videosWithScores.length}개 영상`);
        console.log(`⏱️  소요 시간: ${totalTime}ms`);
        console.log('========================================\n');

        return NextResponse.json({
            success: true,
            data: { channel, videos: videosWithScores },
            meta: {
                lastSynced: channel.last_synced_at,
                responseTime: totalTime
            }
        });

    } catch (error) {
        console.error('❌ 조회 에러:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
