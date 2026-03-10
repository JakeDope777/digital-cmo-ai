"""
Shared test fixtures for the Digital CMO AI test suite.
"""

import os
import shutil
import sys
import tempfile
import uuid

import pytest

# Set test environment before importing app modules
TEST_ROOT = tempfile.mkdtemp(prefix="digital_cmo_tests_")
TEST_DB_PATH = os.path.join(TEST_ROOT, "test.db")
TEST_MEMORY_PATH = os.path.join(TEST_ROOT, "memory")

os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"
os.environ["SECRET_KEY"] = "test-secret-key-not-for-production"
os.environ["DEBUG"] = "false"
os.environ["MEMORY_BASE_PATH"] = TEST_MEMORY_PATH


@pytest.fixture()
def temp_memory_dir():
    """Provide a temporary directory for memory tests."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield tmpdir


# Only import app modules if they are available (some tests are unit-only)
try:
    from fastapi.testclient import TestClient
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    from app.db.session import Base, get_db
    from app.main import app

    # Test database setup
    TEST_DB_URL = os.environ["DATABASE_URL"]
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    @pytest.fixture(scope="session", autouse=True)
    def setup_test_db():
        """Create test database tables once for the entire test session."""
        os.makedirs(TEST_MEMORY_PATH, exist_ok=True)
        Base.metadata.create_all(bind=engine)
        yield
        Base.metadata.drop_all(bind=engine)
        shutil.rmtree(TEST_ROOT, ignore_errors=True)

    @pytest.fixture(autouse=True)
    def reset_test_db():
        """Reset persisted rows between tests for deterministic results."""
        with engine.begin() as connection:
            for table in reversed(Base.metadata.sorted_tables):
                connection.execute(table.delete())
        yield

    @pytest.fixture()
    def db_session():
        """Provide a clean database session for each test."""
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.rollback()
            session.close()

    @pytest.fixture()
    def client():
        """Provide a FastAPI test client with overridden database dependency."""
        app.dependency_overrides[get_db] = override_get_db
        with TestClient(app) as c:
            yield c
        app.dependency_overrides.clear()

    @pytest.fixture()
    def auth_headers(client, db_session):
        """Register a verified test user and return authorization headers."""
        from app.db import models

        email = f"verified-{uuid.uuid4().hex[:8]}@example.com"
        signup_data = {"email": email, "password": "testpassword123"}
        response = client.post("/auth/signup", json=signup_data)
        if response.status_code == 409:
            response = client.post("/auth/login", json=signup_data)
        user = db_session.query(models.User).filter(models.User.email == email).first()
        user.is_email_verified = True
        db_session.commit()
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    @pytest.fixture()
    def unverified_auth_headers(client):
        """Register an unverified test user and return authorization headers."""
        email = f"unverified-{uuid.uuid4().hex[:8]}@example.com"
        signup_data = {"email": email, "password": "testpassword123"}
        response = client.post("/auth/signup", json=signup_data)
        if response.status_code == 409:
            response = client.post("/auth/login", json=signup_data)
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

except ImportError:
    # App modules not fully available; skip integration fixtures
    pass
