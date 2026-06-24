async def test_create_parameter_for_valid_brew(client):
    brew_response = await client.post("/brews", json={"rating": 8})
    brew_id = brew_response.json()["id"]

    param_response = await client.post(
        f"/brews/{brew_id}/parameters",
        json={"key": "filter_type", "value": "Hario V60-02"},
    )
    assert param_response.status_code == 201
    data = param_response.json()
    assert data["key"] == "filter_type"
    assert data["brew_id"] == brew_id


async def test_create_parameter_for_nonexistent_brew(client):
    response = await client.post(
        "/brews/9999/parameters",
        json={"key": "technique", "value": "Rao spin"},
    )
    assert response.status_code == 404
