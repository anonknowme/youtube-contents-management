# YouTube Contents Management System

YouTube 채널의 영상 데이터를 수집하고, 자막을 분석하여 AI 기반 인사이트를 제공하는 대시보드 프로젝트입니다.

## 🚀 주요 기능

- **3단계 동기화**: `Light` (신규/정보), `Stats` (통계 갱신), `Transcripts` (자막 보완)
- **AI 분석**: Google Gemini를 활용한 영상 요약 및 인사이트 도출
- **자막 관리**: 자막 유무 상태(`available`, `disabled`, `pending`)를 체계적으로 관리

## 🛠️ 설정 (Setup)

1. 필요한 환경 변수를 `.env.local` 파일에 설정해야 합니다.
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   YOUTUBE_API_KEY=...
   GEMINI_API_KEY=...
   ```

2. 패키지 설치
   ```bash
   npm install
   ```

## 🔄 동기화 스크립트 (Synchronization)

효율적인 데이터 관리를 위해 동기화 작업이 3가지로 분리되어 있습니다.

### 1. 가벼운 동기화 (기본)
새로운 영상이 올라왔는지 확인하고, 채널 정보를 갱신합니다. 기존 영상의 통계나 자막은 건드리지 않습니다. (가장 빠름)
```bash
npm run sync         # 또는 npm run sync:light
```

### 2. 통계 전체 업데이트
DB에 저장된 **모든 영상**의 조회수, 좋아요, 댓글 수를 YouTube API로 최신화합니다.
```bash
npm run sync:stats

# 옵션: 특정 채널만 업데이트
npm run sync:stats -- --id=CHANNEL_ID
npm run sync:stats -- --name=채널명검색
```

### 3. 자막 보완 (Transcripts)
자막이 없는(`pending`) 영상들을 찾아 자막을 가져옵니다.
*   **Disabled**: YouTube에서 자막을 제공하지 않는 경우 -> `disabled` 상태로 저장 (재시도 안 함)
*   **Available**: 자막 저장 성공 -> `available` 상태로 저장
```bash
npm run sync:transcripts
```

## 🛠️ 유틸리티 스크립트

### 비디오 상태 확인
특정 비디오의 DB 저장 상태(통계, 자막 상태 등)를 확인합니다.
```bash
npx tsx scripts/check_video.ts --id=VIDEO_ID
# 또는
npx tsx scripts/check_video.ts VIDEO_ID
```

### 자막 데이터 청소
잘못 저장된 빈 자막 데이터가 있다면 정리합니다.
```bash
npx tsx scripts/clear-empty-transcripts.ts
```

## 📂 프로젝트 구조
*   `app/`: Next.js App Router 기반 웹 애플리케이션
*   `lib/`: 핵심 비즈니스 로직 (`adminSync.ts`, `youtubeService.ts` 등)
*   `scripts/`: 독립 실행 가능한 동기화 및 관리 스크립트
