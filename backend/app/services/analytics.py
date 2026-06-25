import pandas as pd
from app.models.brew import Brew

MIN_BREWS_FOR_CORRELATION = 5

NUMERIC_FIELDS = [
    "water_temp_celsius",
    "coffee_grams",
    "water_grams",
    "bloom_time_seconds",
    "total_time_seconds",
]


def brews_to_dataframe(brews: list[Brew]) -> pd.DataFrame:
    """
    Convert a list of Brew objects to a pandas DataFrame.
    """
    records = []
    for brew in brews:
        record = {
            "id": brew.id,
            "rating": brew.rating,
            "brewed_at": brew.brewed_at,
        }
        for field in NUMERIC_FIELDS:
            value = getattr(brew, field)
            record[field] = float(value) if value is not None else None
        records.append(record)

    return pd.DataFrame(records)


def compute_correlation(df: pd.DataFrame) -> dict[str, float | None]:
    """
    Compute the correlation matrix for the numeric fields of a list of Brew objects.
    """
    correlations: dict[str, float | None] = {}

    for field in NUMERIC_FIELDS:
        valid_rows = df[["rating", field]].dropna()
        if len(valid_rows) < MIN_BREWS_FOR_CORRELATION:
            correlations[field] = None
            continue

        correlation_value = valid_rows["rating"].corr(valid_rows[field])
        correlations[field] = (
            round(correlation_value, 3) if pd.notna(correlation_value) else None
        )

    return correlations


def find_best_brews(df: pd.DataFrame, top_n: int = 3) -> list[dict]:
    """
    Find the top N brews with the highest ratings.
    """
    valid = df.dropna(subset=["rating"]).sort_values(by="rating", ascending=False)
    return valid.head(top_n).to_dict(orient="records")


def suggest_brew_parameters(
    df: pd.DataFrame, correlations: dict[str, float | None] | None = None
) -> dict:
    """
    Suggest brew parameters based on the correlation with ratings.
    If correlations are not provided, they will be computed from the DataFrame.
    """
    valid = df.dropna(subset=["rating"])

    if valid.empty:
        return {
            "suggestion": None,
            "based_on_brew_id": None,
            "message": "Not enough data to suggest brew parameters.",
        }

    best_brew = valid.sort_values("rating", ascending=False).iloc[0]

    suggestion = {
        field: best_brew[field]
        for field in NUMERIC_FIELDS
        if pd.notna(best_brew[field])
    }

    notes = [
        f"Based on your highest-rated brew of this bean (rating: {int(best_brew['rating'])}/10)."
    ]

    if correlations:
        strong_correlations = {
            field: value
            for field, value in correlations.items()
            if value is not None and abs(value) >= 0.5
        }
        if strong_correlations:
            sorted_fields = sorted(
                strong_correlations.items(), key=lambda x: abs(x[1]), reverse=True
            )
            top_field, top_value = sorted_fields[0]
            direction = "higher" if top_value > 0 else "lower"
            notes.append(
                f"Your data also suggests {direction} {top_field.replace('_', ' ')} "
                f"tends to correlate with brews of better ratings (r={top_value}). "
            )

    return {
        "suggestion": suggestion,
        "based_on_brew_id": int(best_brew["id"]),
        "message": " ".join(notes),
    }
