# Supabase Service Role Key 설정 가이드

## 1. Service Role Key 복사

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **API** 메뉴
4. **Project API keys** 섹션에서
5. **service_role** 키 옆의 복사 버튼 클릭 👁️

⚠️ **주의**: 이 키는 절대 외부에 노출하면 안 됩니다!

---

## 2. 환경 변수 추가

`.env.local` 파일에 추가:

```bash
# Supabase Service Role Key (서버 사이드 전용!)
# ⚠️ NEXT_PUBLIC_ 접두사 없음!
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## 3. 개발 서버 재시작

```bash
# 서버 중지 (Ctrl+C)
# 서버 재시작
npm run dev
```

---

## 4. 테스트

### Admin Sync API 테스트
```bash
# 단일 채널 sync
curl -X POST "http://localhost:3002/api/admin/sync?channelId=UCKajCwiIKhRieKpvKZmFtHA"

# 모든 허용 채널 sync
curl -X POST "http://localhost:3002/api/admin/sync"
```

### 사용자 API 테스트
```bash
# 읽기 전용 (DB에서만 조회)
curl "http://localhost:3002/api/channel/UCKajCwiIKhRieKpvKZmFtHA"
```

---

## 5. RLS (Row Level Security) 설정 (선택)

Supabase SQL Editor에서 실행:

```sql
-- channels 테이블: 읽기만 허용
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on channels" ON channels
  FOR SELECT USING (true);

-- videos 테이블: 읽기만 허용
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on videos" ON videos
  FOR SELECT USING (true);
```

✅ 이제 Anon Key로는 읽기만 가능, Service Role Key로만 쓰기 가능!

---

## 보안 체크리스트

- ✅ Service Role Key는 `.env.local`에만 (절대 Git에 커밋 X)
- ✅ `NEXT_PUBLIC_` 접두사 없음 (클라이언트 노출 방지)
- ✅ 서버 사이드에서만 사용 (`lib/`, `app/api/`)
- ✅ RLS 활성화로 Anon Key 제한

---

## 다음 단계

### 1. Vercel 배포 시
- Vercel Dashboard → Environment Variables
- `SUPABASE_SERVICE_ROLE_KEY` 추가
- 재배포

### 2. Cron Job 설정 (선택)
`vercel.json`:
```json
{
  "crons": [{
    "path": "/api/admin/sync",
    "schedule": "0 */6 * * *"
  }]
}
```

6시간마다 자동 sync!
