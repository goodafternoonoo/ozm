#!/bin/bash

# 전체 시스템 실행 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 메뉴 추천 시스템 실행 스크립트${NC}"
echo "=================================="

# 도움말 함수
show_help() {
    echo "사용법: $0 [명령어]"
    echo ""
    echo "명령어:"
    echo "  start     - 전체 시스템 시작 (Docker Compose)"
    echo "  stop      - 전체 시스템 정지"
    echo "  restart   - 전체 시스템 재시작"
    echo "  logs      - 로그 보기"
    echo "  clean     - 컨테이너 및 볼륨 정리"
    echo "  mobile    - 모바일 앱 실행 (Android)"
    echo "  backend   - 백엔드만 개발 모드로 실행"
    echo "  help      - 도움말 표시"
}

# Docker 설치 확인
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker가 설치되어 있지 않습니다.${NC}"
        echo "Docker를 설치한 후 다시 시도해주세요."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose가 설치되어 있지 않습니다.${NC}"
        echo "Docker Compose를 설치한 후 다시 시도해주세요."
        exit 1
    fi
}

# 전체 시스템 시작
start_system() {
    echo -e "${BLUE}📦 Docker 컨테이너 시작 중...${NC}"
    check_docker
    docker-compose up -d

    echo -e "${GREEN}✅ 시스템이 성공적으로 시작되었습니다!${NC}"
    echo ""
    echo "서비스 URL:"
    echo "- 백엔드 API: http://localhost:8000"
    echo "- API 문서: http://localhost:8000/docs"
    echo "- 헬스 체크: http://localhost:8000/health"
    echo ""
    echo "로그 확인: $0 logs"
}

# 시스템 정지
stop_system() {
    echo -e "${BLUE}⏹️  시스템 정지 중...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ 시스템이 정지되었습니다.${NC}"
}

# 시스템 재시작
restart_system() {
    echo -e "${BLUE}🔄 시스템 재시작 중...${NC}"
    docker-compose restart
    echo -e "${GREEN}✅ 시스템이 재시작되었습니다.${NC}"
}

# 로그 보기
show_logs() {
    echo -e "${BLUE}📋 로그 보기 (Ctrl+C로 종료)${NC}"
    docker-compose logs -f
}

# 정리
clean_system() {
    echo -e "${BLUE}🧹 시스템 정리 중...${NC}"
    docker-compose down -v --remove-orphans
    docker system prune -f
    echo -e "${GREEN}✅ 시스템이 정리되었습니다.${NC}"
}

# 모바일 앱 실행
run_mobile() {
    echo -e "${BLUE}📱 모바일 앱 실행 중...${NC}"
    cd mobile

    # Node.js 의존성 설치
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}📦 Node.js 의존성 설치 중...${NC}"
        npm install
    fi

    # Android 앱 실행
    echo -e "${BLUE}🤖 Android 앱 시작 중...${NC}"
    npx react-native run-android

    cd ..
}

# 백엔드 개발 모드 실행
run_backend_dev() {
    echo -e "${BLUE}🔧 백엔드 개발 모드 실행 중...${NC}"
    cd backend

    # 가상환경 확인
    if [ ! -d "venv" ]; then
        echo -e "${BLUE}🐍 Python 가상환경 생성 중...${NC}"
        python3 -m venv venv
    fi

    # 가상환경 활성화
    source venv/bin/activate

    # 의존성 설치
    echo -e "${BLUE}📦 Python 의존성 설치 중...${NC}"
    pip install -r requirements.txt

    # 서버 실행
    echo -e "${BLUE}🚀 백엔드 서버 시작 중...${NC}"
    python run.py

    cd ..
}

# 명령어 처리
case "$1" in
    start)
        start_system
        ;;
    stop)
        stop_system
        ;;
    restart)
        restart_system
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_system
        ;;
    mobile)
        run_mobile
        ;;
    backend)
        run_backend_dev
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        echo -e "${RED}❌ 명령어를 입력해주세요.${NC}"
        echo ""
        show_help
        exit 1
        ;;
    *)
        echo -e "${RED}❌ 알 수 없는 명령어: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
