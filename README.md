# 이승민 AI 스마트워크 개인 포트폴리오 웹사이트

> 한림대학교 데이터사이언스학부 3학년 **이승민**의 **'AI 스마트워크'** 교과목 제출용 개인 웹사이트입니다.

---

## 1. 프로젝트 개요
- **목적:** AI 스마트워크 교과목 제출 및 공개 포트폴리오 아카이브
- **작성자:** 이승민 / 데이터사이언스학부 / 3학년 (MBTI: ISTP, 취미: 노래 듣기)
- **수강 과목:** AI 스마트워크 (AI Smart Work)
- **기술 스택:** **순수 HTML5, CSS3, 바닐라 JavaScript**
  - React, Tailwind, Vite, npm 빌드 도구, 데이터베이스 불필요
  - 별도 빌드 과정 없이 정적 파일 그대로 어디서나 동작
- **디자인 컨셉:** 흰색 배경(`$FFFFFF`), 진회색 텍스트(`#222222`), 절제된 네이비 포인트(`#1F3A5F`), PC·태블릿·모바일 반응형

---

## 2. 파일 및 폴더 구조
```text
lee-seungmin-portfolio/
├── index.html             # 4개 섹션(홈, 자기소개, AI 스마트워크, 프로젝트) 포함 시작 페이지
├── css/
│   └── style.css          # 미니멀 네이비/화이트 디자인 및 반응형 스타일
├── js/
│   └── main.js            # 부드러운 스크롤 이동 및 활성 메뉴 제어 최소 스크립트
├── assets/
│   ├── images/            # 과제 이미지 및 썸네일 보관 폴더
│   └── files/             # 공개 가능한 보고서, PPT, PDF 등 과제 산출물
└── README.md              # 프로젝트 설명 및 GitHub/Netlify 배포 매뉴얼
```

---

## 3. 화면 구성 (단일 index.html)
1. **홈 (`#home`)**: 인사말과 포트폴리오 둘러보기 버튼
2. **자기소개 (`#about`)**: 이름, 학과, 학년, MBTI, 취미, 자기소개 문구 (개인정보 보호 준수)
3. **AI 스마트워크 (`#ai-smartwork`)**: 과제별 카드 (제목, 설명, 사용 AI 도구, 제작 과정 및 프롬프트 요약, 다운로드 링크/준비 중 표시)
4. **프로젝트 (`#projects`)**: 기타 학업 및 탐구 프로젝트 카드
5. **푸터**: 저작권 및 교과목 표기

---

## 4. 로컬에서 확인하는 방법
정적 HTML/CSS 웹사이트이므로 복잡한 개발 서버 설치 없이 바로 확인할 수 있습니다.

1. `lee-seungmin-portfolio` 폴더 안의 **`index.html`** 파일을 더블 클릭하여 크롬(Chrome)이나 엣지(Edge) 브라우저에서 바로 엽니다.
2. 또는 VS Code를 사용하시는 경우 **Live Server** 확장 프로그램을 통해 `Go Live`를 클릭하여 확인합니다.

---

## 5. 과제 파일 다운로드 활성화 방법
실제 제출용 과제 파일(PDF, PPTX, 보고서 등)이 준비되면:
1. 파일을 `assets/files/` 폴더 안에 복사합니다. (예: `assignment1-report.pdf`)
2. `index.html` 파일에서 해당 과제 카드의 `<span class="btn-disabled">자료 준비 중</span>` 부분을 아래와 같이 `<a>` 태그로 변경합니다:
   ```html
   <a href="./assets/files/assignment1-report.pdf" class="btn btn-primary" download>
     보고서 다운로드
   </a>
   ```

---

## 6. GitHub 업로드 방법
1. [GitHub](https://github.com/)에 로그인 후 새 저장소(Repository)를 생성합니다. (예: `lee-seungmin-portfolio`, Public 선택)
2. 터미널(PowerShell 또는 Git Bash)을 열고 `lee-seungmin-portfolio` 폴더로 이동하여 아래 명령을 실행합니다:
   ```bash
   cd "C:\Users\seung\OneDrive\바탕 화면\이승민\lee-seungmin-portfolio"
   git init
   git add .
   git commit -m "Build AI Smart Work portfolio"
   git branch -M main
   git remote add origin https://github.com/본인계정/lee-seungmin-portfolio.git
   git push -u origin main
   ```
   *(또는 GitHub 웹페이지의 'Upload files' 기능을 통해 폴더 안의 파일들을 직접 드래그 앤 드롭으로 업로드해도 됩니다.)*

---

## 7. Netlify 자동 배포 방법
수업 자료(「Github 과 Netlify를 이용한 Web Publish」) 지침에 따른 Netlify 배포 순서입니다:

1. [Netlify](https://www.netlify.com/)에 로그인합니다.
2. 대시보드에서 **Add new site** → **Import an existing project**를 클릭합니다.
3. **GitHub**를 선택하고, 앞서 만든 `lee-seungmin-portfolio` 저장소를 지정합니다.
4. 배포 설정:
   - **Branch to deploy**: `main`
   - **Build command**: **(비워 둠)** ※ 순수 HTML 정적 사이트이므로 빌드 명령이 필요 없습니다.
   - **Publish directory**: **`.`** (또는 비워 두거나 저장소 루트 기본값 사용)
5. **Deploy site** 버튼을 클릭합니다.
6. 배포가 완료되면 Netlify에서 발급한 `https://[사이트이름].netlify.app` 주소로 즉시 접속할 수 있습니다.
7. 이후 GitHub 저장소에 새 과제 파일을 커밋/푸시하면 Netlify가 자동으로 감지하여 최신 상태로 재배포합니다.

---

## 8. 개인정보 및 보안 준수 사항
- 전화번호, 개인 이메일, 실제 학번, 비밀번호, API 키 등 민감 정보는 웹사이트 및 공개 저장소에 일체 기재하지 않습니다.
- 실제 검증된 과제 자료만 게시하며, 미제출 상태의 과제는 `자료 준비 중`으로 안전하게 표시합니다.

