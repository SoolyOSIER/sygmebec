FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY sygmebec_backend/requirements/base.txt /tmp/requirements/base.txt
COPY sygmebec_backend/requirements/production.txt /tmp/requirements/production.txt
RUN pip install --no-cache-dir -r /tmp/requirements/production.txt

COPY . .

# The build needs Django settings but must not bake a real secret into the image.
RUN SECRET_KEY=build-only-secret DJANGO_DEBUG=False python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "sygmebec_backend.wsgi:application"]
