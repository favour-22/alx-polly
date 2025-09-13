"""
README for ALX Polly: Secure Polling Application

This README serves as both a technical and security-focused guide for the ALX Polly project. It explains not just what the application does, but why robust security practices are essential for any user-driven web platform. ALX Polly demonstrates how to build a modern polling app with Next.js and Supabase, while also highlighting the importance of server-side validation, secure authentication, and proper session management. This documentation will help developers understand the architecture, setup, and secure operation of the app, and provides clear steps for running and testing the application locally.
"""

# ALX Polly - Secure Polling Application

## Project Overview

ALX Polly is a full-stack web application that allows users to register, create polls, and share them for voting. The app is built with:
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Backend & Auth:** Supabase
- **Styling:** Tailwind CSS with shadcn/ui components

The project is designed to demonstrate secure, modern web development practices, with a focus on protecting user data and business logic from common vulnerabilities.

## Why This README Is Needed

This README is essential for:
- **Developers:** To understand the secure architecture and how to extend or maintain the app.
- **Auditors:** To review the security posture and see how vulnerabilities were identified and remediated.
- **Contributors:** To quickly get started with setup, configuration, and testing.

## How the Application Works

- **User Registration & Login:** Users can sign up and log in securely. All validation is performed on the server to prevent bypasses.
- **Poll Creation:** Authenticated users can create polls with multiple options.
- **Voting:** Users can vote on polls. Votes are securely recorded and results are updated in real time.
- **Dashboard:** Each user has a dashboard to manage their polls and view results.

## Setup Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd alx-polly
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Supabase Configuration
- Create a [Supabase](https://supabase.io/) project.
- In the Supabase dashboard, enable **Email Auth** (and disable email confirmation for local testing, or set up SMTP for production).
- Copy your Supabase **Project URL** and **anon public key** from the API settings.

### 4. Environment Variables
Create a `.env.local` file in the project root:
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### 5. Run the Application Locally
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Examples

### Registering and Logging In
- Go to `/register` to create a new account.
- After registering, log in at `/login`.

### Creating a Poll
- Once logged in, navigate to the dashboard and click "Create Poll".
- Enter a poll title, description, and options, then submit.

### Voting on a Poll
- Share the poll link or QR code with others.
- Users can vote on any active poll and see real-time results.

## How to Test the App
- **Manual Testing:** Register, log in, create polls, and vote to verify all flows work securely.
- **Security Testing:** Try to bypass validation by submitting requests directly to the server (e.g., with Postman). All validation should be enforced server-side.
- **Session Testing:** Log in and out, and verify that protected routes are inaccessible when not authenticated.

## Security Vulnerabilities and Remediation

A security audit revealed and fixed several critical vulnerabilities. See the detailed sections below for what was found and how it was fixed.

---

### 1. Insecure Registration Form (Client-Side Validation Bypass)

-   **Vulnerability:** The user registration form was performing password strength and confirmation checks only on the client side.
-   **Risk:** High. An attacker could easily bypass these client-side checks by disabling JavaScript or sending a direct request to the server. This would allow the creation of accounts with weak or non-compliant passwords, making them easy to compromise.
-   **Remediation:**
    1.  **Moved Validation to Server:** All validation logic, including password matching and strength checks (minimum length, character types), was moved into the `register` server action (`app/lib/actions/auth-actions.ts`).
    2.  **Server as Single Source of Truth:** The server is now the sole authority for validating new user accounts, completely mitigating the risk of a client-side bypass.
    3.  **Simplified Frontend:** The frontend component (`app/(auth)/register/page.tsx`) was refactored to remove the redundant client-side code, making it cleaner and more secure.

---

### 2. Insecure Login Form (Client-Side Validation and User Enumeration)

-   **Vulnerability:** The login form also relied on client-side validation, which could be bypassed. Furthermore, the error messages returned from the server were too specific (e.g., "Invalid login credentials"), which could allow an attacker to guess valid usernames (a technique known as user enumeration).
-   **Risk:** High. Bypassing client-side checks could facilitate brute-force attacks, while user enumeration could help an attacker identify valid targets.
-   **Remediation:**
    1.  **Server-Side Validation:** All login validation logic was moved to the `login` server action.
    2.  **Sanitized Error Messages:** The server action was updated to return a generic and secure error message ("Invalid email or password") for any failed login attempt. This prevents attackers from determining whether a failure was due to a bad password or a non-existent user.
    3.  **Removed Client-Side Logic:** The frontend login form was simplified, with all validation now handled securely on the server.

---

### 3. Authentication Middleware Bug (`AuthSessionMissingError`)

-   **Issue:** After the initial security fixes, the application began to experience an `AuthSessionMissingError`. This was caused by an improperly configured Next.js middleware file that failed to manage and refresh user sessions for server-side components.
-   **Risk:** Medium. While not a direct vulnerability, this bug broke authentication for legitimate users, making large parts of the application inaccessible.
-   **Remediation:**
    1.  **Updated Middleware:** The `middleware.ts` file was completely rewritten to use the official, recommended implementation from the Supabase documentation for `@supabase/ssr`.
    2.  **Reliable Session Management:** The new middleware correctly handles the user's session cookie, ensuring it is refreshed and made available to all server-side rendering and server action contexts. This stabilized the authentication flow across the entire application.

## Conclusion

By centralizing all validation logic on the server, sanitizing error messages, and implementing robust session management, the application's authentication system has been significantly hardened against common web vulnerabilities. The codebase is now more secure, resilient, and maintainable.
