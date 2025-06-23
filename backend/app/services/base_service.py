from typing import TypeVar, Generic, Type, Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from app.db.database import Base
import uuid
from datetime import datetime

ModelType = TypeVar("ModelType", bound=Base)


class BaseService(Generic[ModelType]):
    """
    모든 서비스 클래스의 기본 클래스
    공통 CRUD 작업을 제공
    """

    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get_by_id(
        self, db: AsyncSession, id: uuid.UUID, load_relationships: bool = False
    ) -> Optional[ModelType]:
        """
        ID로 엔티티 조회

        Args:
            db: 데이터베이스 세션
            id: 조회할 엔티티의 ID
            load_relationships: 관계 테이블도 함께 로드할지 여부

        Returns:
            조회된 엔티티 또는 None
        """
        stmt = select(self.model).where(self.model.id == id)

        if load_relationships:
            # 모든 relationship 필드를 로드
            stmt = stmt.options(selectinload("*"))

        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        load_relationships: bool = False,
    ) -> List[ModelType]:
        """
        모든 엔티티 조회 (페이징 지원)

        Args:
            db: 데이터베이스 세션
            skip: 건너뛸 레코드 수
            limit: 가져올 최대 레코드 수
            load_relationships: 관계 테이블도 함께 로드할지 여부

        Returns:
            엔티티 리스트
        """
        stmt = select(self.model).offset(skip).limit(limit)

        if load_relationships:
            stmt = stmt.options(selectinload("*"))

        result = await db.execute(stmt)
        return result.scalars().all()

    async def create(self, db: AsyncSession, obj_in: dict) -> ModelType:
        """
        새 엔티티 생성

        Args:
            db: 데이터베이스 세션
            obj_in: 생성할 엔티티 데이터

        Returns:
            생성된 엔티티
        """
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self, db: AsyncSession, id: uuid.UUID, obj_in: dict
    ) -> Optional[ModelType]:
        """
        엔티티 업데이트

        Args:
            db: 데이터베이스 세션
            id: 업데이트할 엔티티의 ID
            obj_in: 업데이트할 데이터

        Returns:
            업데이트된 엔티티 또는 None
        """
        stmt = (
            update(self.model)
            .where(self.model.id == id)
            .values(**obj_in, updated_at=datetime.utcnow())
            .returning(self.model)
        )
        result = await db.execute(stmt)
        await db.commit()
        return result.scalar_one_or_none()

    async def delete(self, db: AsyncSession, id: uuid.UUID) -> bool:
        """
        엔티티 삭제

        Args:
            db: 데이터베이스 세션
            id: 삭제할 엔티티의 ID

        Returns:
            삭제 성공 여부
        """
        stmt = delete(self.model).where(self.model.id == id)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0

    async def exists(self, db: AsyncSession, id: uuid.UUID) -> bool:
        """
        엔티티 존재 여부 확인

        Args:
            db: 데이터베이스 세션
            id: 확인할 엔티티의 ID

        Returns:
            존재 여부
        """
        stmt = select(self.model.id).where(self.model.id == id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def count(self, db: AsyncSession) -> int:
        """
        전체 엔티티 수 조회

        Args:
            db: 데이터베이스 세션

        Returns:
            전체 엔티티 수
        """
        stmt = select(self.model.id)
        result = await db.execute(stmt)
        return len(result.scalars().all())
