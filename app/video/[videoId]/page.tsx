'use client';

import { useParams, useRouter } from 'next/navigation';
import { VideoDetailView } from '@/components/video/VideoDetailView';

export default function VideoDetailPage() {
    const params = useParams();
    const router = useRouter();
    const videoId = params.videoId as string;

    return (
        <VideoDetailView
            videoId={videoId}
            onBack={() => router.back()}
        />
    );
}
