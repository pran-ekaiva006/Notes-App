# Notes API

A production-ready multi-user Notes API backend built with Node.js, Express, and MongoDB.

## Features
- JWT Authentication (Register/Login)
- Full CRUD for Notes
- Note Sharing (Access Control)
- Note Pinning
- MongoDB Full-Text Search
- Pagination
- Security Middleware (Helmet, Rate Limit, Mongo Sanitize)
- Swagger OpenAPI Documentation

## Local Setup
1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in the values
4. Run `npm run dev` for development

## Deployment Guide (Render)

This application is ready to be deployed on platforms like [Render](https://render.com).

### Steps
1. Create a new **Web Service** on Render and connect your repository.
2. Configure the service:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add the following Environment Variables in the Render dashboard:
   - `PORT`: (Render will set this automatically, but you can set it if needed)
   - `MONGO_URI`: Your MongoDB Atlas connection string. Make sure to whitelist Render's IP addresses (or allow access from anywhere `0.0.0.0/0` if required by Render's dynamic IPs).
   - `JWT_SECRET`: A strong random string for signing tokens.
   - `JWT_EXPIRES_IN`: E.g., `7d`.
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: The URL of your frontend application (e.g., `https://my-frontend.vercel.app`) to restrict CORS. Use `*` to allow all.
4. Click **Create Web Service**.

### Verifying Deployment
Once deployed, you can verify the deployment by visiting:
- Health Check: `https://your-render-url.onrender.com/`
- API Specs: `https://your-render-url.onrender.com/openapi.json`
- Swagger UI: `https://your-render-url.onrender.com/api-docs/`
