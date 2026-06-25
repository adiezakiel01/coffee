async def test_rating_trend_empty(client):
    response = await client.get("/analytics/rating-trend")
    assert response.status_code == 200
    assert response.json() == []


async def test_rating_trend_includes_bean_name(client):
    bean_response = await client.post("/beans", json={"name": "Kenya AA"})
    bean_id = bean_response.json()["id"]
    await client.post("/brews", json={"bean_id": bean_id, "rating": 7})

    response = await client.get("/analytics/rating-trend")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["bean_name"] == "Kenya AA"


async def test_correlation_not_enough_brews(client):
    bean_response = await client.post("/beans", json={"name": "Colombia Huila"})
    bean_id = bean_response.json()["id"]
    await client.post("/brews", json={"bean_id": bean_id, "rating": 7})

    response = await client.get(f"/analytics/correlation/{bean_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["brew_count"] == 1
    assert data["correlations"] == {}
    assert "Not enough brews" in data["message"]


async def test_correlation_bean_not_found(client):
    response = await client.get("/analytics/correlation/9999")
    assert response.status_code == 404
