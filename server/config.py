import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DEBUG = os.getenv('TORNADO_DEBUG') == 'True'

SECRET_KEY = os.getenv('SECRET_KEY', 'fiDSpuZ7QFe8fm0XP9Jb7ZIPNsOegkHYtgKSd4I83Hs=')

PORT = os.getenv('PORT', 8080)


DATABASE_URI = os.getenv('DATABASE_URI', 'mysql+aiomysql://doudizhu:Nx19981216%40@10.0.1.33:3306/ddz')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'root': {
        'level': 'INFO',
        'handlers': ['console'],
        'propagate': True,
    },
    'formatters': {
        'verbose': {
            'format': '%(asctime)s %(levelname)s %(module)s %(lineno)d %(message)s'
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
    },
    'loggers': {
        'tornado.general': {
            'handlers': ['console'],
            'propagate': True,
        },
    }
}