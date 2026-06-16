import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional


def get_logger(
    name: str = "app",
    log_dir: str = "logs",
    filename: str = "app.log",
    level: str = "INFO",
    console: bool = True,
    rotating: bool = True,
    max_bytes: int = 10 * 1024 * 1024,  
    backup_count: int = 5,
    encoding: str = "utf-8",
    format_str: Optional[str] = None,
) -> logging.Logger:

    logger = logging.getLogger(name)

    # Prevent duplicate handlers
    if logger.handlers:
        return logger

    logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    logger.propagate = False

    Path(log_dir).mkdir(parents=True, exist_ok=True)

    if format_str is None:
        format_str = (
            "%(asctime)s | %(levelname)-8s | "
            "%(name)s | %(filename)s:%(lineno)d | %(message)s"
        )

    formatter = logging.Formatter(format_str)

    log_file = Path(log_dir) / filename

    # File handler
    if rotating:
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding=encoding,
        )
    else:
        file_handler = logging.FileHandler(
            log_file,
            encoding=encoding,
        )

    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    # Console handler
    if console:
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

    return logger
