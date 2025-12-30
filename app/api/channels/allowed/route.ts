/**
 * 허용된 채널 목록 API
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { ALLOWED_CHANNELS } from '@/lib/channelConfig';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
    try {
        console.log('Fetching channels from Supabase...');

        const allowedIds = ALLOWED_CHANNELS.map(c => c.id);

        const { data: channels, error } = await supabase
            .from('channels')
            .select('channel_id, title, thumbnail_url, subscriber_count')
            .order('title');

        console.log('Supabase response:', { channels, error });

        if (error) {
            console.error('Error fetching channels:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch channels',
                errorDetails: error.message,
                channels: []
            });
        }

        // 데이터 포맷 변환 및 is_allowed 플래그 추가
        const formattedChannels = (channels || []).map(ch => ({
            id: ch.channel_id,
            name: ch.title,
            thumbnail_url: ch.thumbnail_url,
            subscriber_count: ch.subscriber_count,
            is_allowed: allowedIds.includes(ch.channel_id)
        }));

        return NextResponse.json({
            success: true,
            channels: formattedChannels
        });
    } catch (error) {
        console.error('Error in /api/channels/allowed:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            channels: []
        });
    }
}
