from datetime import date
from app.models.bean import Bean
from tests.conftest import TestSessionLocal


async def test_create_bean_in_db():
    async with TestSessionLocal() as session:
        bean = Bean(
            name="Ethiopia Yirgacheffe",
            roaster="Five Elephant",
            origin="Ethiopia",
            process="washed",
            roast_date=date(2026, 6, 1),
        )
        session.add(bean)
        await session.commit()
        await session.refresh(bean)

        assert bean.id is not None
        assert bean.name == "Ethiopia Yirgacheffe"
        assert bean.origin == "Ethiopia"