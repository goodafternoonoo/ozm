import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Favorite(Base):
    """사용자 즐겨찾기(찜) 모델 (user_id 기반)"""

    __tablename__ = "favorites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    menu_id = Column(
        UUID(as_uuid=True), ForeignKey("menus.id"), nullable=False, index=True
    )
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # 연관관계
    user = relationship("User", back_populates="favorites")
    menu = relationship("Menu")

    def __repr__(self):
        return f"<Favorite(user_id='{self.user_id}', menu_id='{self.menu_id}')>"
