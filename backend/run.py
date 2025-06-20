#!/usr/bin/env python3
"""
개발용 FastAPI 서버 실행 스크립트
"""
import asyncio
import uvicorn
from app.db.init_db import init_db

async def startup():
    """서버 시작 전 초기화"""
    print("데이터베이스 초기화 중...")
    await init_db()
    print("데이터베이스 초기화 완료!")

def main():
    """메인 실행 함수"""
    # 데이터베이스 초기화
    asyncio.run(startup())

    # 서버 실행
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["app"]
    )

if __name__ == "__main__":
    main()
