# BUZZ

BUZZ is a full-stack social and collaboration platform designed to help students connect, communicate, and discover people with similar interests. The project includes a backend service, a mobile application, and a mobile backend component.

## Features

- Student-focused user profiles.
- Interest-based user discovery.
- Social interaction and collaboration workflows.
- Mobile application interface.
- Backend API integration.
- Data storage and management.
- Modular backend and mobile architecture.
- AI-ready structure for future matching and recommendation features.

## Project Structure

```text
BUZZ/
│
├── backend/
│   ├── src/
│   ├── data/
│   ├── .env
│   ├── database.json
│   ├── docker-compose.yml
│   ├── package.json
│   └── package-lock.json
│
├── backend_mobile/
│   ├── mobile/
│   ├── package.json
│   └── package-lock.json
│
├── mobile/
│   ├── assets/
│   ├── src/
│   ├── App.js
│   ├── app.json
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

## Technologies Used

- JavaScript
- Node.js
- React Native
- REST APIs
- JSON
- Docker
- Database or local JSON storage
- Git and GitHub

## Requirements

Install the following before running the project:

- Node.js
- npm
- Git
- Expo CLI or Expo Go
- Docker Desktop, if required by the backend

Check the installed versions:

```bash
node --version
npm --version
git --version
```

## Installation

Clone the repository:

```bash
git clone https://github.com/ZAINSIT/buzz.git
```

Move into the project directory:

```bash
cd buzz
```

## Backend Setup

Move into the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file if the backend requires environment variables:

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
```

Do not commit the actual `.env` file to GitHub.

Start the backend:

```bash
npm start
```

If the project uses a development script:

```bash
npm run dev
```

If Docker is configured:

```bash
docker compose up
```

## Mobile Setup

Open another terminal and move into the mobile folder:

```bash
cd mobile
```

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

You can then:

- Scan the QR code using Expo Go.
- Press `a` to open the Android emulator.
- Press `i` to open the iOS simulator, if available.
- Press `w` to open the web version, if supported.

## Backend Mobile Setup

If `backend_mobile` is a separate application, open another terminal:

```bash
cd backend_mobile
npm install
npm start
```

Use the command defined in its `package.json` if it has a different start script.

## API Configuration

The mobile application must use the correct backend URL.

For an Android emulator, the local computer is commonly accessed using:

```text
http://10.0.2.2:5000
```

For a physical device, use your computer’s local network IP address:

```text
http://192.168.x.x:5000
```

Make sure the phone and computer are connected to the same Wi-Fi network.

Do not use `localhost` on a physical phone to access a backend running on your computer. On the phone, `localhost` refers to the phone itself.

## Useful Commands

Install dependencies:

```bash
npm install
```

Start the project:

```bash
npm start
```

Start development mode:

```bash
npm run dev
```

Run Expo:

```bash
npx expo start
```

Check Git status:

```bash
git status
```

Create a new Git branch:

```bash
git checkout -b feature-name
```

## GitHub Upload

From the root `BUZZ` folder:

```bash
git init
git branch -M main
git remote add origin https://github.com/ZAINSIT/buzz.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

If the remote already exists:

```bash
git remote set-url origin https://github.com/ZAINSIT/buzz.git
git push -u origin main
```

## Environment and Security

The following files should not be committed:

```text
.env
node_modules/
database.json
data/
.expo/
```

Use a safe environment template instead:

```text
# .env.example
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
```

Never commit API keys, passwords, access tokens, or private database credentials.

## Application Workflow

1. The user opens the BUZZ mobile application.
2. The application communicates with the backend through APIs.
3. The backend processes requests and manages application data.
4. User information and interests are used for social discovery.
5. The application can support future matching and recommendation features.
6. Users can interact with other students through the platform.

## Future Improvements

- User registration and login.
- Profile editing.
- Interest-based recommendations.
- AI-powered student matching.
- Chat and real-time messaging.
- Notifications.
- Image and document sharing.
- PostgreSQL or MongoDB integration.
- JWT authentication.
- Role-based authorization.
- Cloud deployment.
- Automated testing.
- CI/CD integration.
- Improved security and data validation.

## Learning Outcomes

This project provides practical experience with:

- Full-stack application development.
- Node.js backend development.
- React Native mobile development.
- REST API communication.
- JSON data handling.
- Environment configuration.
- Git and GitHub workflows.
- Docker-based development.
- Mobile application debugging.
- Designing AI-ready application features.

## Disclaimer

BUZZ is a student-focused development project created for educational and portfolio purposes. Features and security controls may require further testing and improvement before production use.
