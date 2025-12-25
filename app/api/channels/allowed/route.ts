/**
 * 허용된 채널 목록 API
 */

import { NextResponse } from 'next/server';
import { getAllowedChannels } from '@/lib/channelConfig';

export async function GET() {
    return NextResponse.json({
        success: true,
        channels: getAllowedChannels(),
    });
}
