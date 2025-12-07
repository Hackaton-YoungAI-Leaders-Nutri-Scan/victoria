REGLAS_POR_ENFERMEDAD = {
    "diabetes": {
        "azucares_max": 20,  # ADA recomienda restringir azúcares añadidos
        "carbohidratos_max": 250,
    },
    "hipertension": {
        "sal_max": 3,  # AHA/OMS bajo sodio (< 3 g/día)
    },
    "obesidad": {
        # calorías_max se ajusta según TDEE (lo hacemos dinámico luego)
        "calorias_deficit": 0.90,  # 10% menos que el TDEE
    },
    "dislipidemia": {
        "grasas_max": 60,  # reducción general de grasas totales
    },
}
