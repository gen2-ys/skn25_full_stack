from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        # 'NAME': BASE_DIR / 'db.sqlite3',
        'NAME' : 'backend',
        'USER' : 'play',
        'PASSWORD'  : 'Encore$SKN25',
        'HOST' : '103.196.86.88',
        'PORT' : '32951'
    }
}