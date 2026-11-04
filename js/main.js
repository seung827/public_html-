/**
 * 이승민 AI 스마트워크 포트폴리오 - 메인 스크립트
 * 최소한의 스크립트로 부드러운 스크롤 오프셋과 활성 메뉴를 보조합니다.
 */

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // 헤더 높이만큼 스크롤 오프셋 보정
  const headerHeight = header ? header.offsetHeight : 64;

  // 네비게이션 링크 클릭 시 스무스 스크롤 이동
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          e.preventDefault();
          const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight + 1;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // 스크롤 시 현재 섹션 하이라이트
  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.pageYOffset + headerHeight + 60;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
});

