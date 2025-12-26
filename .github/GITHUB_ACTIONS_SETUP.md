# GitHub Actions Cron Job 설정 (단순화)

## 개념

**Vercel 배포와 완전히 독립적!**

```
GitHub Actions → YouTube API → Supabase
```

Vercel은 사용자 UI만 제공, 데이터 업데이트는 GitHub Actions가 담당.

---

## 1. GitHub Secrets 설정

GitHub Repository → Settings → Secrets and variables → Actions

다음 4개 secrets 추가:

```
YOUTUBE_API_KEY=your-youtube-api-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ **중요**: Vercel 환경 변수와 동일한 값 사용!

---

## 2. 파일 구조

```
scripts/sync.ts          # 독립 스크립트
.github/workflows/
  sync-channels.yml      # GitHub Actions 설정
```

---

## 3. 동작 방식

### 자동 실행
- **스케줄**: 매 6시간마다
- **실행 내용**:
  1. 코드 체크아웃
  2. Node.js 설정
  3. `npm ci`로 의존성 설치
  4. `scripts/sync.ts` 실행
     - YouTube API에서 데이터 가져오기
     - Supabase에 직접 저장

### 수동 실행
1. GitHub → Actions → "Sync YouTube Channels"
2. "Run workflow" 클릭

---

## 4. 장점

✅ **Vercel 독립적** - Vercel 다운되어도 sync 가능
✅ **무료** - GitHub Actions 무료 티어 사용
✅ **로그 확인** - GitHub에서 모든 로그 확인
✅ **간단함** - API 호출 없이 직접 실행

---

## 5. 배포 순서

1. ✅ 코드 작성 완료 (`scripts/sync.ts`, `.github/workflows/sync-channels.yml`)
2. GitHub에 푸시
3. GitHub Secrets 4개 추가
4. GitHub Actions 탭에서 "Run workflow" 수동 테스트
5. 성공 확인 후 자동 스케줄 활성화

완료! 🎉

---

## 6. 문제 해결

### "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다"
→ GitHub Secrets 확인

### "Module not found"
→ `package.json`에 `tsx` 추가 필요:
```bash
npm install -D tsx
```

### 시간대 혼란
- UTC 0시 = 한국 9시
- UTC 6시 = 한국 15시
- UTC 12시 = 한국 21시
- UTC 18시 = 한국 3시

---

## 요약

**이전 (복잡):**
GitHub Actions → Vercel API 호출 → YouTube → Supabase

**현재 (간단):**
GitHub Actions → 직접 스크립트 → YouTube → Supabase

Vercel은 UI만, 데이터 업데이트는 GitHub Actions!
