async def test_create_brew_with_valid_bean(client):
    bean_response = await client.post("/beans", json={"name": "Kenya AA"})
    bean_id = bean_response.json()["id"]

    brew_response = await client.post(
        "/brews",
        json={"bean_id": bean_id, "water_temp_celsius": 93.0, "rating": 8},
    )
    assert brew_response.status_code == 201
    assert brew_response.json()["bean_id"] == bean_id


async def test_create_brew_with_invalid_bean_id(client):
    response = await client.post("/brews", json={"bean_id": 9999, "rating": 7})
    assert response.status_code == 404


async def test_create_brew_rating_out_of_range(client):
    response = await client.post("/brews", json={"rating": 15})
    assert response.status_code == 422
