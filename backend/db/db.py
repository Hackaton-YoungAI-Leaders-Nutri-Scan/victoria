import os
from datetime import datetime

from dotenv import load_dotenv
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, create_engine
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import (
    Mapped,
    declarative_base,
    mapped_column,
    relationship,
    scoped_session,
    sessionmaker,
)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = scoped_session(
    sessionmaker(bind=engine, autoflush=False, autocommit=False)
)
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
    external_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True, index=True
    )
    provider: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )  # ej: 'google'

    # Relación uno-a-uno / uno-a-muchos con el perfil de usuario
    profiles: Mapped[list["UserProfile"]] = relationship(
        "UserProfile", back_populates="client", cascade="all, delete-orphan"
    )


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    client_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("clients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
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

    # Fase del acompañamiento de Victoria: 'profiling' (test de personalidad) o 'daily' (seguimiento diario)
    personality_stage: Mapped[str] = mapped_column(
        String(32), default="profiling", nullable=False
    )

    # Resumen estructurado de personalidad/hábitos generado por IA (JSON)
    personality_profile: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    food_registers = relationship("FoodRegister", back_populates="user_profile")

    client: Mapped[Client] = relationship("Client", back_populates="profiles")


class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    phone: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    message: Mapped[str] = mapped_column(String(4096), nullable=False)
    direction: Mapped[str] = mapped_column(String(8), nullable=False)  # 'in' o 'out'
    media_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    media_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    media_type: Mapped[str | None] = mapped_column(
        String(16), nullable=True
    )  # 'image', 'audio', etc.
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

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


class FoodRegister(Base):
    __tablename__ = "food_register"

    id_registro: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_profile_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False
    )

    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    comidas: Mapped[str] = mapped_column(String(1024), nullable=False)
    calorias: Mapped[int | None] = mapped_column(Integer, nullable=True)
    carbohidratos: Mapped[int | None] = mapped_column(Integer, nullable=True)
    proteinas: Mapped[int | None] = mapped_column(Integer, nullable=True)
    grasas: Mapped[int | None] = mapped_column(Integer, nullable=True)
    azucares: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sal: Mapped[int | None] = mapped_column(Integer, nullable=True)

    user_profile = relationship("UserProfile", back_populates="food_registers")

    def to_dict(self):
        return {
            "id_registro": self.id_registro,
            "user_profile_id": self.user_profile_id,
            "timestamp": self.timestamp.isoformat(),
            "comidas": self.comidas,
            "calorias": self.calorias,
            "carbohidratos": self.carbohidratos,
            "proteinas": self.proteinas,
            "grasas": self.grasas,
            "azucares": self.azucares,
            "sal": self.sal,
        }


def init_db():
    Base.metadata.create_all(bind=engine)
