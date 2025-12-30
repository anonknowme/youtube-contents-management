
import { google } from 'googleapis';
import { config } from 'dotenv';
config({ path: '.env.local' });

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});

async function main() {
    console.log('📡 Fetching LIVE data from YouTube for: e87TvrUtHGg');

    try {
        const response = await youtube.videos.list({
            part: ['snippet', 'statistics'],
            id: ['e87TvrUtHGg']
        });

        const video = response.data.items?.[0];
        if (video) {
            console.log('------------------------------------------------');
            console.log('✅ YouTube Live Data:');
            console.log(`Title: ${video.snippet?.title}`);
            console.log(`View Count: ${video.statistics?.viewCount}`);
            console.log(`Like Count: ${video.statistics?.likeCount}`);
            console.log(`Comment Count: ${video.statistics?.commentCount}`);
            console.log('------------------------------------------------');
        } else {
            console.log('❌ Video not found on YouTube');
        }
    } catch (error: any) {
        console.error('❌ API Error:', error.message);
    }
}

main();
