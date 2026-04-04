# Project Overview
이 프로젝트는 React(Vite) 프론트엔드와 Node.js(Express) 백엔드를 결합한 풀스택 Todo & SaaS 랜딩 페이지 애플리케이션입니다.

# Directory Structure
- `/frontend`: React + Vite 프론트엔드 앱
- `/backend`: Express REST API 서버 (MongoDB 연동)

# Tech Stack & Versions
- **Frontend**: React 18, Vite 5, Tailwind CSS v3 (Node 18 호환성을 위해 v4 대신 v3 사용 중), Axios
- **Backend**: Node.js 18, Express, Mongoose (MongoDB Atlas)
- **Styling**: Tailwind CSS 기반의 다크 테마 (DM Note 스타일 참조. 주로 `bg-zinc-900`, `text-zinc-300` 계열 사용)

# Coding Guidelines
1. **Frontend**:
   - 함수형 컴포넌트와 React Hooks(`useState`, `useEffect`)를 사용한다.
   - 외부 API 호출은 `axios`를 사용하며 `async/await` 패턴을 적용한다.
   - 디자인은 Tailwind CSS 유틸리티 클래스만 사용하여 구현하며, 별도의 CSS 파일 작성은 지양한다.
   - 모바일 반응형(`sm:`, `md:`, `lg:`)을 고려하여 작성한다.
2. **Backend**:
   - RESTful API 컨벤션을 준수한다 (`GET`, `POST`, `PUT`, `DELETE`).
   - Mongoose 스키마를 사용하여 데이터를 모델링한다.
   - 로컬 개발 환경과 Vercel 배포 환경 양쪽에서 문제없이 작동하도록 구성한다 (`app.listen` 조건부 실행 등).