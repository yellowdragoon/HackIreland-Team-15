import logging
from logging.handlers import RotatingFileHandler
import os
import sys
from datetime import datetime

class Logger:
    _instance = None
    _logger = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Logger, cls).__new__(cls)
            cls._setup_logger()
        return cls._instance

    @classmethod
    def _setup_logger(cls):
        if cls._logger is not None:
            return

        cls._logger = logging.getLogger('app')
        cls._logger.setLevel(logging.INFO)

        # Create logs directory if it doesn't exist
        log_dir = 'logs'
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        # File handler with rotation
        file_handler = RotatingFileHandler(
            os.path.join(log_dir, f'app_{datetime.now().strftime("%Y%m%d")}.log'),
            maxBytes=10485760,  # 10MB
            backupCount=5
        )
        file_handler.setLevel(logging.INFO)

        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)

        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)

        cls._logger.addHandler(file_handler)
        cls._logger.addHandler(console_handler)

    @classmethod
    def info(cls, message: str):
        if cls._logger is None:
            cls._setup_logger()
        cls._logger.info(message)

    @classmethod
    def error(cls, message: str):
        if cls._logger is None:
            cls._setup_logger()
        cls._logger.error(message)

    @classmethod
    def warning(cls, message: str):
        if cls._logger is None:
            cls._setup_logger()
        cls._logger.warning(message)

    @classmethod
    def debug(cls, message: str):
        if cls._logger is None:
            cls._setup_logger()
        cls._logger.debug(message)
