# 🏙️ TraffiTech Production Handover

Follow these steps to deploy your Smart Traffic & Parking system to the cloud for **24/7 availability**.

---

### Step 1: Create a Cloud Database (5 mins)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a new Cluster (Shared/Free).
3. Under **Network Access**, allow access from "Everywhere" (0.0.0.0/0).
4. Under **Database Access**, create a user (e.g., `admin`) and copy the password.
5. Click **Connect** > **Drivers** and copy your Connection String. It looks like:
   `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/traffitech`

---

### Step 2: Prepare for Upload
1. Open the project folder on your computer.
2. **DELETE** the `node_modules` folders (both in root and inside `server`). These are very large and reconstructed in the cloud.
3. **DELETE** the `.env` files (keep them safe on your PC, you will copy the values into the cloud dashboard later).
4. Right-click the folder and select **Compress to ZIP**.

---

### Step 3: Deploy Backend (Render.com)
1. Go to [Render](https://render.com) and sign up (GitHub login recommended).
2. Click **New** > **Web Service**.
3. You can either connect a GitHub repo or use "Manual Deploy" by uploading your ZIP.
4. **Environment Variables**: Click "Advanced" and add:
   - `MONGODB_URI` = (Your string from Step 1)
   - `JWT_SECRET` = (Any long random string)
   - `STRIPE_SECRET_KEY` = (Your sk_test from Stripe)
5. **Start Command**: Set to `npm start` (inside the `server` folder).
6. Copy your new API URL (e.g. `https://traffitech-api.onrender.com`).

---

### Step 4: Deploy Frontend (Vercel.com)
1. Go to [Vercel](https://vercel.com) and sign up.
2. Click **Add New** > **Project**.
3. Upload your project folder or connect GitHub.
4. **Environment Variables**: Add:
   - `VITE_API_URL` = (Your Render URL from Step 3 + `/api`)
   - `VITE_STRIPE_PUBLISHABLE_KEY` = (Your pk_test from Stripe)
5. Click **Deploy**.

---

### ✅ Your Permanent Link
Once Step 4 is done, Vercel will give you a permanent link (e.g. `traffitech.vercel.app`) that works **24/7**!
