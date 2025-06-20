import asyncio
from app.db.init_db import init_db


async def main():
    print("데이터베이스 초기화를 시작합니다...")
    await init_db()
    print("데이터베이스 초기화가 완료되었습니다.")


if __name__ == "__main__":
    asyncio.run(main())
