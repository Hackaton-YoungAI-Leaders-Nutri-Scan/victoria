from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from db.db import UserProfile, FoodRegister
from recomendaciones import REGLAS_POR_ENFERMEDAD
    





def obtener_consumo_diario(session, user_id: int):
    """Suma los nutrientes del día para un usuario."""
    hoy = datetime.utcnow().date()

    registros = (
        session.query(FoodRegister)
        .filter(
            FoodRegister.user_profile_id == user_id,
            FoodRegister.timestamp >= datetime(hoy.year, hoy.month, hoy.day),
        )
        .all()
    )

    # Sumamos nutrientes
    totales = {
        "calorias": 0,
        "carbohidratos": 0,
        "proteinas": 0,
        "grasas": 0,
        "azucares": 0,
        "sal": 0,
    }

    for r in registros:
        totales["calorias"] += r.calorias or 0
        totales["carbohidratos"] += r.carbohidratos or 0
        totales["proteinas"] += r.proteinas or 0
        totales["grasas"] += r.grasas or 0
        totales["azucares"] += r.azucares or 0
        totales["sal"] += r.sal or 0

    return totales


def recomendaciones_estandar(user: UserProfile):
    """Rangos estándar OMS/FAO para adultos mayores."""
    
    if user.gender.lower() == "masculino":
        calorias = (2000, 2600)
    else:
        calorias = (1600, 2000)

    return {
        "calorias_min": calorias[0],
        "calorias_max": calorias[1],

        # General OMS:
        "carbohidratos_min": 130,
        "carbohidratos_max": 300,

        "proteinas_min": round(0.8 * user.weight_kg),
        "proteinas_max": round(1.2 * user.weight_kg),

        "grasas_max": 70,
        "azucares_max": 25,
        "sal_max": 5,
    }


# -------------------------------
# Fórmula de Mifflin – St Jeor 
# -------------------------------
def calcular_tmb(user: UserProfile):
    """Retorna Tasa Metabólica Basal (TMB) según Mifflin St-Jeor."""
    if not user.weight_kg or not user.height_cm or not user.age:
        return None

    if user.gender.lower() == "masculino":
        tmb = 10 * user.weight_kg + 6.25 * user.height_cm - 5 * user.age + 5
    else:
        tmb = 10 * user.weight_kg + 6.25 * user.height_cm - 5 * user.age - 161

    return tmb


def factor_actividad(user: UserProfile):
    """Devuelve factor según nivel de actividad."""
    # Puedes guardar esto en el UserProfile más adelante
    actividad = getattr(user, "activity_level", "moderado").lower()

    mapping = {
        "sedentario": 1.2,
        "ligero": 1.375,
        "moderado": 1.55,
        "activo": 1.725,
        "muy_activo": 1.9,
    }
    return mapping.get(actividad, 1.55)


def calcular_tdee(user: UserProfile):
    """Calorías recomendadas al día."""
    tmb = calcular_tmb(user)
    if not tmb:
        return None

    return round(tmb * factor_actividad(user))



def ajustar_recomendaciones_por_enfermedad(user: UserProfile, rec: dict):
    if not user.diseases:
        return rec
    
    rec_mod = rec.copy()

    for enfermedad in user.diseases:
        enfermedad = enfermedad.lower()

        if enfermedad not in REGLAS_POR_ENFERMEDAD:
            continue
        
        reglas = REGLAS_POR_ENFERMEDAD[enfermedad]

        for k, v in reglas.items():

            # Caso especial: déficit calórico para obesidad
            if k == "calorias_deficit" and "tdee" in rec:
                rec_mod["calorias_max"] = int(rec["tdee"] * v)
                continue

            # Si el rango existe, se reemplaza
            rec_mod[k] = v

    return rec_mod

def generar_alertas_nutricionales(user: UserProfile, consumo: dict):
    rec_base = recomendaciones_estandar(user)
    tdee = calcular_tdee(user)
    rec_base["tdee"] = tdee

    # Aplicar modificaciones por enfermedades
    rec = ajustar_recomendaciones_por_enfermedad(user, rec_base)

    alertas = []

    # --- Calorías ---
    if consumo["calorias"] < rec["calorias_min"]:
        alertas.append("Calorías por debajo de lo recomendado.")
    if consumo["calorias"] > rec["calorias_max"]:
        alertas.append("Ha excedido sus calorías recomendadas.")
    
    # --- Carbohidratos ---
    if consumo["carbohidratos"] > rec["carbohidratos_max"]:
        alertas.append("Exceso de carbohidratos.")
    
    # --- Azúcar ---
    if consumo["azucares"] > rec["azucares_max"]:
        alertas.append("Azúcares por encima del límite recomendado.")

    # --- Sal ---
    if consumo["sal"] > rec["sal_max"]:
        alertas.append("Ha superado la recomendación máxima de sal.")
    
    if not alertas:
        alertas.append("Su ingesta diaria está dentro de rangos adecuados.")

    return {
        "consumo": consumo,
        "recomendaciones": rec,
        "tdee": tdee,
        "alertas": alertas,
    }
