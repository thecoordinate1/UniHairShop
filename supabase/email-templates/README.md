# UniHair Shop — Supabase Auth & Email Template Setup

This directory contains the custom-styled HTML email templates for **UniHair Shop** matching the Apple-inspired dark obsidian & gold aesthetic (`#0A0A0C`, `#121217`, `#F5A623`, `#FBBF24`).

---

## 1. Supabase Callback & URL Configuration

In your **[Supabase Project Dashboard](https://supabase.com/dashboard)**:

1. Navigate to **Authentication** (left sidebar) &rarr; **URL Configuration**.
2. Set **Site URL** to:
   ```text
   https://www.unihair.shop
   ```
3. Under **Redirect URLs**, click **Add URL** and add each of the following lines:
   ```text
   https://www.unihair.shop/**
   https://www.unihair.shop
   https://unihair.shop/**
   https://unihair.shop
   http://localhost:5173/**
   https://*.vercel.app/**
   ```
4. Click **Save Changes**.

---

## 2. Setting Up the Email Templates

In your **Supabase Project Dashboard**:

1. Navigate to **Authentication** &rarr; **Email Templates**.
2. Configure the following templates:

### A. Confirm signup (Email Verification)
- **Subject**: `✨ Confirm your UniHair Shop account • Welcome to campus glam!`
- **Body**: Copy the entire contents of [`confirm-signup.html`](./confirm-signup.html) and paste into the Message Body field.
- Click **Save**.

### B. Reset password
- **Subject**: `🔒 Reset your UniHair Shop password`
- **Body**: Copy the entire contents of [`reset-password.html`](./reset-password.html) and paste into the Message Body field.
- Click **Save**.

### C. Magic Link
- **Subject**: `✨ Your UniHair Shop login link`
- **Body**: Copy the entire contents of [`magic-link.html`](./magic-link.html) and paste into the Message Body field.
- Click **Save**.

---

## 3. Verify Email Provider Settings

1. In **Authentication** &rarr; **Providers** &rarr; **Email**:
   - Ensure **Enable Email provider** is **ON**.
   - Ensure **Confirm email** is **ON** (if you want verification before login).
   - Set **OTP Expiry** as desired (default: 86400 seconds / 24 hours).
