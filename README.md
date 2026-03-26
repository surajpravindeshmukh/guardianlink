# GuardianLink - Emergency Contacts Manager with Supabase

A modern, mobile-responsive web application with Supabase backend for managing emergency and essential service contacts.

## Features

- 🗄️ **Supabase Database** - PostgreSQL backend with real-time capabilities
- 📱 **Mobile-First Design** - Fully responsive on all devices
- 🔐 **Secure Admin Authentication** - Email/password login
- 📂 **Dynamic Categories** - Categories loaded from database
- 🔍 **Search Functionality** - Search by name, phone, or address
- ✨ **Smooth Animations** - Modern UI with delightful animations

## Prerequisites

1. **Supabase Account** - [Sign up for free](https://supabase.com)
2. **Node.js** (optional, for local development)

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details
4. Wait for your database to be ready

### 2. Set Up Database Schema

1. In your Supabase project, go to the SQL Editor
2. Copy and paste the SQL schema from above
3. Run the SQL to create tables and insert default data

### 3. Configure Project

1. In your Supabase project, go to Project Settings → API
2. Copy your **Project URL** and **anon/public key**
3. Open `js/config.js`
4. Replace the placeholders:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
