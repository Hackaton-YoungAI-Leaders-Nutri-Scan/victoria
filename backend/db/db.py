from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session, Mapped, mapped_column, relationship
from sqlalchemy import create_engine, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
import os
from datetime import datetime


DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = scoped_session(sessionmaker(bind=engine, autoflush=False, autocommit=False))
Base = declarative_base()

## MODELS


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    registered_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    # Id de red de conexión (por ejemplo, Google, Facebook, Apple, etc.)
    # Puede ser un sub o user_id externo
    external_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    provider: Mapped[str | None] = mapped_column(String(50), nullable=True)  # ej: 'google'

    # Relación uno-a-uno / uno-a-muchos con el perfil de usuario
    profiles: Mapped[list["UserProfile"]] = relationship(
        "UserProfile", back_populates="client", cascade="all, delete-orphan"
    )


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    client_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True
    )

    profile_photo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(32), nullable=True)
    whatsapp_number: Mapped[str] = mapped_column(String(32), nullable=False)

    rh: Mapped[str | None] = mapped_column(String(8), nullable=True)
    height_cm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Integer, nullable=True)

    diseases: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    allergies: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)

    accepted_terms: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    client: Mapped[Client] = relationship("Client", back_populates="profiles")


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
