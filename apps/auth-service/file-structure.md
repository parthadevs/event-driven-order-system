```
📦 auth-service
├── prisma
│   ├── migrations
│   └── schema.prisma
│
├── src
│   │
│   ├── common
│   │   ├── constants
│   │   ├── decorators
│   │   ├── filters
│   │   └── types
│   │
│   ├── health
│   │
│   ├── infrastructure
│   │   └── persistence
│   │       ├── prisma
│   │       │   ├── prisma.module.ts
│   │       │   └── prisma.service.ts
│   │       │
│   │       └── redis
│   │           ├── redis.module.ts
│   │           └── redis.service.ts
│   │
│   ├── modules
│   │   │
│   │   ├── auth
│   │   │   │
│   │   │   ├── application
│   │   │   │   └── use-cases
│   │   │   │       ├── forgot-password.use-case.ts
│   │   │   │       ├── login-user.use-case.ts
│   │   │   │       ├── logout-all.use-case.ts
│   │   │   │       ├── logout.use-case.ts
│   │   │   │       ├── refresh-token.use-case.ts
│   │   │   │       ├── register-user.use-case.ts
│   │   │   │       ├── reset-password.use-case.ts
│   │   │   │       └── verify-email.use-case.ts
│   │   │   │
│   │   │   ├── domain
│   │   │   │   ├── entities
│   │   │   │   │   ├── auth-event.entity.ts
│   │   │   │   │   ├── auth-session.entity.ts
│   │   │   │   │   ├── email-verification-token.entity.ts
│   │   │   │   │   ├── oauth-account.entity.ts
│   │   │   │   │   └── password-reset-token.entity.ts
│   │   │   │   │
│   │   │   │   ├── repositories
│   │   │   │   │   ├── auth-session.repository.ts
│   │   │   │   │   ├── email-verification-token.repository.ts
│   │   │   │   │   ├── oauth-account.repository.ts
│   │   │   │   │   └── password-reset-token.repository.ts
│   │   │   │   │
│   │   │   │   └── value-objects
│   │   │   │       ├── auth-session-id.vo.ts
│   │   │   │       └── token-family.vo.ts
│   │   │   │
│   │   │   ├── infrastructure
│   │   │   │   ├── messaging
│   │   │   │   └── persistence
│   │   │   │       ├── prisma-auth-session.repository.ts
│   │   │   │       ├── prisma-email-verification.repository.ts
│   │   │   │       ├── prisma-oauth-account.repository.ts
│   │   │   │       └── prisma-password-reset.repository.ts
│   │   │   │
│   │   │   ├── presentation
│   │   │   │   ├── consumers
│   │   │   │   └── controllers
│   │   │   │       ├── dto
│   │   │   │       │   ├── create-user.dto.ts
│   │   │   │       │   ├── login.dto.ts
│   │   │   │       │   └── refresh-token.dto.ts
│   │   │   │       ├── auth.controller.spec.ts
│   │   │   │       └── auth.controller.ts
│   │   │   │
│   │   │   └── auth.module.ts
│   │   │
│   │   └── users
│   │       ├── application
│   │       │   └── use-cases
│   │       │       ├── create-user.use-case.ts
│   │       │       ├── delete-user.use-case.ts
│   │       │       ├── get-user.use-case.ts
│   │       │       └── update-user.use-case.ts
│   │       │
│   │       ├── domain
│   │       │   ├── entities
│   │       │   │   └── user.entity.ts
│   │       │   ├── repositories
│   │       │   │   └── user.repository.ts
│   │       │   └── value-objects
│   │       │       ├── email.vo.ts
│   │       │       └── user-id.vo.ts
│   │       │
│   │       ├── infrastructure
│   │       │   └── persistence
│   │       │       └── prisma-user.repository.ts
│   │       │
│   │       ├── presentation
│   │       │   └── controllers
│   │       │       └── users.controller.ts
│   │       │
│   │       └── users.module.ts
│   │
│   ├── security
│   │   ├── jwt
│   │   ├── password
│   │   └── rate-limit
│   │
│   ├── app.module.ts
│   └── main.ts
│
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .gitignore
├── prisma.config.ts
└── tsconfig.app.json
```