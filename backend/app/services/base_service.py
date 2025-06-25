import uuid
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar

from sqlalchemy import delete, select, update
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import (
    DatabaseException,
    DuplicateException,
    NotFoundException,
    ValidationException,
)
from app.core.logging import get_logger
from app.db.database import Base

ModelType = TypeVar("ModelType", bound=Base)

logger = get_logger(__name__)


class BaseService(Generic[ModelType]):
    """
    모든 서비스 클래스의 기본 클래스
    공통 CRUD 작업을 제공
    """

    def __init__(self, db: AsyncSession, model: Type[ModelType]):
        self.db = db
        self.model = model
        self.logger = get_logger(f"{__name__}.{model.__name__}")

    async def _handle_db_error(self, operation: str, error: SQLAlchemyError) -> None:
        """데이터베이스 오류 처리 공통 로직"""
        self.logger.error(
            f"데이터베이스 오류 - {self.model.__name__} {operation} 실패: {str(error)}"
        )

        if isinstance(error, IntegrityError):
            await self._handle_integrity_error(error)
        else:
            raise DatabaseException(
                f"{self.model.__name__} {operation} 중 데이터베이스 오류가 발생했습니다."
            )

    async def _handle_integrity_error(self, error: IntegrityError) -> None:
        """무결성 제약 조건 오류 처리"""
        error_msg = str(error).lower()
        if "duplicate" in error_msg or "unique" in error_msg:
            raise DuplicateException(self.model.__name__, "필드", "값")
        elif "foreign key" in error_msg:
            raise ValidationException("참조하는 데이터가 존재하지 않습니다.")
        else:
            raise DatabaseException("데이터 무결성 오류가 발생했습니다.")

    async def get_by_id(
        self, id: uuid.UUID, load_relationships: bool = False
    ) -> Optional[ModelType]:
        """
        ID로 엔티티 조회

        Args:
            id: 조회할 엔티티의 ID
            load_relationships: 관계 테이블도 함께 로드할지 여부

        Returns:
            조회된 엔티티 또는 None
        """
        try:
            self.logger.debug(f"ID로 {self.model.__name__} 조회: {id}")
            stmt = select(self.model).where(self.model.id == id)

            if load_relationships:
                # 모든 relationship 필드를 로드
                stmt = stmt.options(selectinload("*"))

            result = await self.db.execute(stmt)
            entity = result.scalar_one_or_none()

            if not entity:
                self.logger.warning(f"{self.model.__name__}를 찾을 수 없음: {id}")
                raise NotFoundException(self.model.__name__, id)

            self.logger.debug(f"{self.model.__name__} 조회 성공: {id}")
            return entity

        except NotFoundException:
            raise
        except SQLAlchemyError as e:
            await self._handle_db_error("조회", e)

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        load_relationships: bool = False,
        filters: Dict[str, Any] = None,
    ) -> List[ModelType]:
        """
        모든 엔티티 조회 (페이징 지원)

        Args:
            skip: 건너뛸 레코드 수
            limit: 가져올 최대 레코드 수
            load_relationships: 관계 테이블도 함께 로드할지 여부
            filters: 필터 조건

        Returns:
            엔티티 리스트
        """
        try:
            self.logger.debug(
                f"{self.model.__name__} 목록 조회: skip={skip}, limit={limit}"
            )

            query = select(self.model)

            # 필터 적용
            if filters:
                for field, value in filters.items():
                    if hasattr(self.model, field) and value is not None:
                        query = query.where(getattr(self.model, field) == value)

            query = query.offset(skip).limit(limit)
            result = await self.db.execute(query)
            entities = result.scalars().all()

            self.logger.debug(
                f"{self.model.__name__} 목록 조회 성공: {len(entities)}개"
            )
            return entities

        except SQLAlchemyError as e:
            await self._handle_db_error("목록 조회", e)

    async def create(self, obj_in: Dict[str, Any]) -> ModelType:
        """
        새 엔티티 생성

        Args:
            obj_in: 생성할 엔티티 데이터

        Returns:
            생성된 엔티티
        """
        try:
            self.logger.debug(f"{self.model.__name__} 생성 시작")

            # ID가 없으면 생성
            if "id" not in obj_in:
                obj_in["id"] = uuid.uuid4()

            entity = self.model(**obj_in)
            self.db.add(entity)
            await self.db.commit()
            await self.db.refresh(entity)

            self.logger.info(f"{self.model.__name__} 생성 성공: {entity.id}")
            return entity

        except SQLAlchemyError as e:
            await self.db.rollback()
            await self._handle_db_error("생성", e)

    async def update(
        self, id: uuid.UUID, obj_in: Dict[str, Any]
    ) -> Optional[ModelType]:
        """
        엔티티 업데이트

        Args:
            id: 업데이트할 엔티티의 ID
            obj_in: 업데이트할 데이터

        Returns:
            업데이트된 엔티티 또는 None
        """
        try:
            self.logger.debug(f"{self.model.__name__} 업데이트 시작: {id}")

            # 엔티티 존재 확인
            await self.get_by_id(id)

            # 업데이트할 필드만 추출
            update_data = {k: v for k, v in obj_in.items() if v is not None}

            if not update_data:
                self.logger.warning(f"업데이트할 데이터가 없음: {id}")
                raise ValidationException("업데이트할 데이터가 없습니다.")

            # 업데이트 실행
            await self.db.execute(
                update(self.model).where(self.model.id == id).values(**update_data)
            )
            await self.db.commit()

            # 업데이트된 엔티티 조회
            updated_entity = await self.get_by_id(id)
            self.logger.info(f"{self.model.__name__} 업데이트 성공: {id}")
            return updated_entity

        except SQLAlchemyError as e:
            await self.db.rollback()
            await self._handle_db_error("업데이트", e)

    async def delete(self, id: uuid.UUID) -> bool:
        """
        엔티티 삭제

        Args:
            id: 삭제할 엔티티의 ID

        Returns:
            삭제 성공 여부
        """
        try:
            self.logger.debug(f"{self.model.__name__} 삭제 시작: {id}")

            # 엔티티 존재 확인
            await self.get_by_id(id)

            # 삭제 실행
            await self.db.execute(delete(self.model).where(self.model.id == id))
            await self.db.commit()

            self.logger.info(f"{self.model.__name__} 삭제 성공: {id}")
            return True

        except SQLAlchemyError as e:
            await self.db.rollback()
            await self._handle_db_error("삭제", e)

    async def exists(self, id: uuid.UUID) -> bool:
        """
        엔티티 존재 여부 확인

        Args:
            id: 확인할 엔티티의 ID

        Returns:
            존재 여부
        """
        try:
            result = await self.db.execute(
                select(self.model).where(self.model.id == id)
            )
            return result.scalar_one_or_none() is not None

        except SQLAlchemyError as e:
            await self._handle_db_error("존재 여부 확인", e)

    async def count(self, filters: Dict[str, Any] = None) -> int:
        """
        엔티티 개수 조회

        Args:
            filters: 필터 조건

        Returns:
            엔티티 개수
        """
        try:
            from sqlalchemy import func

            query = select(func.count(self.model.id))

            # 필터 적용
            if filters:
                for field, value in filters.items():
                    if hasattr(self.model, field) and value is not None:
                        query = query.where(getattr(self.model, field) == value)

            result = await self.db.execute(query)
            return result.scalar()

        except SQLAlchemyError as e:
            await self._handle_db_error("개수 조회", e)

    def validate_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        데이터 검증

        Args:
            data: 검증할 데이터

        Returns:
            검증된 데이터
        """
        # 기본 검증 로직 (하위 클래스에서 오버라이드 가능)
        if not data:
            raise ValidationException("데이터가 비어있습니다.")

        return data
