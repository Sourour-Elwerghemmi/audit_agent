from app.database import engine
from app.models_db import Audit

Audit.metadata.create_all(bind=engine)
