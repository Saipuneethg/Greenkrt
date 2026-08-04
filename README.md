# 🌱 GreenKrt

**GreenKrt** is a comprehensive, bilingual (English & Telugu) agritech platform designed to bridge the gap between farmers, delivery partners, and platform administrators. Built on a modern tech stack with integrated Artificial Intelligence, GreenKrt empowers rural communities with localized agricultural resources.

---

## 🎯 Features

*   **Role-Based Access Control (RBAC):**
    *   **🧑‍🌾 Farmers:** Phone-number-first registration. View weather, buy fertilizers, track orders, and request drone spraying or AI soil testing.
    *   **🚚 Delivery Partners:** Receive assigned orders and manage delivery statuses on the go.
    *   **🛡️ Admins:** Dedicated, secure portal to oversee operations, inventory, services, and platform analytics.
*   **🛒 Agritech Marketplace:** A robust e-commerce flow for purchasing fertilizers, pesticides, and seeds with automated inventory tracking.
*   **🤖 AI Soil Analysis (Groq LLaMA):** Farmers can upload PDF soil test reports. The platform extracts the text and uses a fast LLM to act as an expert agronomist, analyzing the chemical balance and providing a localized 4-phase fertilizer schedule using only available products in stock.
*   **🌍 Bilingual Support:** Full contextual localization across the entire app using a custom Context API.
*   **🔒 Secure Authentication:** JWT-based stateless authentication with strict database-level unique constraints.

---

## 💻 Tech Stack

### Frontend
*   **React 19 & Vite:** For blazing fast rendering and optimized builds.
*   **TailwindCSS:** For responsive, accessible, and clean user interfaces.
*   **React Router v7:** Client-side routing.
*   **Axios:** API communication.

### Backend
*   **Node.js & Express.js:** Scalable server architecture.
*   **MongoDB & Mongoose:** Flexible NoSQL database and schema modeling.
*   **Groq SDK:** Ultra-fast LLM inference for AI features.
*   **JWT & Bcrypt:** Session security and password hashing.
*   **Multer & PDF-Parse:** In-memory file uploading and text extraction for serverless environments.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas URI or local instance
*   Groq API Key
*   OpenWeatherMap API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Saipuneethg/Greenkrt.git
   cd Greenkrt
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Backend Environment Variables (`backend/.env`):**
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/greenkrt
   JWT_SECRET=your_jwt_secret
   WEATHER_API_KEY=your_openweathermap_api_key
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Development Servers:**
   *   **Backend:** `cd backend && npm run dev`
   *   **Frontend:** `cd frontend && npm run dev`

---

## 🛠️ Architecture Notes
*   **AI Recommendations:** The system forces the LLM to output `json_object` format with a temperature of `0` to guarantee deterministic mapping to exact database Product IDs.
*   **Unique Indexing:** Email is purely optional. The database strictly enforces uniqueness solely on the `phone` field to accommodate rural accessibility.

---
*Built for the future of farming.*
