<div align="center">


# AICTE-FDRMS
### Centralized Security Deposit & Fixed Deposit Receipt Management System
**All India Council for Technical Education (Statutory Body under Ministry of Education, Govt. of India)**

[![Java](https://img.shields.io/badge/Java-25%20LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Cloud_M0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.5_Flash_RAG-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Deploy Status](https://img.shields.io/badge/GitHub_Pages-Automated_CI%2FCD-222222?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/muthukumaranarc/AICTE-FDRMS/actions)

<p align="center">
  <a href="#-live-deployments"><b>Live Demo</b></a> •
  <a href="#-architecture"><b>Architecture</b></a> •
  <a href="#-core-modules"><b>Key Features</b></a> •
  <a href="#-quick-start"><b>Local Setup</b></a> •
  <a href="#-cloud-deployment-guide"><b>Hosting on Render & GitHub</b></a> •
  <a href="#-environment-variables"><b>Environment Config</b></a>
</p>

</div>

---

## 🏛️ Executive Overview

The **AICTE Fixed Deposit Receipt Management System (AICTE-FDRMS)** is an enterprise regulatory oversight platform engineered for the **Regulation Bureau and Finance Bureau** of the All India Council for Technical Education (AICTE).

Under the statutory mandates of the **AICTE Approval Process Handbook (APH Clause 4.12 & Chapter IV)**, every approved technical institution is required to establish and maintain substantial security deposits (via **Fixed Deposit Receipts (FDRs)** or **Bank Guarantees (BGs)**) under irrevocable joint lien in favour of the Regional Officer, AICTE.

**AICTE-FDRMS** transitions the Council from manual registers and localized spreadsheets to an automated, cryptographically audited digital registry featuring real-time bank verification, statutory renewal alerts, and an intelligent **Gemini 3.5 RAG Regulatory Assistant**.

---

## 🚀 Live Deployments

| Component | Target Platform | URL / Deployment Link | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Web Portal** | **GitHub Pages** | [https://muthukumaranarc.github.io/AICTE-FDRMS/](https://muthukumaranarc.github.io/AICTE-FDRMS/) | 🟢 CI/CD Automated |
| **Backend REST Service** | **Render (Web Service)** | `https://aicte-fdrms-backend.onrender.com/api` | 🟢 Docker Ready |
| **Database Cluster** | **MongoDB Atlas** | AWS Mumbai (`ap-south-1`) Primary Shard Replica Set | 🟢 Connected |

---

## 📐 Architecture

```mermaid
graph TD
    subgraph Client ["Client Presentation Layer"]
        UI["React 19 + Vite + Tailwind CSS SPA"]
        RAG["Gemini 3.5 Flash RAG Assistant Drawer"]
    end

    subgraph Hosting ["Frontend Hosting (Static Edge CDN)"]
        GHP["GitHub Pages / Vercel Edge"]
    end

    subgraph Backend ["Application Layer (Render Cloud Service)"]
        API["Spring Boot 3 REST Controllers"]
        SEC["Spring Security + RBAC + RateLimiter"]
        SVC["Regulatory Services (FDR, Scrutiny, Release)"]
        AUD["Cryptographic Audit Trail (SHA-256 Chaining)"]
    end

    subgraph Data ["Persistence & AI Cloud Services"]
        MDB[("MongoDB Atlas Cloud Database")]
        GEMINI["Google Generative Language API (Gemini 3.5)"]
    end

    UI --> GHP
    UI -->|REST / CORS API Calls| API
    RAG -->|Live In-Memory Context| GEMINI
    API --> SEC
    SEC --> SVC
    SVC --> AUD
    SVC --> MDB
    AUD --> MDB
```

---

## ✨ Core Modules & Regulatory Capabilities

### 1. 📊 Executive Dashboard & Bureau Metrics
- Real-time aggregation of Council-wide security deposits (₹ Cr), active instruments, pending desk verifications, expiring instruments, and overdue notices.
- Banking sector exposure chart across authorized Scheduled Commercial Banks (SBI, PNB, Canara Bank, Bank of Baroda, HDFC, ICICI, Union Bank).
- Urgent Action Table flagging non-compliant institutions for immediate regulatory notice.

### 2. 🏛️ Approved Technical Institution Registry
- Comprehensive registry tracking AICTE Permanent IDs, head of institution contact credentials, regional offices (NWRO, SWRO, WRO, SRO, CRO, ERO), and approval lifecycle status.
- Duplicate detection preventing multiple submissions of the same institution or duplicate FDR serial numbers.

### 3. 📑 FDR & Bank Guarantee Lifecycle Management
- Full lifecycle tracking: `NEW_DEPOSIT` ➔ `ACTIVE` ➔ `EXPIRING_SOON` ➔ `OVERDUE` ➔ `RELEASE_PENDING` ➔ `RELEASED`.
- Automated maturity calculation, joint lien endorsement verification, and bank core-banking reference matching.

### 4. ⚡ Work Queues with Unified `"All"` Triage
- Interactive queue management system categorizing officer tasks into:
  - **All**: Unified high-priority triage view across all active queues.
  - **Pending Verification**: Unverified original physical instruments and bank memos.
  - **Discrepancies & Issues**: Instruments with missing AICTE joint lien endorsement or amount mismatch.
  - **Missing Documents**: Cases pending mandatory bank verification letters.
  - **Upcoming Expiries (30/60/90 Days)**: Advance statutory notices under Section 10(k).
  - **Overdue Renewals**: Matured instruments without renewal proof.
  - **Release Scrutiny & Approvals**: End-of-tenure refund claims under APH Clause 4.12.

### 5. 🤖 Gemini 3.5 RAG Regulatory Assistant
- Slide-in side drawer assistant powered by Google's latest **Gemini 3.5 Flash-Lite** model.
- Grounded with live bureau context: full institution records, FDR numbers, discrepancy findings, and AICTE APH regulations.
- Renders responses in rich markdown preview formatting (tables, bullet checklists, code blocks) with interactive deep-linking to referenced FDRs and release cases.

### 6. 🔒 Cryptographically Chained Audit Trail
- Every regulatory observation, verification change, status transition, and sanction order is hashed with SHA-256 and chained to previous records (`integrityHash` and `previousHash`) to guarantee tamper evidence.

### 7. 💰 3-Tier Release & Refund Clearance (APH Clause 4.12)
- Multi-step workflow for 8-year/10-year security deposit releases:
  1. **Desk Scrutiny**: Reviewer completes 5-point compliance checklist (NOCs, zero student dues, land title clearance).
  2. **Competent Authority Sanction**: Formal approval with Official Sanction Order execution by Advisor/Member Secretary.
  3. **Discharge & Postal Dispatch**: Dispatch of original FDR with Discharge Certificate via Speed Post.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, KaTeX |
| **Backend** | Java 25 LTS, Spring Boot 4.1.2, Spring Security 6, Maven Wrapper |
| **Database** | MongoDB Atlas (Cloud Replica Set), Spring Data MongoDB |
| **Artificial Intelligence** | Google Gemini API (`gemini-3.5-flash-lite`, `gemini-flash-latest`), Custom RAG Grounding Engine |
| **DevOps & CI/CD** | GitHub Actions, Multi-Stage Docker, Render Blueprint (`render.yaml`) |

---

## 💻 Quick Start & Local Setup

### Prerequisites
- **Node.js** >= 20.x and **npm** >= 10.x
- **Java Development Kit (JDK)** 21 or 25
- **MongoDB** running locally or a free **MongoDB Atlas** cluster URI

### 1. Clone Repository
```bash
git clone https://github.com/muthukumaranarc/AICTE-FDRMS.git
cd AICTE-FDRMS
```

### 2. Run Backend (Spring Boot)
```bash
cd Backend/AICTE-FDRMS

# Configure MongoDB connection (or set system environment variable)
export MONGODB_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/aicte_fdrms?retryWrites=true&w=majority"

# Start using Maven Wrapper (automatically downloads dependencies)
./mvnw spring-boot:run
```
*The backend API will start on `http://localhost:8080`.*

### 3. Run Frontend (React + Vite)
```bash
cd Frontend/AICTE-FDRMS

# Copy example environment file
cp .env.example .env

# Optionally add your Google Gemini API key to .env for the AI assistant:
# VITE_GEMINI_API_KEY=your_gemini_api_key_here

npm install
npm run dev
```
*The web portal will open at `http://localhost:5173`.*

---

## ☁️ Cloud Deployment Guide

### Option A: Frontend on GitHub Pages (Automated CI/CD)

The repository includes a ready-to-run GitHub Actions workflow (`.github/workflows/deploy-frontend.yml`).

1. Open your repository on GitHub: `https://github.com/muthukumaranarc/AICTE-FDRMS`
2. Navigate to **Settings** ➔ **Pages** (under Code and automation).
3. Under **Build and deployment** ➔ **Source**, select: **GitHub Actions**.
4. That's it! Every push to `main` will build and publish your frontend at:
   ```
   https://muthukumaranarc.github.io/AICTE-FDRMS/
   ```

> **Note:** The frontend includes an integrated fallback dataset, meaning the GitHub Pages deployment runs 100% interactively out of the box even before your backend is deployed!

---

### Option B: Backend on Render (Free Web Service)

The repository includes a pre-configured `render.yaml` blueprint and a multi-stage `Dockerfile`.

#### Method 1: Render Blueprint (Easiest — 1 Click)
1. Sign up or log into [Render.com](https://render.com/).
2. Click **New +** ➔ **Blueprint**.
3. Connect your GitHub repository `muthukumaranarc/AICTE-FDRMS`.
4. Render will read `render.yaml` automatically.
5. In the **Environment Variables** prompt, paste your `MONGODB_URL`:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/aicte_fdrms?retryWrites=true&w=majority
   ```
6. Click **Apply**. Render will build the Docker container and provide a live URL (e.g. `https://aicte-fdrms-backend.onrender.com`).

#### Method 2: Manual Web Service on Render
1. In Render, select **New +** ➔ **Web Service**.
2. Select **Build and deploy from a Git repository**.
3. Choose `muthukumaranarc/AICTE-FDRMS`.
4. Configure:
   - **Language / Runtime:** `Docker`
   - **Dockerfile Path:** `./Backend/AICTE-FDRMS/Dockerfile`
   - **Docker Context:** `./Backend/AICTE-FDRMS`
   - **Instance Type:** `Free`
5. Add Environment Variable:
   - `MONGODB_URL`: *your MongoDB Atlas connection string*
   - `CORS_ALLOWED_ORIGINS`: `https://muthukumaranarc.github.io,https://muthukumaranarc.github.io/AICTE-FDRMS`
6. Click **Create Web Service**.

---

## 🔑 Environment Variables

| Variable | Scope | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend | Port for Spring Boot web server | `8080` (Render dynamically injects `10000`) |
| `MONGODB_URL` | Backend | Full MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/aicte_fdrms` |
| `CORS_ALLOWED_ORIGINS` | Backend | Comma-separated list of allowed origins | `https://muthukumaranarc.github.io` |
| `VITE_API_BASE_URL` | Frontend | Target backend API URL | `/api` (local proxy) or `https://aicte-fdrms-backend.onrender.com/api` |
| `VITE_GEMINI_API_KEY` | Frontend | Google Gemini API key for Regulatory AI | Configured in `.env` or interactively in chat drawer |

---

## 👥 Simulated Officer Roles (For Evaluation)

The portal includes an interactive **Role-Based Access Control (RBAC) Switcher** in the top navigation header to test various regulatory workflows:

| Officer Name | Bureau / Designation | Simulated Role | Authorized Actions |
| :--- | :--- | :--- | :--- |
| **Smt. Ananya Sen** | Regulation Bureau, FDR Cell (Deputy Director) | `ROLE_REVIEWER` | Desk scrutiny, discrepancy flagging, bank verification memos, release compliance checklists |
| **Dr. Rajesh Sharma** | Regulation Bureau (Advisor & Director) | `ROLE_APPROVER` | Competent authority sanction orders, approval of 8-year FDR releases |
| **Shri Vikram Patel** | Administration & IT Bureau (Senior Admin Officer) | `ROLE_ADMIN` | Master bank configuration, user access management, postal dispatch recording, system data resets |

---

## ⚠️ Regulatory Prototype Notice

> **Disclaimer:** This software is a functional prototype simulation developed for technical demonstration, architecture evaluation, and regulatory digitization research. All institutional and financial data included in the test environment are structured simulations created for platform demonstration purposes.

---

## 📬 Contact & Inquiries

For technical inquiries, system architecture questions, or regulatory feedback:
* **Developer:** Muthukumaran ARC
* **Email:** [m.muthukumaranarc@gmail.com](mailto:m.muthukumaranarc@gmail.com)
* **GitHub:** [@muthukumaranarc](https://github.com/muthukumaranarc)
