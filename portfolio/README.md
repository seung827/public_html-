# AI 스마트워크 과제 아카이브 (AI Smart Work Archive)

> 한림대학교 데이터사이언스학부 3학년 **이승민**의 **'AI 스마트워크'** 교과목 과제 아카이브 웹사이트입니다.

---

## 1. 프로젝트 개요 및 목적
- **교과목명**: AI 스마트워크 (AI Smart Work)
- **개설 학과**: 한림대학교 데이터사이언스학부
- **학생 정보**: 이승민 (3학년, ISTP)
- **웹사이트 목적**: 'AI 스마트워크' 수업에서 수행한 과제만을 체계적으로 정리하고 게시하는 수업 전용 아카이브 포털입니다.
- **주요 기능**:
  1. **과제별 5단계 상세 정리**: 과제 소개 → 제작 과정 → 사용한 AI 도구 → 프롬프트 및 지시문 → 결과물
  2. **승인된 산출물 보호**: 보고서, PPT, 이미지, 영상 등 사전 승인된 자료만 미리보기 및 클릭 시 다운로드 제공 (자동 다운로드 원천 차단)
  3. **AI 도구별 필터 & 실시간 검색**: ChatGPT, Claude, Gamma 등 도구별 필터링
  4. **다국어(한국어/영어) & 다크모드 지원**: 사용자 편의 기능
  5. **반응형 웹 디자인**: PC, 태블릿, 모바일 완벽 최적화
  6. **안전성 원칙 준수**: 전화번호, 개인 이메일, 학번 등 민감 정보 절대 비공개

---

## 2. 과제 등록 구조 및 명세

각 과제는 아래와 같이 5가지 핵심 항목으로 구성됩니다:

```typescript
export interface Assignment {
  slug: string;                  // 고유 식별자 (URL 슬러그)
  assignmentNumber: number;      // 과제 번호 (1, 2, 3...)
  weekNumber?: number;           // 주차 (예: 4주차)
  title: LocalizedString;        // 과제 제목 (한글/영문)
  subtitle: LocalizedString;     // 과제 한 줄 요약
  submissionDate: string;        // 제출일
  aiTools: string[];             // 사용한 AI 도구 (ChatGPT, Claude, Gamma 등)
  overview: LocalizedString;     // 1. 과제 소개
  process: LocalizedString;      // 2. 제작 과정
  prompts: PromptItem[];         // 3. 사용한 핵심 프롬프트 (원문, 목적, 결과)
  deliverablesSummary: LocalizedString; // 4. 결과물 정리
  assets: ProjectAsset[];        // 5. 승인된 과제 산출물 (보고서, PPT, 이미지, 영상 등)
  isDemo?: boolean;              // 데모 데이터 여부
  published: boolean;            // 공개 승인 여부
}
```

---

## 3. 자료 보호 및 보안 정책

| 자료 구분 | 웹사이트 노출 | 다운로드 방식 | 파일 보안 원칙 |
|---|---|---|---|
| **미승인 자료** | 웹사이트 미노출 | 다운로드 불가 | `public/`, `dist/`, Git 저장소에 절대 포함하지 않음 |
| **미리보기만 승인** | 파생 미리보기 모달 표시 | 원본 다운로드 불가 | 원본 파일 배포 제외 |
| **다운로드까지 승인** | 파일 카드 및 다운로드 버튼 제공 | **방문자 클릭 시에만 진행** | 페이지 로드 시 자동 다운로드 원천 차단 |

---

## 4. 로컬 개발 및 빌드 방법

### 1) 의존성 설치
```bash
cd portfolio
npm install
```

### 2) 로컬 개발 서버 실행
```bash
npm run dev
```

### 3) 프로덕션 빌드 (검증 완료)
```bash
npm run build
```
빌드 산출물은 `portfolio/dist` 디렉터리에 생성됩니다.

---

## 5. GitHub Pages 및 Netlify 동시 배포 안내

- **GitHub Pages**:
  - `.github/workflows/deploy.yml`을 통해 main 브랜치 푸시 시 자동 빌드 및 배포
  - `HashRouter`(`/#/assignments/...`) 및 `base: './'` 설정으로 서브 디렉터리 경로에서도 새로고침 404 오류 없음
- **Netlify**:
  - `netlify.toml` 및 `public/_redirects` 설정을 통해 단일 설정으로 즉시 배포 가능
  - 빌드 명령: `npm run build`, 게시 디렉터리: `dist`

---

## 6. 라이선스 및 저작권
© 2026 이승민 (Seungmin Lee). All rights reserved.
한림대학교 데이터사이언스학부 AI 스마트워크 교과목 제출용 포트폴리오
