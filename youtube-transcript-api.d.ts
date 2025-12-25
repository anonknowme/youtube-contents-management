declare module 'youtube-transcript-api' {
    export default class TranscriptAPI {
        static getTranscript(videoId: string): Promise<Array<{
            start: string;
            text: string;
            duration: string;
        }>>;
    }
}
