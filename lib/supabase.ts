/**
 * Supabase 클라이언트 초기화
 * 
 * 이 파일은 Supabase 데이터베이스와 연결하는 클라이언트를 생성합니다.
 * Python의 psycopg2나 SQLAlchemy와 비슷한 역할입니다!
 */

import { createClient } from '@supabase/supabase-js';

// 환경 변수 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 환경 변수 검증
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다!');
}

/**
 * Supabase 클라이언트 (사용자용 - 읽기 전용)
 * 
 * Anon Key 사용, RLS (Row Level Security) 적용
 * 
 * 사용 위치:
 * - /api/channel/[channelId] (읽기만)
 * - 프론트엔드 (미래)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase 관리자 클라이언트 (서버용 - 전체 권한)
 * 
 * Service Role Key 사용, RLS 무시
 * 
 * 사용 위치:
 * - lib/databaseService.ts (쓰기 작업)
 * - lib/adminSync.ts (관리자 sync)
 * - /api/admin/sync (관리자 API)
 * - /api/cron/sync (Cron Job)
 * 
 * ⚠️ 주의: 서버 사이드에서만 사용!
 */
export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
    })
    : null;

// TypeScript 타입 정의 (나중에 사용)
export type Database = {
    public: {
        Tables: {
            channels: {
                Row: {
                    id: string;
                    channel_id: string;
                    title: string;
                    description: string | null;
                    custom_url: string | null;
                    subscriber_count: number | null;
                    video_count: number | null;
                    view_count: number | null;
                    thumbnail_url: string | null;
                    last_synced_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    channel_id: string;
                    title: string;
                    description?: string | null;
                    custom_url?: string | null;
                    subscriber_count?: number | null;
                    video_count?: number | null;
                    view_count?: number | null;
                    thumbnail_url?: string | null;
                    last_synced_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    channel_id?: string;
                    title?: string;
                    description?: string | null;
                    custom_url?: string | null;
                    subscriber_count?: number | null;
                    video_count?: number | null;
                    view_count?: number | null;
                    thumbnail_url?: string | null;
                    last_synced_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            videos: {
                Row: {
                    id: string;
                    video_id: string;
                    channel_id: string;
                    title: string;
                    description: string | null;
                    thumbnail_url: string | null;
                    url: string;
                    view_count: number;
                    like_count: number;
                    comment_count: number;
                    duration_seconds: number | null;
                    published_at: string | null;
                    definition: string | null;
                    has_captions: boolean | null;
                    viral_score: number | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    video_id: string;
                    channel_id: string;
                    title: string;
                    description?: string | null;
                    thumbnail_url?: string | null;
                    url: string;
                    view_count?: number;
                    like_count?: number;
                    comment_count?: number;
                    duration_seconds?: number | null;
                    published_at?: string | null;
                    definition?: string | null;
                    has_captions?: boolean | null;
                    viral_score?: number | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    video_id?: string;
                    channel_id?: string;
                    title?: string;
                    description?: string | null;
                    thumbnail_url?: string | null;
                    url?: string;
                    view_count?: number;
                    like_count?: number;
                    comment_count?: number;
                    duration_seconds?: number | null;
                    published_at?: string | null;
                    definition?: string | null;
                    has_captions?: boolean | null;
                    viral_score?: number | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            video_transcripts: {
                Row: {
                    video_id: string;
                    content: string;
                    created_at: string;
                };
                Insert: {
                    video_id: string;
                    content: string;
                    created_at?: string;
                };
                Update: {
                    video_id?: string;
                    content?: string;
                    created_at?: string;
                };
            };
        };
    };
};
