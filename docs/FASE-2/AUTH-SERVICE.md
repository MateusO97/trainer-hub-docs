# Auth Service - Configuração & Implementação

**Status**: Ready to implement (Wave 1)  
**Prioridade**: CRÍTICA (dependency de todos os serviços)  
**Estimativa**: 2 semanas  
**Owner**: Backend Team Lead  

---

## 📋 Configuração do Serviço

```yaml
# services/auth/config.yaml

serviceName: "auth"
displayName: "Authentication Service"
description: "OAuth2 + JWT token management + RBAC"
port: 8081

mainFeatures:
  - "OAuth2 login (Google, Apple, Email)"
  - "JWT token generation & validation"
  - "Token refresh mechanism"
  - "RBAC with 4 roles (USER, NUTRITIONIST, TRAINER, ADMIN)"
  - "Audit logging"
  - "Password reset flow"

database:
  - type: "PostgreSQL"
    version: "15+"
    tables:
      - "users (id, email, passwordHash, firstName, lastName, role, createdAt, updatedAt)"
      - "oauth_tokens (userId, provider, token, expiresAt)"
      - "refresh_tokens (userId, token, expiresAt, revokedAt)"
      - "audit_log (userId, action, ipAddress, userAgent, timestamp)"

cache:
  - "Redis for token blacklist"

externalAPIs:
  - "Google OAuth2"
  - "Apple Sign In"

dependencies:
  - "spring-boot-starter-security"
  - "spring-boot-starter-data-jpa"
  - "spring-boot-starter-web"
  - "java-jwt:0.12.1"
  - "google-auth-library"
  - "apple-sign-in-client"
  - "postgresql"
  - "spring-data-redis"
  - "spring-boot-starter-validation"

endpoints:
  - "POST /api/v1/auth/login (email + password)"
  - "POST /api/v1/auth/oauth/google (Google token)"
  - "POST /api/v1/auth/oauth/apple (Apple token)"
  - "POST /api/v1/auth/refresh (refresh token)"
  - "POST /api/v1/auth/logout (invalidate token)"
  - "POST /api/v1/auth/password-reset (forgot password)"
  - "POST /api/v1/auth/password-reset-confirm (confirm reset)"
  - "GET /api/v1/auth/me (current user)"
  - "POST /api/v1/auth/validate-token (check if valid)"
```

---

## 🎯 Acceptance Criteria (DEVE IMPLEMENTAR)

### Autenticação Básica
- [ ] **POST /api/v1/auth/login**
  - Accepts: `{ email: string, password: string }`
  - Returns: `{ accessToken, refreshToken, user: { id, email, firstName, lastName, role } }`
  - Validates email/password against database
  - Returns 401 if invalid credentials
  - Returns 400 if missing fields

- [ ] **Password Security**
  - Passwords hashed with bcrypt (cost: 12)
  - Never return plaintext passwords in API
  - Validate password strength on registration (min 8 chars, uppercase, number, special char)

### JWT Token Generation
- [ ] **Access Token**
  - Validity: 1 hour
  - Contains: `{ sub: userId, email, role, iat, exp }`
  - Signed with RS256 (RSA private key)
  - Verified by other services with public key

- [ ] **Refresh Token**
  - Validity: 7 days
  - Single-use (invalidated after use)
  - Stored in database
  - Cannot be reused

### Refresh Token Flow
- [ ] **POST /api/v1/auth/refresh**
  - Accepts: `{ refreshToken: string }`
  - Returns: `{ accessToken, refreshToken } (new refresh token)`
  - Validates old refresh token
  - Blacklists old refresh token
  - Returns 401 if token invalid/expired

### OAuth2 Integration
- [ ] **Google OAuth2**
  - POST /api/v1/auth/oauth/google with Google ID token
  - Auto-create user if first login
  - Return JWT access token + refresh token
  - Link to existing user if email exists

- [ ] **Apple Sign In**
  - POST /api/v1/auth/oauth/apple with Apple token
  - Same flow as Google

### RBAC (Role-Based Access Control)
- [ ] **4 Roles**:
  - USER: Basic app access
  - NUTRITIONIST: Can see clients' macros, create meal plans
  - TRAINER: Can see clients' progress, assign workouts
  - ADMIN: All permissions

- [ ] **Role Assignment**
  - Admin can assign roles via PATCH /users/{id}/role
  - Roles immutable after signup (must be admin)
  - Default role: USER

### Token Validation & Logout
- [ ] **GET /api/v1/auth/validate-token**
  - POST with Authorization header
  - Returns: `{ valid: boolean, user: UserDTO | null }`
  - No database call (validate signature only)

- [ ] **POST /api/v1/auth/logout**
  - Invalidates refresh tokens for user
  - Blacklists access token (add to Redis)
  - Returns 204 No Content

### Password Reset
- [ ] **POST /api/v1/auth/password-reset (forgot password)**
  - Accepts: `{ email: string }`
  - Generates reset token (valid 1 hour)
  - Sends email with reset link
  - Returns 200 (don't leak if email exists)

- [ ] **POST /api/v1/auth/password-reset-confirm**
  - Accepts: `{ resetToken: string, newPassword: string }`
  - Validates reset token
  - Updates password hash
  - Returns 200

### Audit Logging
- [ ] **Log all security events**:
  - User login (success + failure)
  - Token refresh
  - Logout
  - Password change/reset
  - Role change

- [ ] **Audit log contains**:
  - userId
  - action (login, logout, refresh, etc)
  - timestamp
  - IP address
  - user agent
  - status (success/failure)
  - error message (if failure)

### Testing Requirements
- [ ] **Unit Tests**:
  - `AuthServiceTest` (60% coverage)
    - Happy path: login with valid credentials
    - Error paths: wrong password, user not found
    - Token generation: correct payload/expiry
    - Token refresh: invalidates old token
  - `JwtProviderTest` (JWT generation/validation)
  - `PasswordEncoderTest` (bcrypt hashing/validation)

- [ ] **Integration Tests** (TestContainers with PostgreSQL):
  - Full login flow (POST /auth/login → database lookup)
  - OAuth2 flow (mock Google/Apple API)
  - Refresh token (database lookups)
  - Logout (invalidation)

- [ ] **E2E Tests** (MockMvc):
  - POST /auth/login → 200 with token
  - POST /auth/login bad password → 401
  - POST /auth/refresh → 200 with new token
  - POST /auth/logout → 204
  - Missing Authorization header → 401

- [ ] **Coverage**: ≥ 80% lines, ≥ 75% branches

### Security Requirements
- [ ] **HTTP Security**
  - HTTPS only in production
  - CORS configured correctly
  - No SQL injection (use parameterized queries)
  - No token in URL (use Authorization header)

- [ ] **Secrets Management**
  - RSA keys from environment variables (not in code)
  - Database credentials from env (not in code)
  - Google/Apple API keys from env

- [ ] **Token Storage**
  - Refresh tokens stored in database with hash
  - Access tokens validated signature-only (no DB lookup)

### API Documentation
- [ ] **OpenAPI/Swagger**
  - Document all 9 endpoints
  - Request/response examples
  - Error codes (400, 401, 404, 500)
  - Security scheme: Bearer <JWT>

- [ ] **README**
  - How to login
  - How to refresh token
  - How to logout
  - How to validate token from other services
  - Environment variables needed
  - How to run locally

### Deployment
- [ ] **Dockerfile** with multi-stage build
- [ ] **docker-compose.yml** for local dev (includes PostgreSQL)
- [ ] **GitHub Actions CI/CD** workflow
  - Run tests on PR
  - Build Docker image
  - Push to registry

---

## 🔄 Implementation Plan (Detailed)

### Week 1: Foundation & Authentication

**Day 1-2: Scaffolding + Setup**
- Generate microservice scaffolding (use SKILL)
- Setup build.gradle.kts with dependencies
- Create PostgreSQL schema (migration)
- Setup Spring Security configuration

**Day 3-4: Core Authentication**
- Implement User entity + repository
- Implement JwtProvider (token generation + validation)
- Implement PasswordEncoder (bcrypt)
- Implement AuthController + AuthService

**Day 5: Testing**
- Write unit tests (AuthService, JwtProvider)
- Write integration tests (with TestContainers)
- Write E2E tests (MockMvc)
- Achieve ≥ 80% coverage

**Deliverable**: Login endpoint working locally
- `POST /auth/login` with database lookup
- 50+ passing tests
- Docker image builds

### Week 2: Advanced Features + Hardening

**Day 1-2: OAuth2 + Refresh Token**
- Implement Google OAuth2 integration
- Implement Apple Sign In
- Implement refresh token flow
- Implement token blacklist (Redis)

**Day 3: RBAC + Audit Logging**
- Implement 4 roles + default USER
- Implement audit logging
- Implement logout endpoint
- Implement password reset flow

**Day 4-5: Security Hardening + Docs**
- Security review (no hardcoded secrets)
- Rate limiting on login endpoint
- Document API (OpenAPI/Swagger)
- Write deployment guide
- Create GitHub Actions workflow

**Deliverable**: Complete Auth Service
- All 9 endpoints working
- 80%+ test coverage
- Deployable to production
- Full documentation
- OAuth2 logins working

---

## 📂 File Structure (Final)

```
services/
  auth/
    src/
      main/
        kotlin/com/trainerhubamd/auth/
          AuthApplication.kt                     # Spring Boot main
          controller/
            AuthController.kt                    # REST endpoints
            dto/
              LoginRequest.kt, LoginResponse.kt
              RefreshTokenRequest.kt
              OAuthRequest.kt
              PasswordResetRequest.kt
              UserDto.kt
          service/
            IAuthService.kt                      # Interface
            AuthService.kt                       # Implementation
            JwtProvider.kt                       # Token generation/validation
            OAuthService.kt                      # Google/Apple login
          repository/
            UserRepository.kt
            RefreshTokenRepository.kt
            AuditLogRepository.kt
            TokenBlacklistRepository.kt
          entity/
            User.kt                              # Domain model
            RefreshToken.kt
            AuditLog.kt
            TokenBlacklist.kt
          exception/
            AuthException.kt
            AuthErrorHandler.kt
          config/
            SecurityConfig.kt
            JwtConfig.kt
            OAuthConfig.kt
        resources/
          application.properties                 # Dev config
          application-prod.properties            # Prod config
          db/migration/
            V1__create_users_table.sql
            V2__create_tokens_table.sql
            V3__create_audit_table.sql
      test/
        kotlin/com/trainerhubamd/auth/
          controller/
            AuthControllerTest.kt                # E2E tests
          service/
            AuthServiceTest.kt                   # Unit tests
            JwtProviderTest.kt
          repository/
            UserRepositoryTest.kt
          integration/
            AuthIntegrationTest.kt               # Full flow
        resources/
          application-test.properties
          test-data.sql
    build.gradle.kts                             # Dependencies
    Dockerfile                                   # Container build
    docker-compose.yml                           # Local dev with PostgreSQL
    README.md                                    # Setup guide
    API.md                                       # Endpoint docs
    ARCHITECTURE.md                              # Service design
    DEPLOYMENT.md                                # How to deploy
```

---

## 🚀 Como Começar (Hoje - 8 de Março)

### Step 1: Create Feature Issue (15 min)
```bash
# Use ISSUE-TEMPLATES.md → Feature template
# Title: [FEATURE] auth: implement OAuth2 + JWT authentication
# Submit to GitHub Issues
```

### Step 2: Create Branch (5 min)
```bash
git checkout -b feature/AUTH-001-oauth2-jwt
```

### Step 3: Generate Scaffolding (5 min)
```bash
./scripts/generate-microservice.sh --config services/auth/config.yaml
# Generates 25+ files automatically
```

### Step 4: First Commit (5 min)
```bash
git add services/auth/
git commit -m "chore(auth): generate microservice scaffolding

- Create Spring Boot 3.2+ project structure
- Setup build.gradle.kts with dependencies
- Create entity models (User, RefreshToken, AuditLog)
- Create repository interfaces
- Create service interface skeleton
- Generate unit test templates
- Create Dockerfile + docker-compose.yml
- Create API documentation skeleton

This is auto-generated scaffolding via MICROSERVICE-SCAFFOLDING.skill"
```

### Step 5: Implement Features (follow Acceptance Criteria)
- Follow CODING-STANDARDS.md patterns
- Commit progress daily
- Run tests: `./gradlew :services:auth:test`

### Step 6: Create PR (after all criteria met)
```bash
# Title: [AUTH] Implement OAuth2 + JWT authentication
# Description: Checklist of acceptance criteria
# Closes #AUTH-001
```

---

## 📊 Success Metrics

**By end of Wave 1 (Week 3)**:
- ✅ Auth Service complete + tested
- ✅ User Service complete + tested
- ✅ Food Service complete + tested
- ✅ All services integrated + talking to each other
- ✅ 80%+ test coverage across all
- ✅ Deployable to Docker

**By end of Fase 2 (Week 12)**:
- ✅ 10 microservices complete
- ✅ Mobile app functional
- ✅ MVP ready for users
- ✅ zero critical bugs
- ✅ Production-ready infrastructure

---

## 📖 References

- [CODING-STANDARDS.md](../INFRASTRUCTURE/CODING-STANDARDS.md) - Code patterns
- [TESTING-STRATEGY.md](../INFRASTRUCTURE/TESTING-STRATEGY.md) - How to test
- [DEVELOPMENT-WORKFLOW.md](../INFRASTRUCTURE/DEVELOPMENT-WORKFLOW.md) - Daily tasks
- [05-MICROSERVICES.md](../05-MICROSERVICES.md) - Auth service endpoint specs
- [08-SECURITY.md](../08-SECURITY.md) - Security implementation details
- [MICROSERVICE-SCAFFOLDING.skill.md](MICROSERVICE-SCAFFOLDING.skill.md) - Code generation

---

**Owner**: Backend Team  
**Start Date**: March 8, 2026  
**Target Completion**: March 22, 2026 (2 weeks)
