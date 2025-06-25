import json
import logging
import logging.config
import os
from datetime import datetime
from typing import Any, Dict

from app.core.config import settings


class JSONFormatter(logging.Formatter):
    """JSON 형태의 로그 포맷터"""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # 추가 필드가 있으면 포함
        if hasattr(record, "user_id"):
            log_entry["user_id"] = record.user_id
        if hasattr(record, "request_id"):
            log_entry["request_id"] = record.request_id
        if hasattr(record, "endpoint"):
            log_entry["endpoint"] = record.endpoint
        if hasattr(record, "method"):
            log_entry["method"] = record.method
        if hasattr(record, "status_code"):
            log_entry["status_code"] = record.status_code
        if hasattr(record, "response_time"):
            log_entry["response_time"] = record.response_time

        # 예외 정보가 있으면 포함
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, ensure_ascii=False)


def setup_logging():
    """로깅 설정 초기화"""

    # 로그 디렉토리 생성
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # 로그 레벨 설정
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    # 로깅 설정
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": JSONFormatter,
            },
            "simple": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": "DEBUG" if settings.debug else "INFO",
                "formatter": "simple",
                "stream": "ext://sys.stdout",
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "INFO",
                "formatter": "json",
                "filename": f"{log_dir}/app.log",
                "maxBytes": 10 * 1024 * 1024,  # 10MB
                "backupCount": 5,
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "ERROR",
                "formatter": "json",
                "filename": f"{log_dir}/error.log",
                "maxBytes": 10 * 1024 * 1024,  # 10MB
                "backupCount": 5,
            },
        },
        "loggers": {
            "app": {
                "level": log_level,
                "handlers": ["console", "file", "error_file"],
                "propagate": False,
            },
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console", "file"],
                "propagate": False,
            },
            "sqlalchemy": {
                "level": "WARNING",
                "handlers": ["console", "file"],
                "propagate": False,
            },
        },
        "root": {
            "level": "INFO",
            "handlers": ["console"],
        },
    }

    logging.config.dictConfig(logging_config)


def get_logger(name: str = "app") -> logging.Logger:
    """로거 인스턴스 반환"""
    return logging.getLogger(name)


class RequestLogger:
    """요청별 로깅을 위한 컨텍스트 매니저"""

    def __init__(self, logger: logging.Logger, request_id: str = None):
        self.logger = logger
        self.request_id = request_id or f"req_{datetime.utcnow().timestamp()}"
        self.start_time = None

    def __enter__(self):
        self.start_time = datetime.utcnow()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time:
            duration = (datetime.utcnow() - self.start_time).total_seconds()
            self.logger.info(
                f"Request completed in {duration:.3f}s",
                extra={"request_id": self.request_id, "response_time": duration},
            )

    def log_request(self, method: str, endpoint: str, user_id: str = None):
        """요청 로그 기록"""
        self.logger.info(
            f"Request started: {method} {endpoint}",
            extra={
                "request_id": self.request_id,
                "method": method,
                "endpoint": endpoint,
                "user_id": user_id,
            },
        )

    def log_response(self, status_code: int, user_id: str = None):
        """응답 로그 기록"""
        self.logger.info(
            f"Response sent: {status_code}",
            extra={
                "request_id": self.request_id,
                "status_code": status_code,
                "user_id": user_id,
            },
        )

    def log_error(self, error: Exception, user_id: str = None):
        """에러 로그 기록"""
        self.logger.error(
            f"Request failed: {str(error)}",
            extra={
                "request_id": self.request_id,
                "user_id": user_id,
            },
            exc_info=True,
        )


# 로깅 설정 초기화
setup_logging()
