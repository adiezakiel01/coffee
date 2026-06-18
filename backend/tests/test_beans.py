from datetime import date
from app.models.bean import Bean


async def test_create_bean_in_db(db_session):
    bean = Bean(
        name="Ethiopia Yirgacheffe",
        roaster="Five Elephant",
        origin="Ethiopia",
        process="washed",
        roast_date=date(2026, 6, 1),
    )
    db_session.add(bean)
    await db_session.commit()
    await db_session.refresh(bean)

    assert bean.id is not None
    assert bean.name == "Ethiopia Yirgacheffe"
    assert bean.origin == "Ethiopia"