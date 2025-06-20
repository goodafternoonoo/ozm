import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.database import Base
import sqlalchemy.types as types


class GUID(types.TypeDecorator):
    """
    플랫폼에 따라 UUID를 String으로 변환 (PostgreSQL/SQLite 호환)
    """

    impl = String(36)

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            from sqlalchemy.dialects.postgresql import UUID

            return dialect.type_descriptor(UUID())
        return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is not None:
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        return value


class Favorite(Base):
    """
    즐겨찾기(찜) 테이블
    - user_id: 회원(로그인) 사용자용, 외래키(User.id)
    - session_id: 비회원 세션 식별자(로그인 없는 경우)
    - menu_id: 찜한 메뉴 UUID
    - created_at: 찜한 시각
    """

    __tablename__ = "favorites"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=True, index=True)
    session_id = Column(String(100), nullable=True, index=True)
    menu_id = Column(GUID(), ForeignKey("menus.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Favorite(user_id='{self.user_id}', session_id='{self.session_id}', menu_id='{self.menu_id}')>"
