from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.repositories.category_repository import CategoryRepository


class CategoryService:
    """
    카테고리 관련 비즈니스 로직 서비스 (Repository 패턴 적용)
    """

    def __init__(self, db: AsyncSession):
        self.category_repository = CategoryRepository(db)

    async def get_by_id(self, category_id: UUID) -> Optional[Category]:
        return await self.category_repository.get_by_id(category_id)

    async def create_category(self, category_data: CategoryCreate) -> Category:
        """
        카테고리 생성 (name+country+cuisine_type 중복 방지)
        """
        # 중복 체크
        exists = await self.category_repository.get_categories(
            country=category_data.country,
            cuisine_type=category_data.cuisine_type,
            is_active=True,
        )
        for cat in exists:
            if cat.name == category_data.name:
                raise ValueError("이미 동일한 카테고리가 존재합니다.")
        category = Category(**category_data.model_dump())
        self.category_repository.db.add(category)
        await self.category_repository.db.commit()
        await self.category_repository.db.refresh(category)
        return category

    async def get_categories(
        self,
        skip: int = 0,
        limit: int = 100,
        country: Optional[str] = None,
        cuisine_type: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[Category]:
        """카테고리 목록 조회 (필터링/페이징 지원)"""
        return await self.category_repository.get_categories(
            skip, limit, country, cuisine_type, is_active
        )

    async def get_categories_with_menu_count(
        self, skip: int = 0, limit: int = 100
    ) -> List[dict]:
        """메뉴 개수와 함께 카테고리 목록 조회"""
        return await self.category_repository.get_categories_with_menu_count(
            skip, limit
        )

    async def update_category(
        self, category_id: UUID, category_data: CategoryUpdate
    ) -> Optional[Category]:
        """카테고리 수정"""
        category = await self.category_repository.get_by_id(category_id)
        if not category:
            return None
        update_data = category_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)
        await self.category_repository.db.commit()
        await self.category_repository.db.refresh(category)
        return category

    async def delete_category(self, category_id: UUID) -> bool:
        """카테고리 삭제 (실제 삭제 대신 비활성화)"""
        category = await self.category_repository.get_by_id(category_id)
        if not category:
            return False
        category.is_active = False
        await self.category_repository.db.commit()
        return True

    async def get_categories_by_country(self, country: str) -> List[Category]:
        """국가별 카테고리 조회"""
        return await self.category_repository.get_categories_by_country(country)

    async def get_categories_by_cuisine_type(self, cuisine_type: str) -> List[Category]:
        """요리 타입별 카테고리 조회"""
        return await self.category_repository.get_categories_by_cuisine_type(
            cuisine_type
        )

    async def get_total_count(
        self, country: Optional[str] = None, cuisine_type: Optional[str] = None
    ) -> int:
        """카테고리 총 개수 조회"""
        return await self.category_repository.get_total_count(country, cuisine_type)
