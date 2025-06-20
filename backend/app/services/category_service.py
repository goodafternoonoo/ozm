from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID

from app.models.category import Category
from app.models.menu import Menu
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_category(self, category_data: CategoryCreate) -> Category:
        """카테고리 생성"""
        category = Category(**category_data.model_dump())
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def get_category_by_id(self, category_id: UUID) -> Optional[Category]:
        """ID로 카테고리 조회"""
        result = await self.db.execute(
            select(Category).where(Category.id == category_id)
        )
        return result.scalar_one_or_none()

    async def get_categories(
        self,
        skip: int = 0,
        limit: int = 100,
        country: Optional[str] = None,
        cuisine_type: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[Category]:
        """카테고리 목록 조회 (필터링 및 페이징 지원)"""
        query = select(Category)

        # 필터 조건 추가
        filters = []
        if country:
            filters.append(Category.country == country)
        if cuisine_type:
            filters.append(Category.cuisine_type == cuisine_type)
        if is_active is not None:
            filters.append(Category.is_active == is_active)

        if filters:
            query = query.where(and_(*filters))

        # 정렬 (display_order, name 순)
        query = query.order_by(Category.display_order, Category.name)

        # 페이징
        query = query.offset(skip).limit(limit)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_categories_with_menu_count(
        self, skip: int = 0, limit: int = 100
    ) -> List[dict]:
        """메뉴 개수와 함께 카테고리 목록 조회"""
        # 서브쿼리로 각 카테고리의 메뉴 개수 계산
        menu_count_subquery = (
            select(Menu.category_id, func.count(Menu.id).label("menu_count"))
            .group_by(Menu.category_id)
            .subquery()
        )

        # 메인 쿼리
        query = (
            select(
                Category,
                func.coalesce(menu_count_subquery.c.menu_count, 0).label("menu_count"),
            )
            .outerjoin(
                menu_count_subquery, Category.id == menu_count_subquery.c.category_id
            )
            .where(Category.is_active == True)
            .order_by(Category.display_order, Category.name)
            .offset(skip)
            .limit(limit)
        )

        result = await self.db.execute(query)
        return [
            {**category.__dict__, "menu_count": menu_count}
            for category, menu_count in result.all()
        ]

    async def update_category(
        self, category_id: UUID, category_data: CategoryUpdate
    ) -> Optional[Category]:
        """카테고리 수정"""
        category = await self.get_category_by_id(category_id)
        if not category:
            return None

        update_data = category_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)

        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def delete_category(self, category_id: UUID) -> bool:
        """카테고리 삭제 (실제 삭제 대신 비활성화)"""
        category = await self.get_category_by_id(category_id)
        if not category:
            return False

        category.is_active = False
        await self.db.commit()
        return True

    async def get_categories_by_country(self, country: str) -> List[Category]:
        """국가별 카테고리 조회"""
        result = await self.db.execute(
            select(Category)
            .where(and_(Category.country == country, Category.is_active == True))
            .order_by(Category.display_order, Category.name)
        )
        return result.scalars().all()

    async def get_categories_by_cuisine_type(self, cuisine_type: str) -> List[Category]:
        """요리 타입별 카테고리 조회"""
        result = await self.db.execute(
            select(Category)
            .where(
                and_(Category.cuisine_type == cuisine_type, Category.is_active == True)
            )
            .order_by(Category.display_order, Category.name)
        )
        return result.scalars().all()

    async def get_total_count(
        self, country: Optional[str] = None, cuisine_type: Optional[str] = None
    ) -> int:
        """카테고리 총 개수 조회"""
        query = select(func.count(Category.id))

        filters = [Category.is_active == True]
        if country:
            filters.append(Category.country == country)
        if cuisine_type:
            filters.append(Category.cuisine_type == cuisine_type)

        query = query.where(and_(*filters))
        result = await self.db.execute(query)
        return result.scalar()
