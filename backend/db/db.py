from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session, Mapped, mapped_column
from sqlalchemy import create_engine, Integer, String, DateTime
import os
from datetime import datetime


DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = scoped_session(sessionmaker(bind=engine, autoflush=False, autocommit=False))
Base = declarative_base()

## MODELS
class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    phone: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    message: Mapped[str] = mapped_column(String(4096), nullable=False)
    direction: Mapped[str] = mapped_column(String(8), nullable=False)  # 'in' o 'out'
    media_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    media_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    media_type: Mapped[str | None] = mapped_column(String(16), nullable=True)  # 'image', 'audio', etc.
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "phone": self.phone,
            "message": self.message,
            "direction": self.direction,
            "media_url": self.media_url,
            "media_id": self.media_id,
            "media_type": self.media_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

def init_db():
    Base.metadata.create_all(bind=engine)
