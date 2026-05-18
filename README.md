
# 🎓 College Review & Discovery Platform

A full-stack web application that empowers students to make informed college decisions through verified peer reviews, advanced filtering, and a community-driven forum. Built with modern web technologies and secured with A-Grade database policies.

## 📖 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [🔐 Authentication & User Management](#3--authentication--user-management)
4. [Tech Stack](#4-tech-stack)
5. [📦 Prerequisites (What You Need & Why)](#5--prerequisites-what-you-need--why)
6. [🛠️ Step-by-Step Setup Guide](#6-️-step-by-step-setup-guide)
   - [6.1 📥 Download the Project](#61--download-the-project)
   - [6.2 ☁️ Create Your Supabase Backend](#62-️-create-your-supabase-backend)
   - [6.3 🔑 Connect the App to Supabase (`.env` Setup)](#63--connect-the-app-to-supabase-env-setup)
   - [6.4 🗄️ Set Up the Database (Schema & Sample Data)](#64-️-set-up-the-database-schema--sample-data)
   - [6.5 🚀 Install Dependencies & Run the App](#65--install-dependencies--run-the-app)
   - [6.6 🛠️ Troubleshooting Setup](#66-️-troubleshooting-setup)
7. [✅ First-Time Setup Checklist](#7--first-time-setup-checklist)
8. [Google OAuth Setup (Optional but Recommended)](#8-google-oauth-setup-optional-but-recommended)
9. [Email Template Setup (Critical for User Verification)](#9-email-template-setup-critical-for-user-verification)
10. [Making a User Admin (Via Table Editor)](#10-making-a-user-admin-via-table-editor)
11. [Troubleshooting Common Issues](#11-troubleshooting-common-issues)
12. [🚀 Deploy to Production (Vercel)](#12--deploy-to-production-vercel)
13. [Next Steps After Setup](#13-next-steps-after-setup)

---

### 1. Project Overview

**CollegeView** is a comprehensive full-stack web application designed to empower students, alumni, and educators to navigate the complex world of higher education. By addressing the critical problems of information asymmetry, fragmented college data, and a lack of verified reviews, the platform serves as a trusted hub for college discovery and peer-to-peer insights.

- **For Students:** Discover top colleges, compare institutions side-by-side, read authentic alumni reviews, and ask questions in an active community forum to make confident, data-driven academic choices.
- **For Admins:** Manage the platform ecosystem through a powerful dashboard to ensure data accuracy, verify alumni credentials, and moderate forum discussions.

The platform emphasizes security, high-performance UI, and reliable information, ensuring that every user has a seamless and trustworthy experience.

### 2. Key Features

**🔍 Advanced Discovery & Comparison**
 **Smart Search & Filtering:** Filter colleges by location, NIRF ranking, NAAC grade, tuition fees, college type (Private/Public), and accepted entrance exams.
 **Side-by-Side Comparison:** Compare multiple colleges simultaneously across key metrics to evaluate the best fit.
 <img width="1490" height="975" alt="image" src="https://github.com/user-attachments/assets/ab541920-de8b-4a4a-abe4-debbca03c6bc" />

<img width="1919" height="958" alt="image" src="https://github.com/user-attachments/assets/c440bb6c-7a36-45f5-a57b-6d4d2d828e42" />

<img width="1484" height="921" alt="image" src="https://github.com/user-attachments/assets/30632339-6042-4609-8c03-8c9bd2669b2f" />



**⭐ Authentic Review System**
- **7-Parameter Star Ratings:** Detailed granular ratings including academics, infrastructure, faculty, placements, and campus life.
- **Pros, Cons & Tags:** Read bite-sized, structured insights from verified students and alumni.
- **Alumni Verification:** Trust badges for reviews left by verified alumni.

  <img width="893" height="769" alt="image" src="https://github.com/user-attachments/assets/fd4ec634-da8c-4042-9841-640cfded4463" />



**🗣️ Interactive Community Forum**
- **Threaded Discussions:** Engage in dedicated topics, ask questions, and get answers from peers and seniors.
- **Upvotes & Moderation:** Helpful replies bubble to the top, while admins ensure community guidelines are followed.

  <img width="1504" height="904" alt="image" src="https://github.com/user-attachments/assets/b43834ea-4016-469b-97e2-4a2394b36a29" />


- **Role-Based Access Control:** Distinct roles for Students and Admins with tailored permissions.
- **Profile Management:** Users can manage their details, generate unique avatars, and securely update their credentials (e.g., OTP-based secure email changes).

<img width="747" height="771" alt="image" src="https://github.com/user-attachments/assets/d90793c8-ba59-4648-9ad5-744b76ec721e" />





### 3. 🔐 Authentication & User Management

The platform uses **Supabase Auth** to provide secure, password-based authentication with email verification. This ensures that only verified users can post reviews, save colleges, and participate in forum discussions.

#### A. User Registration (Sign Up)
New users can create an account to access personalized features like saving colleges and writing reviews.

1.  Click **"Sign Up"** in the top navigation bar.
2.  Enter your **Email Address** and create a strong **Password**.
3.  Click **"Create Account"**.

<img width="350" height="400" alt="image" src="https://github.com/user-attachments/assets/e82d3e42-7d2f-4e03-a7b7-efec51ac6a0f" />


4.  **Verify Email:** Check your inbox for a confirmation link from Supabase. You **must** click this link to activate your account.
    > ⚠️ **Note:** If you don't see the email, check your **Spam/Junk** folder. Ensure your Supabase project has **"Enable Email Confirmations"** turned on in the Auth settings.

#### B. User Login (Sign In)
Returning users can log in to access their profile, saved data, and review history.

1.  Click **"Sign In"** in the top navigation bar.
2.  Enter your registered **Email** and **Password**.
3.  Click **"Log In"**.

<img width="350" height="400" alt="image" src="https://github.com/user-attachments/assets/01b33db6-69a0-4a5d-abec-46dbc6dd9ed3" />


#### C. Forgot Password
If a user forgets their password, they can reset it securely via email.

1.  On the **Sign In** page, click **"Forgot Password?"**.
2.  Enter the **Email Address** associated with your account.
3.  Click **"Send Reset Link"**.

<img width="350" height="400" alt="image" src="https://github.com/user-attachments/assets/e15cf5ef-add4-4b17-82ab-e696a4021d65" />


4.  Check your email for a password reset link.
5.  Click the link and enter a **New Password**.

<img width="350" height="400" alt="image" src="https://github.com/user-attachments/assets/d17d82ba-97d2-4c8f-a00c-3d82ddd6305e" />


6.  Log in with your new credentials.

Here is the continuation for section **D**, structured to match the previous format with clear steps and placeholders for your screenshots.

### D. Request Email Change
If a user needs to update their registered email address, they can do so securely through a two-step verification process to ensure account safety.

1.  Navigate to **Profile Settings**
2.  Click on **"Change Email"**.
3.  Enter your **New Email Address**.
4.  Click **"Send Verification Code"**.

<img width="350" height="400" alt="image" src="https://github.com/user-attachments/assets/a218edab-1ab0-4f77-b590-7c4358aeb9c6" />



5.  Check your **old email inbox** for the One-Time Password (OTP).
6.  Enter the OTP in the provided field and click **"Verify Old Email"**.

<img width="350" height="400" alt="image" src="https://github.com/user-attachments/assets/05ff3caa-4113-48ee-9603-c7ecbe3841c1" />



7.  Once verified, the system will automatically send a second OTP to your **new email address**.
8.  Check your **new email inbox** for the OTP.
9.  Enter the new OTP and click **"Confirm Email Change"**.

<img width="350" height="400" alt="image" src="https://github.com/user-attachments/assets/375ad136-3093-4900-8d19-b9e9f5b6f4a5" />



10. Your email address is now updated. You will be logged out and must log in again using your **new email address**.

> ⚠️ **Note:** For security reasons, if you do not receive the OTP within 5 minutes, please check your Spam/Junk folder or click **"Resend OTP"**. Ensure you have access to both email accounts before starting this process.

**⚙️ Administrative Power**
- **Admin Dashboard:** Comprehensive tools to manage colleges, update courses, moderate reviews, and oversee user management.

<img width="1919" height="790" alt="image" src="https://github.com/user-attachments/assets/2bb53b6f-95d0-4869-923e-65a5829156cb" />
<img width="1885" height="682" alt="image" src="https://github.com/user-attachments/assets/4bfde68b-b43d-45e3-91dd-058fa6990bf7" />
<img width="1909" height="829" alt="image" src="https://github.com/user-attachments/assets/779c674e-7fb1-47a8-b7f2-dc06a1ae5dc5" />
<img width="1909" height="813" alt="image" src="https://github.com/user-attachments/assets/f3eb7560-b09d-4088-a53e-0b9d0055232a" />
<img width="1915" height="786" alt="image" src="https://github.com/user-attachments/assets/cb1766ae-0b4a-49e8-9e6e-2e17f6a07330" />
<img width="1916" height="816" alt="image" src="https://github.com/user-attachments/assets/41ec4ff1-ecb5-49ef-bcc3-c0d81ba654e0" />




- **Real-Time Data Handling:** Instant updates and state synchronization across the platform.

**🛡️ Security & Performance**
- **Row-Level Security (RLS):** A-grade database security policies ensuring data isolation and privacy using Supabase.
- **Responsive & Modern UI:** Built with Native CSS, class-variance-authority, and Radix UI for a fast, accessible, and stunning user experience on all devices.


### 4. Tech Stack
This project is built with modern, scalable technologies:

- **Frontend:** React 18+ with Vite for fast development and optimized builds. Uses functional components, hooks, and CSS Variables for theming.
- **Backend/Database:** Supabase (PostgreSQL) for authentication, real-time subscriptions, and robust relational data with Row-Level Security (RLS).
- **Package Manager:** `npm` for dependency management and script execution.
- **Security:** JWT-based authentication via Supabase Auth, with PostgreSQL RLS policies for granular data access control.
- **Hosting/Dev:** Optimized for Vercel deployment with local Vite dev server for development.

---

### 5. 📦 Prerequisites (What You Need & Why)

Before you begin, make sure you have these tools installed. Don’t worry if you’re new to them; each link includes a simple installer.

| Tool | Minimum Version | Why You Need It | Install Link |
|------|----------------|-----------------|--------------|
| **Node.js** | v18+ | Runs JavaScript outside the browser (required for Vite & npm) | [nodejs.org](https://nodejs.org) |
| **npm** | v9+ (comes with Node) | Installs project dependencies (like React & Supabase client) | Comes with Node.js |
| **Git** | Latest | Downloads & tracks project code | [git-scm.com](https://git-scm.com) |
| **Code Editor** | Any (VS Code recommended) | Where you’ll view & edit code | [code.visualstudio.com](https://code.visualstudio.com) |
| **Supabase Account** | Free tier | Provides your database, authentication, & backend APIs | [supabase.com](https://supabase.com) |

**✅ Verify Your Installations:**
Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux) and run:
```bash
node -v   # Should show v18.x or higher
npm -v    # Should show v9.x or higher
git --version  # Should show git version 2.x or higher
```
If any command says `not found`, reinstall that tool and restart your terminal.

---

### 6. 🛠️ Step-by-Step Setup Guide

Follow these steps in order. Each step builds on the previous one.

#### 6.1 📥 Download the Project
**Option A: Using Git (Recommended)**
```bash
git clone https://github.com/parmarpranav41/collegedu.git
cd collegedu
```

**Option B: Direct ZIP Download**
1. Go to the GitHub repository.
2. Click the green `Code` button → `Download ZIP`.
3. Extract the ZIP file.
   > 💡 **Note:** You’ll see a folder inside another folder with the same name. Open the **inner folder** in your code editor.
4. Open that folder in VS Code (or your preferred editor).

---


#### 6.2 ☁️ Create Your Supabase Backend
Supabase will act as your database, authentication, and API layer.

1. **Sign Up/Log In**: Go to [supabase.com](https://supabase.com) and create a free account or log in.
2. **Create New Project**:
   - Click **New Project**.
   - **Name:** `college-review-platform` (or any name you prefer).
   - **Database Password:** Create a strong password and **save it securely** (you won’t see it again).
   - **Region:** Choose the region closest to you for better performance.
   - Click **Create new project**.
3. **Wait for Provisioning**: This takes ~2 minutes. You’ll see a green `Healthy` status when ready.
4. **Get Your API Keys**:
   - In your project dashboard, click the **Connect** button (green button at the top center).
     
     <img width="600" height="94" alt="image" src="https://github.com/user-attachments/assets/1b1a591f-27b2-4415-addc-9582f0d56746" />


   - Select **Framework** → **React (Variant: Vite)**.
     
    <img width="580" height="418" alt="image" src="https://github.com/user-attachments/assets/e24b34e0-04f3-4365-a1dc-3075ffb2591e" />

   - Scroll down to the **Environment Variables** section.

   - Copy the two values provided:
     
     <img width="400" height="300" alt="image" src="https://github.com/user-attachments/assets/af5f3fc3-95f4-4c4d-9507-e8b0e2491bf1" />



     - `VITE_SUPABASE_URL` (looks like `https://xxxxx.supabase.co`)
     - `VITE_SUPABASE_ANON_KEY` (starts with `eyJ...` or `sb_publishable_...`)

> 💡 **Tip:** Keep these values handy. You will paste them into your project in the next step.

---

#### 6.3 🔑 Connect the App to Supabase (`.env` Setup)
Your app needs to know where your Supabase project lives. We store these secrets in a `.env` file so they aren’t hardcoded in your source code.

1. **Create the File**:
   - Navigate to your project’s **root folder** (the same folder that contains `package.json`).
   - Create a new file named exactly: `.env`


    <img width="398" height="129" alt="image" src="https://github.com/user-attachments/assets/adabfb11-9294-4388-9af5-00bdc0306638" />


   ⚠️ **Important:** The dot (`.`) at the start is crucial. On Windows, you may need to enable "Show file extensions" in Folder Options to ensure it isn’t saved as `.env.txt`.

1. **Add Your Credentials**:
   Paste the following content into the `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
    <img width="388" height="221" alt="image" src="https://github.com/user-attachments/assets/5f648754-2853-418c-904e-05e1116992b1" />



2. **Replace Placeholders**:
   - Replace `https://your-project-id.supabase.co` with the **Project URL** you copied in Step 5.2.
   - Replace `your_anon_key_here` with the **Anon Key** you copied in Step 5.2.
  
3. **WorldVectorLogo API Key (For Recruiter Logos)**:
   
      *This step is optional but recommended if you want automatic recruiter logo fetching.*

4.  **Create an Account**: Go to [worldvectorlogo.com](https://worldvectorlogo.com) and sign up for a free account.
5.  **Navigate to Settings**:
    *   Click on your **Profile Icon** or **Account Name** in the top right corner.
    *   Select **Settings** then click **Manage API Keys** on top.
6.  **Generate API Key**:
    *   Look for the section labeled  **"Create Key"**.


       <img width="500" height="300" alt="image" src="https://github.com/user-attachments/assets/29a6b2d3-0e6e-4c80-b032-7b69e8108f1b" />


    *   Click **Generate** to create a new API key.
7.  **Copy the Key**:
    *   Copy the generated key string.
    *   Add it to your `.env` file:
        ```env
        VITE_WORLDVECTORLOGO_API_KEY=your_api_key_here
        ```
         <img width="326" height="127" alt="image" src="https://github.com/user-attachments/assets/b0493738-4f50-40a4-bf9e-2d1c91441d43" />
   



    > ⚠️ **Note:** If you skip this step, the application will use default placeholder images for college logos.

8. **Save the File**.

> 🔒 **Security Note:**
> - This file is included in your `.gitignore`, so it will **not** be uploaded to GitHub.
> - Never share your Anon Key publicly or commit it to version control.
> - If you accidentally expose your key, you can rotate it in the Supabase Dashboard under **Settings → API**.

#### 6.4 🗄️ Set Up the Database (Schema & Sample Data)
This step creates your tables, security rules, and fills the database with realistic test data.

**📂 Where are the files?**  
All SQL files are inside the `supabase-database/` folder in your project.

**⚠️ Important:** Run these files **in exact order**. Skipping or reordering will cause errors. Also I have also added seeding function query at the bottom of the each file. so ensure it is commented or remover while running the function as they are for documentation purpose only.

 <img width="749" height="202" alt="image" src="https://github.com/user-attachments/assets/3348e1fa-06ee-4009-9aca-c34ef2a65345" />


Also add these in your .gitignore when deploying 

  <img width="314" height="147" alt="image" src="https://github.com/user-attachments/assets/0efab69e-3efc-4fb8-988b-e8f4186bba2e" />

---
##### 🔹 Phase 1: Create Database Structure (Required)
1. **`schema.sql`**
   - **What it does:** Creates all tables (`colleges`, `profiles`, `reviews`, etc.), security policies, and automatic triggers.
   - **How to run:** Open file → Copy everything → Paste into Supabase **SQL Editor** → Click **Run**.
   - **✅ Verify:** Go to **Table Editor** in Supabase. You should see tables like `colleges`, `profiles`, `courses`.

---
##### 🔹 Phase 2: Add Sample Data (Optional but Highly Recommended)
*Seed data = fake but realistic data so you can test the app immediately.*

Some files just insert data. Others create a function first, then you run a command to execute it. Follow each step carefully.

2. **`seed_colleges.sql`** → Paste & Run. *(Adds 100+ Indian colleges)*
3. **`seed_college_courses.sql`** → Paste & Run. *(Links courses to colleges)*

4. **`seed_profiles.sql`**
   - Paste & Run *(creates the function)*
   - Then run: `SELECT * FROM seed_profiles(1000);` *(creates 1,000 test users)*

5. **`seed_saved_colleges_per_user.sql`**
   - Paste & Run
   - Then run: `SELECT * FROM seed_saved_colleges_per_user(7, 15);`

6. **`seed_reviews_per_college.sql`**
   - Paste & Run
   - Then run: `SELECT * FROM seed_reviews_per_college(10, 20);`

7. **`seed_review_votes.sql`**
   - Paste & Run
   - Then run: `SELECT * FROM seed_review_votes(5, 15);`

8. **`seed_forum_threads_per_college.sql`**
   - Paste & Run
   - Then run: `SELECT * FROM seed_forum_threads_per_college(7, 9);`

9. **`seed_forum_replies_per_thread.sql`**
   - Paste & Run
   - Then run: `SELECT * FROM seed_forum_replies_per_thread(7, 8);`

> ⏳ **Tip:** Each script may take 10–30 seconds. Wait for the green `Success` message before moving to the next one.

---

#### 6.5 🚀 Install Dependencies & Run the App
Now that your database and secrets are ready, let’s start the app.

```bash
# Make sure you're in the project folder
cd collegedu

# Install all required packages (runs once)
npm install

# Start the local development server
npm run dev
```

**✅ Expected Terminal Output:**
```
  VITE v5.x.x  ready in 320 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

Open `http://localhost:5173` in your browser. You should see the homepage!

---

#### 6.6 🛠️ Troubleshooting Setup

| Problem | Likely Cause | Fix |
|--------|--------------|-----|
| `command not found: node/npm/git` | Tool not installed or terminal not restarted | Reinstall, close & reopen terminal, verify with `-v` |
| `Supabase returned undefined data` | SQL scripts not run in order, or `.env` keys wrong | Re-run `schema.sql` first, double-check `.env` values |
| `Function already exists` error | Re-running a seed file | Ignore the error, just run the `SELECT * FROM ...` command again |
| `Relation does not exist` | Skipped `schema.sql` or `seed_colleges.sql` | Run Phase 1 & Step 2 first, then continue |
| App shows blank page or login errors | Missing/incorrect `.env` file | Ensure file is named `.env` (not `.env.txt`), keys match exactly, no extra spaces |
| `npm install` fails | Corrupted cache or network issue | Run `npm cache clean --force`, then `npm install` again |

---

### 7. ✅ First-Time Setup Checklist
- [ ] Node.js, npm, Git installed & verified
- [ ] Project downloaded & opened in code editor
- [ ] Supabase project created & API keys copied
- [ ] `schema.sql` run successfully in SQL Editor
- [ ] Seed scripts run in order (wait for each `Success`)
- [ ] `.env` file created with correct URL & anon key
- [ ] `npm install` & `npm run dev` completed without errors
- [ ] App opens at `http://localhost:5173`
- [ ] Signed up a test account & verified email
- [ ] Promoted your account to Admin (see Admin Setup guide)

---

### 8. Google OAuth Setup (Optional but Recommended)
Enable "Sign in with Google" for easier user registration:
#### Youtube Tutorial
https://youtu.be/sB6bPOvvlgw?si=T1cW7IcfdCSzoKIu

#### 8.1 Google Cloud Console Setup
1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Create New Project**:
   - Click project dropdown → `New Project`
   - Name: `college-review-platform`
   - Click `Create`
3. **Configure OAuth Consent Screen**:
   - Go to **APIs & Services** → **OAuth consent screen**
   - Choose `External` → `Create`
   - **App name**: "College Review Platform"
   - **User support email**: Your email
   - **Developer contact information**: Your email
   - Click `Save and Continue` (skip scopes for now)
   - Add test users (your Google email) → `Save and Continue` → `Back to Dashboard`
4. **Create OAuth Client ID**:
   - Go to **APIs & Services** → **Credentials**
   - Click `+ CREATE CREDENTIALS` → `OAuth client ID`
   - **Application type**: `Web application`
   - **Name**: "College Review Web Client"
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173          # Local development
     https://your-vercel-app.vercel.app  # Production (add later)
     ```
   - **Authorized redirect URIs**:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
     *(Find this in Supabase: Authentication → URL Configuration → Redirect URLs)*
   - Click `Create`
5. **Copy Credentials**:
   - Note your **Client ID** (looks like `123456789-abc.apps.googleusercontent.com`)
   - Note your **Client Secret** (click to reveal)

#### 8.2 Configure Supabase for Google OAuth
1. **Go to Supabase Dashboard** → **Authentication** → **Providers**
2. **Enable Google**:
   - Toggle `Google` to `ON`
   - Paste your **Client ID** and **Client Secret** from Google Cloud
   - **Redirect URL**: Should auto-fill with your Supabase project URL
3. **Test**: Try "Sign in with Google" on your local app

---

### 9. Email Template Setup (Critical for User Verification)
Customize the emails Supabase sends to users:

#### 9.1 Copy Email Templates
1. **In Supabase Dashboard**: Go to **Authentication** → **Email** → **Templates**
   
 <img width="700" height="500" alt="image" src="https://github.com/user-attachments/assets/fbcaa6b9-5189-472d-a0c7-5b201a5d8ecf" />

   
3. **For Each Template** (`Confirm sign up`, `Change email address`,  `Reset password`):
   - Click the template name
   - Replace the default HTML with templates in supabase-templates folder :
4. **Save Each Template**: Click `Save` after pasting HTML
  <img width="380" height="430" alt="image" src="https://github.com/user-attachments/assets/a46f95c1-f5f5-4c08-9bd4-2a7121d8382a" />
<img width="380" height="430" alt="image" src="https://github.com/user-attachments/assets/12b0ad1f-37e0-4791-8c5f-3ac2876a7942" />
<img width="380" height="430" alt="image" src="https://github.com/user-attachments/assets/f548f494-054b-48ed-b273-58b867e9997b" />

5. **Test Emails**: Register a new user to verify templates work

#### 9.2 Configure Email Settings in Supabase
1. **Go to Authentication** → **URL Configuration**
2. **Set Redirect URLs**:
   ```
   http://localhost:5173/auth/callback          # Local development
   https://your-vercel-app.vercel.app/auth/callback  # Production
   ```
3. **Enable Email Confirmations**: Toggle `Enable email confirmations` to `ON`


#### 9.3 Configure OTP length in Email for Verification
1. In Supabase Dashboard, **Go to Authentication** → **Configurations** → **Sign In / Providers** → Scroll Down to **Auth Provider** → **Dropdown Email** →  Scroll down to **Email OTP length**
2. Set "Number of digits in email OTP" to your desired length 
3. Save changes
4. Then go to [Validation.ts](src/lib/auth/components/Validation.ts) change `EMAIL_OTP_LENGTH` to your desired length to match the Supabase configuration.
   ```typescript
   export const EMAIL_OTP_LENGTH = 4; // Change this to match your Supabase configuration
   ```
---

### 10. Making a User Admin (Via Table Editor)
Promote your first user to admin for accessing the admin dashboard:

#### 10.1 Find Your User ID
1. **In Supabase Dashboard**: Go to **Authentication** → **Users**
2. **Find Your Account**: Locate the email you used to register
3. **Copy User ID**: Click the user → copy the `ID` (UUID format: `a1b2c3d4-...`)

#### 10.2 Update Profile in Table Editor
1. **Go to Table Editor** → `profiles` table
2. **Find Your Profile**:
   - Click `Filter` → `id` → `equals` → paste your User ID
   - Or search by `email` or `username`
3. **Edit the Row**:
   - Click the pencil/edit icon for your profile row
   - Find the `is_admin` column
   - Change value from `false` to `true`
   - Click `Save` (✓ checkmark)
   <img width="1355" height="499" alt="image" src="https://github.com/user-attachments/assets/e9d48ff6-d842-45a2-bf31-c3769312d31d" />

   
4. **Verify**:
   - Refresh your local app (`http://localhost:5173`)
   - Log in with your admin account
   - You should now see the **Admin Dashboard** option in navigation

#### 10.3 Alternative: SQL Method
If you prefer SQL, run this in Supabase SQL Editor:
```sql
-- Replace 'YOUR_USER_UUID_HERE' with your actual user ID
UPDATE public.profiles
SET is_admin = true,
    updated_at = NOW()
WHERE id = 'YOUR_USER_UUID_HERE';
```

---

### 11. Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| `npm install` fails | Clear cache: `npm cache clean --force` → retry |
| Supabase connection error | Verify `.env.local` values match exactly (no extra spaces) |
| Email not received | Check spam folder; verify Supabase email settings; test with Gmail |
| "User not found" on login | Ensure email is confirmed; check Authentication → Users in Supabase |
| Admin dashboard not visible | Verify `is_admin = true` in `profiles` table; refresh page |
| SQL script errors | Run scripts one at a time; check for existing types/tables |
| Google OAuth not working | Verify redirect URIs match exactly in Google Cloud and Supabase |

---

Here is the structured **Section 12** for your `README.md`, detailing the deployment process on Vercel with a specific focus on environment variables.

---

### 12. 🚀 Deploy to Production (Vercel)

Once your local development is complete, you can deploy your application to the web for free using **Vercel**. This makes your platform accessible to anyone via a public URL.

#### 12.1 Prerequisites
1.  **GitHub Account:** Your code must be pushed to a GitHub repository.
2.  **Vercel Account:** Sign up at [vercel.com](https://vercel.com) using your GitHub account.

#### 12.2 Step-by-Step Deployment

**Step 1: Push Code to GitHub**
Ensure your latest code is pushed to your repository.
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```
> ⚠️ **Important:** Verify that `.env` and `node_modules/` are listed in your `.gitignore` file. **Never** push your secret keys or environment files to GitHub.

**Step 2: Connect to Vercel**
1.  Log in to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** → **"Project"**.
3.  Under **"Import Git Repository"**, find your `collegedu` repository and click **"Import"**.

**Step 3: Configure Environment Variables (Critical)**
Vercel needs to know how to connect to your Supabase backend. Since `.env` files are not uploaded to GitHub, you must manually add these secrets in Vercel.

1.  In the **"Configure Project"** screen, scroll down to the **"Environment Variables"** section.
  <img width="530" height="630" alt="image" src="https://github.com/user-attachments/assets/369f1b30-2d6f-491c-9270-2a6160dca52e" />


   *   Best Option is to use the Import .env feature ,it will automatically set them,and if you cant you can go with this next step.
   
3.  Add the following keys exactly as they appear in your local `.env` file:

    | Key | Value | Source |
    | :--- | :--- | :--- |
    | `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |  From your .env file |
    | `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |  From your .env file |
    | `VITE_WVL_API_KEY`  | `83t5Ryfk...`  |  From your .env file |
    
   <img width="530" height="630" alt="image" src="https://github.com/user-attachments/assets/2529c913-6ca9-4959-b599-6ac57ba6c82f" />



5.  Click **"Add"** for each variable.

**Step 4: Deploy**
1.  Click **"Deploy"**.
2.  Vercel will automatically:
    *   Install dependencies (`npm install`)
    *   Build the project (`npm run build`)
    *   Launch the application
3.  Wait ~1 minute for the build to complete.

**Step 5: Live! 🎉**
Once the status turns to **"Ready"**, click the **"Visit"** button. You will see your live application at a URL like `https://collegeview.vercel.app`.

---

#### 12.3 Updating Your Live Site
Vercel enables **Continuous Deployment**. Any time you push changes to your `main` branch on GitHub:
1.  Vercel automatically detects the new commit.
2.  It rebuilds and redeploys your site.
3.  Your live URL is updated within minutes. No manual intervention required!

---

#### 12.4 Troubleshooting Deployment Issues

| Issue | Likely Cause | Solution |
| :--- | :--- | :--- |
| **Build Failed** | Missing dependencies or syntax errors. | Check the "Deployment Logs" in Vercel. Fix the error locally and push again. |
| **Blank Page / White Screen** | Missing Environment Variables. | Go to Vercel Project Settings → Environment Variables. Ensure `VITE_SUPABASE_URL` and `ANON_KEY` are set correctly. |
| **Supabase Connection Error** | Incorrect URL or Key. | Double-check that there are no extra spaces or quotes in the Vercel environment variable values. |
| **404 on Refresh** | SPA Routing issue. | Vercel handles this by default for Vite/React. If it persists, create a `vercel.json` file with `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`. |

---

### 13. Next Steps After Setup
1. **Explore the App**: Browse colleges, write reviews, use the forum
2. **Admin Tasks**: Manage colleges, moderate reviews, verify users
3. **Customize**: Modify CSS variables in `:root` for theming

---

**🎉 Congratulations!** Your College Review Platform is now set up.

**Need Help?** 
- 🐛 Bugs: Open a GitHub Issue
- 💡 Ideas: Start a Discussion on GitHub
