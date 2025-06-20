import uuid
from sqlalchemy import Column, String, Text, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import sqlalchemy.types as types


class GUID(types.TypeDecorator):
    """
    플랫폼에 따라 UUID를 String으로 변환 (PostgreSQL/SQLite 호환)
    """

    impl = String(36)

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(UUID())
        return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is not None:
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        return value


class Category(Base):
    """
    음식 카테고리 테이블
    - 각 메뉴와 1:N 관계
    - color_code: 프론트엔드 시각 구분용 색상 코드(예: #FF5733)
    """

    __tablename__ = "categories"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text)
    country = Column(
        String(50), nullable=False, index=True
    )  # 한국, 중국, 일본, 이탈리아 등
    cuisine_type = Column(
        String(50), nullable=False, index=True
    )  # 한식, 중식, 일식, 양식 등
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)  # 표시 순서
    icon_url = Column(String(255))  # 카테고리 아이콘 이미지
    color_code = Column(String(7))  # 색상 코드 (예: #FF5733)

    # 메뉴와의 관계
    menus = relationship("Menu", back_populates="category")

    def __repr__(self):
        return f"<Category(name='{self.name}', country='{self.country}', cuisine_type='{self.cuisine_type}')>"
