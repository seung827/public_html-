# 쿠팡 FC 인력 운영과 SLA 하락 위험 조건 분석 — 웹 eBook

`FC_분석보고서.pdf`(26쪽) 전체를 원본 그대로 보여 주는 정적 웹 eBook 사이트입니다.
분석 내용·수치·표·그래프는 PDF를 이미지로 변환해 그대로 사용했으며, 재분석하거나 수정하지 않았습니다.

## 폴더 구조
```
index.html            메인 페이지
css/style.css         네이비·골드 디자인, 반응형
js/app.js             페이지 넘김, 목차, 확대/축소, 전체 화면, 음악 (외부 라이브러리 없음)
assets/pages/p-01~26.jpg   보고서 26쪽 이미지
assets/FC_분석보고서.pdf   다운로드용 원본 PDF
assets/audio/bgm.mp3, page.mp3   배경음악(직접 합성), 페이지 넘김 효과음
netlify.toml          Netlify 설정
```

## 기능
- 책 펼침 3D 페이지 넘김 (PC: 2쪽 펼침 / 모바일: 1쪽)
- 표지·목차 (2쪽 목차 항목 클릭 및 좌측 목차 서랍 클릭으로 해당 페이지 이동, 썸네일 탭)
- 이전/다음 버튼, 방향키, 클릭, 스와이프, 슬라이더, 페이지 번호 표시
- 확대·축소(50~300%, Ctrl+휠, 더블클릭), 전체 화면
- PDF 다운로드, 배경음악 재생/정지·볼륨(음악은 기본 꺼짐)
- 단축키: ← → 이동, Home/End, + − 0 확대/축소, F 전체화면, M 음악, T 목차
- 주소 `#p=11` 처럼 특정 쪽 바로가기 지원

## Netlify 배포
1. ZIP 압축을 풉니다.
2. https://app.netlify.com/drop 에 폴더를 통째로 끌어다 놓습니다. (빌드 설정 불필요)
3. 또는 GitHub에 올린 뒤 Netlify에서 *Import from Git* → Build command 비워 두고 Publish directory는 `.`

## GitHub 업로드
```
git init
git add .
git commit -m "FC 분석보고서 웹 eBook"
git branch -M main
git remote add origin https://github.com/<계정>/<저장소>.git
git push -u origin main
```
GitHub Pages도 사용 가능합니다 (Settings → Pages → main / root).

## 참고
- 폰트는 Google Fonts(Noto Serif/Sans KR)를 사용하며, 오프라인이면 시스템 글꼴로 대체됩니다.
- 로컬에서 열 때는 `index.html`을 더블클릭해도 되고, `python3 -m http.server`로 실행해도 됩니다.
