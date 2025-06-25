import uuid
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    공통 CRUD 기능을 제공하는 베이스 레포지토리 (비동기)
    Args:
        db: AsyncSession
        model: SQLAlchemy 모델 클래스
    """

    def __init__(self, db: AsyncSession, model: Type[ModelType]):
        self.db = db
        self.model = model

    async def get_by_id(
        self, id: uuid.UUID, load_relationships: bool = False
    ) -> Optional[ModelType]:
        """ID로 엔티티 조회"""
        stmt = select(self.model).where(self.model.id == id)
        if load_relationships:
            stmt = stmt.options(selectinload("*"))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        load_relationships: bool = False,
        filters: Dict[str, Any] = None,
    ) -> List[ModelType]:
        """모든 엔티티 조회 (페이징/필터 지원)"""
        query = select(self.model)
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field) and value is not None:
                    query = query.where(getattr(self.model, field) == value)
        if load_relationships:
            query = query.options(selectinload("*"))
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def create(self, obj_in: Dict[str, Any]) -> ModelType:
        """새 엔티티 생성"""
        if "id" not in obj_in:
            obj_in["id"] = uuid.uuid4()
        entity = self.model(**obj_in)
        self.db.add(entity)
        await self.db.commit()
        await self.db.refresh(entity)
        return entity

    async def update(
        self, id: uuid.UUID, obj_in: Dict[str, Any]
    ) -> Optional[ModelType]:
        """엔티티 업데이트"""
        await self.get_by_id(id)  # 존재 확인
        update_data = {k: v for k, v in obj_in.items() if v is not None}
        await self.db.execute(
            update(self.model).where(self.model.id == id).values(**update_data)
        )
        await self.db.commit()
        return await self.get_by_id(id)

    async def delete(self, id: uuid.UUID) -> bool:
        """엔티티 삭제"""
        await self.get_by_id(id)  # 존재 확인
        await self.db.execute(delete(self.model).where(self.model.id == id))
        await self.db.commit()
        return True

    async def exists(self, id: uuid.UUID) -> bool:
        """엔티티 존재 여부 확인"""
        result = await self.db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none() is not None

    async def count(self, filters: Dict[str, Any] = None) -> int:
        """엔티티 개수 조회"""
        from sqlalchemy import func

        query = select(func.count(self.model.id))
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field) and value is not None:
                    query = query.where(getattr(self.model, field) == value)
        result = await self.db.execute(query)
        return result.scalar()
