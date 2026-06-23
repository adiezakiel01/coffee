async def test_create_bean(client):
    response = await client.post(
        "/beans",
        json={
            "name": "Ethiopia Yirgacheffe",
            "roaster": "Five Elephant",
            "origin": "Ethiopia",
            "process": "washed",
            "roast_date": "2026-06-01",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Ethiopia Yirgacheffe"
    assert "id" in data


async def test_get_bean_not_found(client):
    response = await client.get("/beans/9999")
    assert response.status_code == 404
