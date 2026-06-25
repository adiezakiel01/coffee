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


async def test_suggest_no_brews(client):
    bean_response = await client.post("/beans", json={"name": "Untested Bean"})
    bean_id = bean_response.json()["id"]

    response = await client.get(f"/analytics/suggest/{bean_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["suggestion"] is None
    assert data["brew_count"] == 0


async def test_suggest_with_one_brew(client):
    bean_response = await client.post("/beans", json={"name": "Tested Bean"})
    bean_id = bean_response.json()["id"]
    brew_response = await client.post(
        "/brews",
        json={"bean_id": bean_id, "water_temp_celsius": 93.0, "rating": 9},
    )
    brew_id = brew_response.json()["id"]

    response = await client.get(f"/analytics/suggest/{bean_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["based_on_brew_id"] == brew_id
    assert data["suggestion"]["water_temp_celsius"] == 93.0


async def test_suggest_bean_not_found(client):
    response = await client.get("/analytics/suggest/9999")
    assert response.status_code == 404
