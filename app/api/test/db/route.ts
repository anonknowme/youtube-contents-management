/**
 * Supabase 연결 테스트 API
 * 
 * URL: /api/test/db
 * 
 * Supabase 데이터베이스 연결을 테스트하고
 * channels 테이블의 데이터를 확인합니다.
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        console.log('🔍 Supabase 연결 테스트 중...');

        // channels 테이블에서 데이터 조회 (없어도 OK)
        const { data: channels, error: channelsError } = await supabase
            .from('channels')
            .select('*')
            .limit(5);

        if (channelsError) {
            console.error('❌ Channels 조회 에러:', channelsError);
            // 테이블이 없을 수도 있으므로 계속 진행
        }

        // videos 테이블에서 데이터 조회 (없어도 OK)
        const { data: videos, error: videosError } = await supabase
            .from('videos')
            .select('*')
            .limit(5);

        if (videosError) {
            console.error('❌ Videos 조회 에러:', videosError);
        }

        // 결과 반환
        return NextResponse.json({
            success: true,
            message: 'Supabase 연결 성공! ✅',
            data: {
                channels: {
                    count: channels?.length || 0,
                    data: channels || [],
                    error: channelsError?.message || null,
                },
                videos: {
                    count: videos?.length || 0,
                    data: videos || [],
                    error: videosError?.message || null,
                },
            },
        });

    } catch (error) {
        console.error('❌ Supabase 연결 실패:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : '알 수 없는 에러',
            },
            { status: 500 }
        );
    }
}
