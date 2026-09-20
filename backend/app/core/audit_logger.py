import logging
import datetime
import json
import os

LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "logs"))
os.makedirs(LOG_DIR, exist_ok=True)

audit_log_file = os.path.join(LOG_DIR, "audit.log")

logging.basicConfig(
    filename=audit_log_file,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

logger = logging.getLogger("NyayaLensAudit")

def log_audit_event(event_type: str, user_id: str, details: dict):
    """
    Logs structured security and operational audit events.
    """
    event_payload = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "event_type": event_type,
        "user_id": user_id,
        "details": details
    }
    logger.info(json.dumps(event_payload))
    print(f"[AUDIT LOG] {event_type} | User: {user_id} | Details: {details}")
