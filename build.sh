#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Compile translations
python manage.py compilemessages

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

echo "Build completed successfully!"