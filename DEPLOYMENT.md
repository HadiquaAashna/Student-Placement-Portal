# CampusConnect Placement Portal - Deployment Guide

This guide describes how to deploy the CampusConnect full-stack application to production environments (such as Render, Vercel, and IBM Cloud) and details how administrators or faculty can configure the IBM Cloud integrations.

---

## 1. Prerequisites & Production Environment Setup

Before deploying the application, ensure you have:
1. A **MongoDB Atlas** database cluster (or any hosted MongoDB URI).
2. A **Cloudinary** account for production image and document hosting.
3. An **IBM Cloud** account for provisioning App ID and Watson Assistant.

---

## 2. Deploying the Backend (Node.js + Express)

The backend can be hosted on services like **Render**, **Heroku**, or **IBM Cloud Code Engine**.

### Deployment on Render (Recommended)
1. Sign in to [Render](https://render.com) and click **New > Web Service**.
2. Connect your Git repository.
3. Set the following configuration parameters:
   - **Name**: `campusconnect-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install --legacy-peer-deps`
   - **Start Command**: `node server.js`
4. In the **Environment Variables** tab, add all keys from your `.env` file (e.g. `PORT=10000`, `MONGODB_URI`, `JWT_SECRET`, etc.).

---

## 3. Deploying the Frontend (Astro v7)

Since the frontend is a static Astro project that queries the backend API, it can be hosted on **Vercel** or **Netlify**.

### Deployment on Vercel
1. Sign in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Import your Git repository.
3. In the project build settings:
   - **Root Directory**: `./` (Root directory of the repo)
   - **Framework Preset**: `Astro`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Vercel will automatically compile the Astro pages and build the static assets.

---

## 4. Configuring IBM Cloud Services (For Faculty/Administrators)

Once the application is live, faculty administrators can provision and connect IBM Cloud services.

### A. IBM Cloud App ID Setup (Enterprise SSO Authentication)
1. Go to the [IBM Cloud Catalog](https://cloud.ibm.com/catalog) and provision an **App ID** service instance.
2. In the App ID dashboard:
   - Go to **Manage Authentication** and toggle on the Identity Providers you want (e.g. Cloud Directory, Google, SAML).
   - Go to **Applications** and click **Add Application** (choose **Regular Web Application**).
   - Note the generated `tenantId`, `clientId`, `secret`, and `oauthServerUrl`.
3. In the backend environment settings, replace the placeholder variables:
   ```env
   IBM_APP_ID_TENANT_ID=your_actual_tenant_id
   IBM_APP_ID_CLIENT_ID=your_actual_client_id
   IBM_APP_ID_SECRET=your_actual_secret
   IBM_APP_ID_OAUTH_SERVER_URL=https://<region>.appid.cloud.ibm.com/oauth/v4/<tenant_id>
   ```
4. Once configured, restart the backend. The authentication middleware will automatically check the signatures of tokens against the App ID JWKS endpoint.

### B. IBM Watson Assistant Setup (AI Chatbot)
1. Go to the [IBM Cloud Catalog](https://cloud.ibm.com/catalog) and provision a **Watson Assistant** instance.
2. Open the Assistant tool:
   - Create a **New Assistant**.
   - Build actions or upload placement dialogues (such as answering FAQ, CGPA rules, and recruiter listings).
   - Navigate to the **Assistant Settings** page and locate the API Key, Service URL, and Assistant ID.
3. In the backend environment settings, configure the Watson parameters:
   ```env
   IBM_WATSON_ASSISTANT_APIKEY=your_actual_apikey
   IBM_WATSON_ASSISTANT_SERVICE_URL=https://api.<region>.assistant.watson.cloud.ibm.com/instances/<instance_id>
   IBM_WATSON_ASSISTANT_ID=your_actual_assistant_id
   ```
4. Restart the backend service. The `/api/chatbot` endpoint will intercept incoming queries and forward them to the live Watson Assistant engine instead of falling back to local mocks.
