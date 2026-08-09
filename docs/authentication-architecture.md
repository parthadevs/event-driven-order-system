# Authentication Service Architecture

## 1. Purpose

`auth-service` is a standalone authentication and identity service responsible for managing:

* User registration
* User login
* Password authentication
* Access token generation
* Refresh token rotation
* Refresh token reuse detection
* Session management
* Logout
* Logout from all devices
* Password change
* Password reset
* Email verification
* OAuth authentication
* Account status
* Role-based authorization
* Authentication security events

The service is built with:

* NestJS
* TypeScript
* PostgreSQL
* Prisma
* JWT
* Argon2id
* Redis

---

# 2. Current Project

Current project structure:

```text
auth-service/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── auth-service.controller.spec.ts
│   ├── auth-service.controller.ts
│   ├── auth-service.module.ts
│   ├── auth-service.service.ts
│   └── main.ts
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env
├── .gitignore
├── prisma.config.ts
└── tsconfig.app.json
```

This is currently the initial NestJS structure.

The project will gradually be reorganized into feature-based modules as authentication functionality is implemented.

---

# 3. Core Architecture

The service follows a modular architecture:

```text
                         Client
                           │
                           ▼
                    ┌──────────────┐
                    │ Auth Service │
                    │    NestJS    │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
     PostgreSQL          Redis           External
       Prisma                           Services
          │                │                │
          │                │                ├── Email
          │                │                └── OAuth
          │                │
          │                ├── Rate Limit
          │                ├── Temporary Data
          │                └── Security Controls
          │
          ├── Users
          ├── Refresh Tokens
          ├── Password Resets
          ├── Email Verification
          ├── OAuth Accounts
          └── Auth Events
```

---

# 4. Responsibilities

## Auth Service owns

The authentication service is the source of truth for:

```text
User identity
User credentials
Authentication sessions
Refresh tokens
Password reset
Email verification
OAuth identities
Authentication events
Account security state
```

Other services should not directly modify authentication data.

For example:

```text
Order Service
     │
     │ needs user identity
     ▼
Access Token
     │
     ▼
JWT validation
```

The Order Service should not directly query the Auth Service database for every request.

---

# 5. Authentication Model

The system uses two different token types.

```text
Access Token
    ↓
   JWT
    ↓
Short-lived
    ↓
Stateless


Refresh Token
    ↓
Opaque random token
    ↓
Long-lived
    ↓
Stored as hash
    ↓
PostgreSQL
```

---

# 6. Access Token

Access tokens are JWTs.

Recommended lifetime:

```text
10 minutes
```

The exact value must be configurable.

Example:

```json
{
  "sub": "user-id",
  "role": "CUSTOMER",
  "type": "access",
  "iss": "auth-service",
  "aud": "api",
  "iat": 1720000000,
  "exp": 1720000600,
  "jti": "token-id"
}
```

The access token should contain only information required for authorization.

Do not store:

* Password
* Email verification token
* Refresh token
* Sensitive personal information
* Internal security data

---

# 7. Refresh Token

Refresh tokens are opaque random credentials.

Recommended lifetime:

```text
30 days
```

A refresh token should be generated using a cryptographically secure random generator.

Example lifecycle:

```text
Login
  │
  ▼
Refresh Token #1
  │
  │ refresh
  ▼
Refresh Token #2
  │
  │ refresh
  ▼
Refresh Token #3
```

Every successful refresh invalidates the previous refresh token.

---

# 8. Refresh Token Storage

The raw refresh token must never be stored in PostgreSQL.

Instead:

```text
Raw Token
    │
    ▼
SHA-256
    │
    ▼
tokenHash
    │
    ▼
PostgreSQL
```

Database:

```text
RefreshToken
├── id
├── userId
├── tokenHash
├── family
├── replacedTokenHash
├── revokedAt
├── revocationReason
├── expiresAt
├── userAgent
├── ipAddress
└── createdAt
```

---

# 9. Refresh Token Family

Every login/session receives a unique `family`.

Example:

```text
Browser Session
family = A

RT1 → RT2 → RT3 → RT4
```

Another device:

```text
Mobile Session
family = B

RT1 → RT2 → RT3
```

This allows the service to revoke one session without destroying every session belonging to the user.

---

# 10. Refresh Token Reuse Detection

Suppose:

```text
RT1 → RT2 → RT3
```

RT1 has already been replaced.

If RT1 is used again:

```text
Client
  │
  ▼
RT1
  │
  ▼
Auth Service
  │
  ▼
Already rotated
  │
  ▼
REUSE DETECTED
```

The service should:

1. Detect token reuse.
2. Revoke the entire token family.
3. Record an authentication security event.
4. Require the user to authenticate again.

Example:

```text
RT1 → RT2 → RT3

RT1 reused
     │
     ▼
Revoke family
     │
     ├── RT1 revoked
     ├── RT2 revoked
     └── RT3 revoked
```

---

# 11. User Model

The `User` model represents the identity of a person using the platform.

Important fields:

```text
id
email
passwordHash
fullName
role
status
emailVerifiedAt
failedLoginAttempts
lockedUntil
lastLoginAt
passwordChangedAt
```

Roles:

```text
CUSTOMER
ADMIN
SUPPORT
```

Statuses:

```text
ACTIVE
SUSPENDED
DELETED
```

---

# 12. Password Security

Passwords must be hashed using Argon2id.

```text
Plain Password
      │
      ▼
   Argon2id
      │
      ▼
passwordHash
      │
      ▼
 PostgreSQL
```

Never store plaintext passwords.

Do not use:

```text
MD5
SHA-1
Plain SHA-256
Base64
Encryption instead of hashing
```

Password hashing parameters should be configurable.

---

# 13. Registration

Endpoint:

```text
POST /auth/register
```

Flow:

```text
Request
  │
  ▼
Validate DTO
  │
  ▼
Normalize email
  │
  ▼
Check existing user
  │
  ▼
Hash password
  │
  ▼
Create User
  │
  ▼
Create Email Verification Token
  │
  ▼
Send Verification Email
```

The registration process should not automatically trust the email address.

---

# 14. Login

Endpoint:

```text
POST /auth/login
```

Flow:

```text
Login Request
      │
      ▼
Validate input
      │
      ▼
Find User
      │
      ▼
Check Status
      │
      ▼
Check Lock
      │
      ▼
Verify Password
      │
 ┌────┴────┐
 │         │
FAIL      SUCCESS
 │         │
 ▼         ▼
Increase   Reset attempts
attempts      │
 │            ▼
 ▼       Generate Access JWT
Lock if       │
required      ▼
         Generate Refresh Token
              │
              ▼
         Store Token Hash
              │
              ▼
         Create Auth Event
              │
              ▼
            Response
```

---

# 15. Failed Login Protection

The user model contains:

```text
failedLoginAttempts
lockedUntil
```

Example policy:

```text
5 failed attempts
        │
        ▼
15-minute lock
```

Successful login:

```text
failedLoginAttempts = 0
lockedUntil = null
```

Rate limiting should also be applied at the API level.

---

# 16. Password Reset

Endpoints:

```text
POST /auth/forgot-password
POST /auth/reset-password
```

Forgot password:

```text
Request
   │
   ▼
Generate secure random token
   │
   ▼
Hash token
   │
   ▼
Store hash
   │
   ▼
Send email
```

Recommended expiration:

```text
30 minutes
```

Reset:

```text
Token
  │
  ▼
Hash token
  │
  ▼
Find token
  │
  ├── Invalid → Reject
  ├── Expired → Reject
  └── Used → Reject
          │
          ▼
     New Password
          │
          ▼
       Argon2id
          │
          ▼
      Update User
          │
          ▼
 Revoke All Sessions
```

---

# 17. Email Verification

Endpoints:

```text
POST /auth/send-verification
GET /auth/verify-email
```

Token lifecycle:

```text
Generate
   │
   ▼
Hash
   │
   ▼
Store
   │
   ▼
Send Email
   │
   ▼
User clicks link
   │
   ▼
Hash received token
   │
   ▼
Validate
   │
   ▼
Set emailVerifiedAt
```

Verification tokens must be:

* Random
* Hashed
* Expiring
* Single-use

---

# 18. Password Change

Endpoint:

```text
POST /auth/change-password
```

Flow:

```text
Current Password
       │
       ▼
Verify
       │
       ▼
New Password
       │
       ▼
Argon2id
       │
       ▼
Update passwordHash
       │
       ▼
Update passwordChangedAt
       │
       ▼
Revoke all refresh sessions
```

Changing the password invalidates all existing refresh sessions.

---

# 19. Logout

Endpoint:

```text
POST /auth/logout
```

The current refresh-token session is revoked.

```text
Refresh Token
      │
      ▼
Find session
      │
      ▼
Set revokedAt
      │
      ▼
Set revocationReason = LOGOUT
```

The access JWT remains valid until its short expiration.

---

# 20. Logout From All Devices

Endpoint:

```text
POST /auth/logout-all
```

Flow:

```text
User
 │
 ▼
Find all active refresh sessions
 │
 ▼
Revoke all sessions
 │
 ▼
Force authentication on every device
```

---

# 21. Session Management

The refresh-token family represents a session.

Example:

```text
User
 │
 ├── Chrome
 │    └── Family A
 │
 ├── Android
 │    └── Family B
 │
 └── Firefox
      └── Family C
```

The service can later expose:

```text
GET    /auth/sessions
DELETE /auth/sessions/:id
POST   /auth/logout-all
```

This allows users to see and revoke active sessions.

---

# 22. Redis

Redis is not the primary authentication database.

PostgreSQL remains the source of truth.

Redis is used for:

```text
Rate limiting
Login attempt counters
Temporary security state
OTP
Email throttling
Brute-force protection
Short-lived cache
```

Architecture:

```text
                 Auth Service
                      │
             ┌────────┴────────┐
             ▼                 ▼
        PostgreSQL           Redis
        Persistent          Temporary
        Data                Data
```

---

# 23. Rate Limiting

Strict rate limits should be applied to:

```text
POST /auth/login
POST /auth/register
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/refresh
POST /auth/send-verification
```

Example:

```text
Login
5 requests / minute / IP
```

```text
Forgot Password
3 requests / 15 minutes / IP
```

Exact limits should be configurable.

---

# 24. OAuth

OAuth support is optional during the initial implementation but the architecture should support it.

Supported providers can include:

```text
Google
GitHub
Facebook
```

OAuth identities should be stored separately:

```text
User
 │
 └── OAuthAccount
       ├── provider
       └── providerAccountId
```

OAuth login eventually follows:

```text
Client
  │
  ▼
Auth Service
  │
  ▼
OAuth Provider
  │
  ▼
Callback
  │
  ▼
Find/Create OAuth Account
  │
  ▼
Find/Create User
  │
  ▼
Issue Access Token
  │
  ▼
Issue Refresh Token
```

---

# 25. Authentication Events

Security-sensitive actions should generate events.

Examples:

```text
ACCOUNT_CREATED
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
REFRESH_TOKEN_CREATED
REFRESH_TOKEN_ROTATED
REFRESH_TOKEN_REUSED
REFRESH_TOKEN_REVOKED
PASSWORD_CHANGED
PASSWORD_RESET_REQUESTED
PASSWORD_RESET_COMPLETED
EMAIL_VERIFIED
OAUTH_LOGIN
ACCOUNT_SUSPENDED
```

Events are stored in PostgreSQL.

Never store:

```text
Passwords
Raw refresh tokens
Raw reset tokens
Raw verification tokens
```

inside event metadata.

---

# 26. Authorization

Authentication:

```text
Who are you?
```

Authorization:

```text
What can you do?
```

Current roles:

```text
CUSTOMER
SUPPORT
ADMIN
```

Example:

```text
CUSTOMER
  └── Customer resources

SUPPORT
  └── Support resources

ADMIN
  └── Administrative resources
```

NestJS Guards will handle authorization.

---

# 27. Request Authentication

Protected API request:

```text
Client
  │
  ▼
Authorization: Bearer <access-token>
  │
  ▼
JwtAuthGuard
  │
  ├── Verify signature
  ├── Verify expiration
  ├── Verify issuer
  ├── Verify audience
  └── Verify token type
  │
  ▼
Attach user context
  │
  ▼
Controller
```

---

# 28. JWT Signing

For a distributed system, asymmetric signing is preferred.

Recommended:

```text
RS256
```

or:

```text
ES256
```

Architecture:

```text
                 Auth Service
                     │
                Private Key
                     │
                     ▼
                 Sign JWT
                     │
                     ▼
              Access Token
                     │
                     ▼
              Other Services
                     │
                Public Key
                     │
                     ▼
                 Verify JWT
```

The private key must only be available to the token issuer.

---

# 29. Security Rules

The auth-service must follow these rules:

```text
1. Never store plaintext passwords.
2. Never store raw refresh tokens.
3. Never store raw reset tokens.
4. Never log authentication secrets.
5. Use Argon2id for passwords.
6. Use short-lived access tokens.
7. Rotate refresh tokens.
8. Detect refresh-token reuse.
9. Revoke token families after reuse.
10. Rate-limit authentication endpoints.
11. Prevent account enumeration.
12. Use HTTPS in production.
13. Protect JWT private keys.
14. Revoke sessions after password changes.
15. Keep authentication and authorization separate.
```

---

# 30. Environment Configuration

Example:

```env
DATABASE_URL="postgresql://..."

REDIS_URL="redis://..."

JWT_ISSUER="auth-service"
JWT_AUDIENCE="api"

JWT_ACCESS_TOKEN_EXPIRES_IN="10m"
REFRESH_TOKEN_EXPIRES_IN="30d"

JWT_PRIVATE_KEY="..."
JWT_PUBLIC_KEY="..."

PASSWORD_RESET_EXPIRES_IN="30m"
EMAIL_VERIFICATION_EXPIRES_IN="30m"
```

Secrets must never be committed to Git.

---

# 31. Target Project Structure

The current NestJS structure should evolve into:

```text
auth-service/
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   │
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── refresh.dto.ts
│   │   │   ├── forgot-password.dto.ts
│   │   │   ├── reset-password.dto.ts
│   │   │   └── change-password.dto.ts
│   │   │
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   │
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   │
│   │   ├── services/
│   │   │   ├── token.service.ts
│   │   │   ├── password.service.ts
│   │   │   ├── session.service.ts
│   │   │   └── verification.service.ts
│   │   │
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   │
│   ├── users/
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── users.controller.ts
│   │
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── redis/
│   │   ├── redis.service.ts
│   │   └── redis.module.ts
│   │
│   ├── security/
│   │   ├── rate-limit.service.ts
│   │   └── security.module.ts
│   │
│   ├── common/
│   │   ├── constants/
│   │   ├── decorators/
│   │   ├── filters/
│   │   └── types/
│   │
│   ├── auth-service.module.ts
│   └── main.ts
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── docs/
│   ├── authentication-architecture.md
│
├── .env
├── .gitignore
├── prisma.config.ts
└── tsconfig.app.json
```

---

# 32. Implementation Order

Do not implement everything at once.

Recommended order:

```text
Phase 1
│
├── Prisma
├── PostgreSQL
├── User
└── Basic configuration
        │
        ▼
Phase 2
│
├── Registration
├── Argon2id
└── Login
        │
        ▼
Phase 3
│
├── Access JWT
├── Refresh Token
└── Token Rotation
        │
        ▼
Phase 4
│
├── Logout
├── Logout All
├── Session Management
└── Reuse Detection
        │
        ▼
Phase 5
│
├── Email Verification
├── Password Reset
└── Password Change
        │
        ▼
Phase 6
│
├── Redis
├── Rate Limiting
└── Login Protection
        │
        ▼
Phase 7
│
├── Roles
├── Guards
└── Authorization
        │
        ▼
Phase 8
│
├── OAuth
└── Advanced Security
```

---

# 33. Definition of Done

The auth-service is considered production-ready when:

### Identity

* [ ] User registration works
* [ ] Email normalization works
* [ ] User status is enforced
* [ ] Email verification works

### Password

* [ ] Argon2id is used
* [ ] Password change works
* [ ] Password reset works
* [ ] Password reset tokens expire
* [ ] Password reset tokens are single-use

### Tokens

* [ ] Access JWT works
* [ ] Access JWT expires
* [ ] Refresh tokens are opaque
* [ ] Refresh tokens are hashed
* [ ] Refresh token rotation works
* [ ] Token reuse detection works
* [ ] Token family revocation works

### Sessions

* [ ] Logout works
* [ ] Logout all works
* [ ] Session listing works
* [ ] Individual session revocation works

### Security

* [ ] Rate limiting works
* [ ] Account lockout works
* [ ] Account enumeration is prevented
* [ ] Sensitive data is not logged
* [ ] JWT keys are secured
* [ ] HTTPS is required in production

### Authorization

* [ ] JWT Guard works
* [ ] Role Guard works
* [ ] CUSTOMER role works
* [ ] SUPPORT role works
* [ ] ADMIN role works

### Testing

* [ ] Unit tests
* [ ] Authentication integration tests
* [ ] Refresh token rotation tests
* [ ] Token reuse tests
* [ ] Password reset tests
* [ ] E2E authentication tests

---

# 34. Final Architecture

```text
                         CLIENT
                           │
                           ▼
                    ┌─────────────┐
                    │ Auth API    │
                    │   NestJS    │
                    └──────┬──────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
         PostgreSQL      Redis        External
           Prisma                     Services
             │             │             │
             │             │             ├── Email
             │             │             └── OAuth
             │             │
             │             ├── Rate Limit
             │             └── Temporary State
             │
     ┌───────┼─────────────────────────────┐
     │       │             │               │
     ▼       ▼             ▼               ▼
   Users  Sessions      Passwords       Auth Events
            │
            ▼
     Refresh Token
        Rotation
            │
            ▼
      Reuse Detection
            │
            ▼
      Family Revocation
```

---

# 35. Design Goal

The goal of `auth-service` is not to become a large business-service application.

Its responsibility is intentionally narrow:

```text
Identity
   +
Authentication
   +
Sessions
   +
Credential Security
   +
Authorization
```

Business services such as:

```text
payments
orders
products
notifications
analytics
```

should remain outside the auth-service.

The auth-service should answer:

```text
Who is this user?
Is this authentication valid?
Is this session valid?
What role does this user have?
```

Other services decide what that authenticated user is allowed to do within their own business domain.
