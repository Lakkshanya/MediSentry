# 1. Navigate into the inner project folder
cd MediSentry_Mobile

# 2. Now run the installation
npm install

# 3. Start the mobile app
npx expo start --host lan

cd MediSentry_Backend

# Install dependencies if not done yet
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers torch numpy pandas scikit-learn requests psycopg2-binary

# Start the server (allowing network access)
python manage.py runserver 0.0.0.0:8000

# 1. Navigate to the web directory
cd MediSentry_Web

# 2. Install Node.js dependencies
npm install

# 3. Start the development server
npm run dev
