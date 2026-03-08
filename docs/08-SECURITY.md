# 08-SECURITY.md
## Segurança & Autenticação - TrAIner Hub

**Versão**: 1.0  
**Data**: 2025-08-01  
**Status**: Final - Fase 1.8  
**Propósito**: Definir estratégia de autenticação, autorização, encriptação e proteção contra ataques

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação (Authentication)](#autenticação)
3. [Autorização (Authorization)](#autorização)
4. [JWT Tokens](#jwt-tokens)
5. [Encriptação](#encriptação)
6. [Gerenciamento de Secrets](#gerenciamento-de-secrets)
7. [CORS & HTTPS](#cors--https)
8. [Validação de Entrada](#validação-de-entrada)
9. [Proteção contra Ataques](#proteção-contra-ataques)
10. [Compliance & Auditoria](#compliance--auditoria)
11. [Incident Response](#incident-response)

---

## 1. Visão Geral

Camadas de segurança em TrAIner Hub:

```
┌────────────────────────────────────────────────┐
│ 1. TRANSPORT SECURITY                          │
│    - HTTPS (TLS 1.3+)                         │
│    - Certificate pinning (mobile)              │
└────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────┐
│ 2. AUTHENTICATION                              │
│    - OAuth2 + JWT                             │
│    - Refresh token rotation                   │
│    - MFA support (future)                     │
└────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────┐
│ 3. AUTHORIZATION                               │
│    - RBAC (Role-Based Access Control)         │
│    - Permission matrix per endpoint           │
│    - Resource ownership verification         │
└────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────┐
│ 4. DATA PROTECTION                             │
│    - Encryption at rest (PostgreSQL)          │
│    - Encryption in transit (TLS)              │
│    - Secrets in vault (not in env vars)      │
└────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────┐
│ 5. INPUT VALIDATION & OUTPUT ENCODING          │
│    - Sanitize via Spring Validation           │
│    - XSS prevention via encoding              │
│    - SQL injection prevention (parameterized) │
│    - Rate limiting                            │
└────────────────────────────────────────────────┘
```

---

## 2. Autenticação (Authentication)

### 2.1 OAuth2 + Authorization Code Flow

TrAIner Hub usa **OAuth2 Authorization Code flow** para segurança máxima:

```
┌──────────────┐
│ Mobile App   │
└──────┬───────┘
       │ 1. Redirect to /auth/authorize
       │    ?client_id=mobile-app&scope=user:profile,meal:write
       │
       ▼
┌────────────────────┐
│ API Gateway        │
│ (Authorization     │
│  Endpoint)         │
└────┬───────────────┘
     │ 2. Display login form (or OAuth provider)
     │
     ▼
┌────────────────────┐
│ User              │
│ - Enter email      │
│ - Enter password   │
│   (OR federated    │
│   Google login)    │
└────┬───────────────┘
     │ 3. POST /auth/login
     │
     ▼
┌────────────────────┐
│ Auth Service       │
│ - Verify password  │
│   (bcrypt)         │
│ - Generate code    │
└────┬───────────────┘
     │ 4. Redirect to mobile://callback?code=xxx&state=yyy
     │
     ▼
┌──────────┐
│ Mobile   │
│ Stores   │
│ code     │
└────┬─────┘
     │ 5. Backend exchange code for token
     │    POST /auth/token
     │    { code, client_id, client_secret }
     │
     ▼
┌────────────────────┐
│ Auth Service       │
│ - Validate code    │
│ - Verify secret    │
│ - Issue tokens     │
└────┬───────────────┘
     │ 6. { accessToken, refreshToken }
     │
     ▼
┌──────────┐
│ Mobile   │
│ Now has  │
│ tokens   │
└──────────┘
```

**Flow alternativos**:

1. **Direct Register** (Mobile):
   ```
   POST /auth/register
   { email, password, name, birthDate, gender }
   
   Response (201):
   { accessToken, refreshToken, expiresIn }
   ```

2. **Federated Login** (Google/Apple):
   ```
   Mobile: Usa Google SignIn SDK
   Retorna: ID token do Google (JWT)
   
   POST /auth/federated-callback
   { provider: "GOOGLE", idToken }
   
   Auth Service:
   - Verifica signature do ID token
   - Extrai email/profile
   - Cria/autentica usuário
   - Retorna tokens TrAIner Hub
   ```

### 2.2 Password Security

```
Requisitos:
  - Mínimo 8 caracteres
  - Pelo menos 1 letra maiúscula
  - Pelo menos 1 número
  - Pelo menos 1 caractere especial (!@#$%^&*)

Validação no Backend (não confiar em frontend):
  
  @Validated
  data class RegisterRequest(
    @Email
    @NotBlank
    val email: String,
    
    @NotBlank
    @Pattern(
      regexp = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%^&*])[a-zA-Z0-9!@#\$%^&*]{8,}$",
      message = "Password must be 8+ chars with uppercase, number, special char"
    )
    val password: String
  )

Armazenamento:
  - Hash com bcrypt (spring security BCryptPasswordEncoder)
  - Cost factor: 10 (versão = 2y)
  - Exemplo: $2y$10$slYQmyNdGzin7olVN3p5PeUe8YeM0.R1UWZbK5cVl2.cKCE...
  
  fun hashPassword(raw: String): String {
    return BCryptPasswordEncoder(10).encode(raw)
  }
  
  fun verifyPassword(raw: String, hash: String): Boolean {
    return BCryptPasswordEncoder().matches(raw, hash)
  }

Reset: Email com link temporário (token válido 1 hora) não password direto
```

### 2.3 Multi-Factor Authentication (Roadmap Fase 3)

```
POST /auth/mfa/enable
{ method: "TOTP" or "SMS" }

Response:
{
  "qrCode": "data:image/png;base64,...",  // para TOTP
  "sharedSecret": "JBSWY3D..."  // para app como Google Authenticator
}

Após scan QR ou salvar secret:
POST /auth/mfa/verify
{ code: "123456" }
```

---

## 3. Autorização (Authorization)

### 3.1 RBAC (Role-Based Access Control)

TrAIner Hub possui 4 roles:

| Role | Responsabilidades | APIs Permitidas |
|------|-------------------|-----------------|
| **USER** | Consumidor normal | GET/POST próprios dados, READ-ONLY outros users |
| **NUTRITIONIST** | Parceiro nutricionista | View clients, provide guidance, manage meal plans |
| **ADMIN** | Administrador plataforma | CRUD de dados, ver analytics, gerenciar users |
| **SYSTEM** | Serviço interno | Acesso elevado, CI/CD, batch jobs |

### 3.2 Permission Matrix

```
Role: USER
├─ GET /api/v1/users/profile → self only
├─ PUT /api/v1/users/profile → self only
├─ POST /api/v1/meals → create owned
├─ GET /api/v1/meals → self only
├─ GET /api/v1/meals/{id} → self only
├─ GET /api/v1/nutrition/daily → self only
├─ GET /api/v1/tracking/dashboard → self only
├─ GET /api/v1/users/{userId}/summary → if nutritionistAccess=true
└─ DELETE /api/v1/users/profile → self only

Role: NUTRITIONIST
├─ GET /api/v1/users/{clientId} → if client assigned
├─ PUT /api/v1/users/{clientId}/preferences → if client assigned
├─ POST /api/v1/foods → create verified foods (global)
├─ POST /api/v1/foods/{foodId}/verify → approve user foods
├─ GET /api/v1/nutrition/report/{clientId} → if client assigned
├─ POST /api/v1/meal-plans/{planId}/suggest → for assigned clients
└─ POST /api/v1/notifications → send personalized messages

Role: ADMIN
├─ DELETE /api/v1/users/{userId} → any user (soft delete)
├─ PUT /api/v1/users/{userId}/preferences → any user
├─ POST /api/v1/foods → global
├─ GET /api/v1/analytics/dashboard → full access
├─ PUT /api/v1/system/config → change settings
└─ POST /api/v1/system/backup → manual backup

Role: SYSTEM
├─ POST /api/v1/events/replay → event sourcing
├─ GET /api/v1/health/deep → infrastructure health
├─ PUT /api/v1/cache/flush → clear caches
└─ (acesso total para batch jobs)
```

### 3.3 Implementação Spring Security

```kotlin
// Authorization configuration

@Configuration
@EnableGlobalMethodSecurity(
    prePostEnabled = true,
    securedEnabled = true,
    jsr250Enabled = true
)
class SecurityConfig {
    
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            .csrf { it.disable() }  // Disabled (JWT not vulnerable)
            .authorizeRequests {
                // Public endpoints
                it.antMatchers("/auth/**").permitAll()
                it.antMatchers("/docs/**").permitAll()
                it.antMatchers("/health").permitAll()
                
                // Require authentication for API
                it.antMatchers("/api/v1/**").authenticated()
                
                // Admin only
                it.antMatchers("/api/v1/admin/**")
                    .hasRole("ADMIN")
                
                // Nutritionist only
                it.antMatchers("/api/v1/foods/*/verify")
                    .hasAnyRole("NUTRITIONIST", "ADMIN")
                
                // Default deny
                it.anyRequest().denyAll()
            }
            .oauth2ResourceServer {
                it.jwt()  // Bearer token com JWT
            }
            .build()
    }
    
    @Bean
    fun jwtDecoder(): JwtDecoder {
        return NimbusJwtDecoder
            .withSecretKey(rsaKey.publicKey)
            .algorithms("RS256")
            .build()
    }
}

// Method-level security

@Service
class UserService {
    
    @PreAuthorize("@userOwnershipChecker.isOwner(#userId)")
    fun getProfile(userId: UUID): UserProfileResponse {
        // Only owner or admin can view
    }
    
    @PreAuthorize("hasRole('NUTRITIONIST')")
    fun assignNutritionistClient(
        clientId: UUID,
        nutritionistId: UUID
    ): Unit {
        // Only nutritionists can assign clients
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    fun deleteUser(userId: UUID): Unit {
        // Only admins can delete
    }
}

// Custom checker for shared resources

@Component
class UserOwnershipChecker {
    fun isOwner(userId: UUID): Boolean {
        val currentUserIdStr = SecurityContextHolder
            .getContext()
            .authentication
            .principal  // JWT sub claim
        
        return currentUserIdStr == userId.toString()
    }
}
```

### 3.4 Verificação Granular por Recurso

```kotlin
@Service
class MealPlanService {
    
    fun getMealPlan(planId: UUID): MealPlanResponse {
        val plan = db.findById(planId)
            ?: throw ResourceNotFound("Plan not found")
        
        val currentUserId = getCurrentUserId()  // From JWT
        
        // Verificar ownership
        if (plan.userId != currentUserId) {
            // Verificar se é nutricionista atribuído
            if (isNutritionist(currentUserId, plan.userId)) {
                // Permitir
            } else {
                throw AccessDeniedException("You don't have access")
            }
        }
        
        return plan.toResponse()
    }
    
    private fun isNutritionist(nutritionistId: UUID, clientId: UUID): Boolean {
        return db.findAssignment(nutritionistId, clientId) != null
    }
}
```

---

## 4. JWT Tokens

### 4.1 Token Structure

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJzdWIiOiJ1c2VyLXV1aWQtMTIzIiwibmFtZSI6IkdhYnJpZWwiLCJyb2xlIjpbIlVTRVIiXSwiaWF0IjoxNjkzNDcyNDQ1LCJleHAiOjE2OTM0NzYwNDUsImlzcyI6InRyYWluZXItaHViIn0
.
signature...
```

Header (decoded):
```json
{
  "alg": "RS256",
  "typ": "JWT"
}
```

Payload (decoded):
```json
{
  "sub": "user-uuid-123",      // Subject (userId)
  "name": "Gabriel",
  "email": "gabriel@example.com",
  "roles": ["USER"],
  "scope": "user:profile meal:write meal:read",
  "iat": 1693472445,           // issued at
  "exp": 1693476045,           // expires in
  "iss": "trainer-hub",        // issuer
  "aud": "trainer-hub-mobile"  // audience
}
```

### 4.2 Token Lifetimes

```
Access Token:
  - Validade: 1 hora
  - Motivo: Reduzir janela de ataque se comprometido
  - Armazenado: Memory (app mobile)
  
Refresh Token:
  - Validade: 7 dias
  - Motivo: Long-lived para manter sessão aberta
  - Armazenado: Redis (server-side)
  - Pode ser revogado a qualquer momento
  
Exemplo: Usuário usando app por 3 horas
  - Access token expira após 1h → refresh silenciosamente
  - Novo access token gerado → continua usando
  - Refresh token válido por 7 dias (rotação automática)
```

### 4.3 Token Refresh Flow

```kotlin
@PostMapping("/auth/refresh")
fun refreshToken(@RequestBody req: RefreshTokenRequest): LoginResponse {
    val token = refreshTokenCache.get(req.refreshToken)
        ?: throw InvalidTokenException("Refresh token not found")
    
    // Validação
    if (token.expiresAt < Instant.now()) {
        refreshTokenCache.delete(req.refreshToken)
        throw InvalidTokenException("Refresh token expired")
    }
    
    // Gerar novo access token
    val newAccessToken = jwtService.generateAccessToken(
        userId = token.userId,
        roles = token.roles
    )
    
    // Opcionalmente, rotacionar refresh token (para extra security)
    val newRefreshToken = jwtService.generateRefreshToken(
        userId = token.userId
    )
    refreshTokenCache.delete(req.refreshToken)
    refreshTokenCache.set(newRefreshToken, token.copy(
        token = newRefreshToken,
        issuedAt = Instant.now(),
        expiresAt = Instant.now() + 7.days
    ))
    
    return LoginResponse(
        accessToken = newAccessToken,
        refreshToken = newRefreshToken,
        expiresIn = 3600,
        tokenType = "Bearer"
    )
}
```

### 4.4 Token Revocation

```
Quando usuário faz LOGOUT:

POST /auth/logout
Header: Authorization: Bearer {accessToken}

Ação:
1. Extrair sub (userId) do token
2. Adicionar access token à revocation list (Redis)
   KEY: revoked_tokens:{token_hash}
   VALUE: true
   TTL: expiresAt - now (exatamente quando token expira)
3. Deletar refresh token do Redis
4. Retornar 204 No Content

Validação de token revogado:
  
  @Bean
  fun jwtDecoder(): JwtDecoder {
    return NimbusJwtDecoder(...)
      .apply {
        setJwtClaimsSetVerifier { claims ->
          val tokenHash = hash(claims.serializedForm)
          if (revocationCache.contains(tokenHash)) {
            throw JwtValidationException("Token revoked")
          }
        }
      }
  }
```

---

## 5. Encriptação

### 5.1 Encryption at Rest

**PostgreSQL - Transparent Data Encryption (TDE)**:

```sql
-- Habilitar encriptação de todo sistema de arquivos
-- (ou usar encriptação em nível de disco via AWS EBS encryption)

-- Para dados sensíveis específicos, usar field-level encryption

-- Exemplo: Armazenar phone number encriptado
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_hash VARCHAR(255),  -- hash para allowing lookup
    phone_encrypted VARCHAR(255),  -- encriptado com AES-256
    ...
);

-- Função para encriptação
CREATE FUNCTION encrypt_pgp_sym(data TEXT, secret TEXT)
RETURNS TEXT AS 'pgcrypto' LANGUAGE C;

INSERT INTO users (id, email, phone_encrypted)
VALUES (
    uuid_generate_v4(),
    'gabriel@example.com',
    encrypt_pgp_sym('+551198765432', 'aes-key-12345')
);

SELECT 
    id,
    email,
    decrypt_pgp_sym(phone_encrypted, 'aes-key-12345') as phone
FROM users
WHERE id = ?;
```

**Application-level Encryption**:

```kotlin
@Component
class EncryptionService(
    private val secretKey: SecretKey  // from KeyVault
) {
    
    private val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    private val random = SecureRandom()
    
    fun encrypt(plaintext: String): EncryptedData {
        val iv = ByteArray(12)
        random.nextBytes(iv)
        
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, GCMParameterSpec(128, iv))
        val ciphertext = cipher.doFinal(plaintext.toByteArray(Charsets.UTF_8))
        
        return EncryptedData(
            iv = Base64.encoder.encodeToString(iv),
            ciphertext = Base64.encoder.encodeToString(ciphertext)
        )
    }
    
    fun decrypt(encrypted: EncryptedData): String {
        val iv = Base64.decoder.decode(encrypted.iv)
        val ciphertext = Base64.decoder.decode(encrypted.ciphertext)
        
        cipher.init(Cipher.DECRYPT_MODE, secretKey, GCMParameterSpec(128, iv))
        val plaintext = cipher.doFinal(ciphertext)
        
        return String(plaintext, Charsets.UTF_8)
    }
}

// Uso:
@Entity
class User {
    @Convert(converter = EncryptedConverter::class)
    val ssn: String?  // Social security numbersensível
}
```

### 5.2 Encryption in Transit

```
TLS 1.3+ (minimum)
  - Certificate: Let's Encrypt wildcard
  - Rotation: Automático antes de expiração
  
Cipher suites recomendados:
  - TLS_AES_256_GCM_SHA384
  - TLS_CHACHA20_POLY1305_SHA256

Configuração Nginx (API Gateway):
  
server {
    listen 443 ssl http2;
    server_name api.trainerhub.com;
    
    ssl_certificate /etc/letsencrypt/live/trainerhub.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/trainerhub.com/privkey.pem;
    ssl_protocols TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubdomains" always;
}
```

---

## 6. Gerenciamento de Secrets

### 6.1 Secret Vault

Usar **HashiCorp Vault** ou **AWS Secrets Manager**:

```bash
# AWS Secrets Manager
aws secretsmanager create-secret \
  --name trainer-hub/db-password \
  --secret-string "DbPassword123!"

# Kubernetes secret
kubectl create secret generic trainer-hub-secrets \
  --from-literal=db-password=DbPassword123! \
  --from-literal=jwt-secret=long-random-secret-key
```

### 6.2 application.yml (Sem Secrets Hardcoded)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://db:5432/trainer_hub
    username: app_user
    password: ${DB_PASSWORD}  # From environment variable
    
  rabbitmq:
    host: ${RABBITMQ_HOST}
    port: ${RABBITMQ_PORT}
    username: ${RABBITMQ_USER}
    password: ${RABBITMQ_PASSWORD}

jwt:
  secret: ${JWT_SECRET}  # From KeyVault
  expiration: 3600  # 1 hora

openai:
  apiKey: ${OPENAI_API_KEY}  # From KeyVault
  model: gpt-4o
```

### 6.3 Secrets Rotation

```
Política:
  - Key Rotation: A cada 90 dias
  - Password Rotation: A cada 180 dias
  - Certificate Rotation: Automático (Let's Encrypt)

Implementação:
  1. AWS Lambda triggered monthly
  2. Generate new secret
  3. Update in Vault
  4. Notify services (via webhook)
  5. Services reloadam secrets on next config refresh
  6. Old secret retired após 30 dias (grace period)
```

---

## 7. CORS & HTTPS

### 7.1 CORS Configuration

```kotlin
@Configuration
class WebConfig : WebMvcConfigurer {
    
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/v1/**")
            .allowedOrigins(
                "https://trainerhub.com",
                "https://app.trainerhub.com"
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders(
                "Content-Type",
                "Authorization",
                "X-Request-Id"
            )
            .exposedHeaders(
                "X-RateLimit-Remaining",
                "X-RateLimit-Limit"
            )
            .allowCredentials(true)
            .maxAge(3600)  // 1 hora
    }
}
```

**Mobile app**: Não precisa CORS (comunica direto com API)

**Web browser**: CORS obrigatório (mesmo-domínio policy)

### 7.2 Header de Segurança

```
Resposta HTTP headers:

Content-Security-Policy: default-src 'self'; script-src 'self' *.example.com
  → Mitiga XSS attacks

X-Content-Type-Options: nosniff
  → Previne MIME type sniffing

X-Frame-Options: DENY
  → Previne clickjacking

Strict-Transport-Security: max-age=31536000; includeSubdomains
  → Force HTTPS

X-XSS-Protection: 1; mode=block
  → Legacy XSS protection (browsers antigos)

Referrer-Policy: strict-origin-when-cross-origin
  → Controla referer headers
```

---

## 8. Validação de Entrada

### 8.1 Input Validation

```kotlin
@Validated
@RestController
@RequestMapping("/api/v1")
class UserController {
    
    @PostMapping("/users")
    fun createUser(@Valid @RequestBody req: CreateUserRequest): ResponseEntity {
        // Spring automaticamente valida
        // Se inválido, retorna 400 com detalhes de erro
    }
}

// DTO com validação
data class CreateUserRequest(
    @Email  // RFC 5322
    @NotBlank
    val email: String,
    
    @NotBlank
    @Size(min = 8, max = 128)
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%^&*])")
    val password: String,
    
    @NotBlank
    @Size(min = 2, max = 100)
    val name: String,
    
    @NotNull
    @PastOrPresent  // Data no passado ou hoje
    val birthDate: LocalDate,
    
    @NotNull
    @Pattern(regexp = "^[MFO]$")
    val gender: String,
    
    @Size(max = 50)  // Opcionalmente validar URL
    val avatarUrl: String?
)

// Global error handler
@RestControllerAdvice
class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(
        ex: MethodArgumentNotValidException
    ): ResponseEntity {
        val errors = ex.bindingResult.fieldErrors.map {
            FieldError(
                field = it.field,
                message = it.defaultMessage,
                rejectedValue = it.rejectedValue?.toString()
            )
        }
        
        return ResponseEntity
            .badRequest()
            .body(ErrorResponse(code = "VALIDATION_ERROR", errors))
    }
}
```

### 8.2 SQL Injection Prevention

```kotlin
// ❌ WRONG - Concatenation
val query = "SELECT * FROM users WHERE email = '$email'"  // VULNERABLE!

// ✅ CORRECT - Parameterized query (Spring Data JPA)
@Repository
interface UserRepository : JpaRepository<User, UUID> {
    fun findByEmail(email: String): User?
}

// ✅ CORRECT - Prepared statement
val query = "SELECT * FROM users WHERE email = ?"
val stmt = connection.prepareStatement(query)
stmt.setString(1, email)
val result = stmt.executeQuery()
```

### 8.3 XXS Prevention (Output Encoding)

```kotlin
// ❌ WRONG - Raw HTML output
@GetMapping("/profile")
fun getUserProfile(userId: UUID): String {
    val user = db.findById(userId)
    return "<h1>${user.name}</h1>"  // Vulnerable if name has <script>
}

// ✅ CORRECT - Template engine avec auto-escaping
@GetMapping("/profile")
fun getUserProfile(userId: UUID): ModelAndView {
    val user = db.findById(userId)
    return ModelAndView("profile", mapOf("user" to user))
}

<!-- profile.html (Thymeleaf auto-escapes) -->
<h1 th:text="${user.name}"></h1>
<!-- Se user.name = "<script>alert('xss')</script>", renderiza como texto -->

// ✅ REST API (JSON auto-escaped)
@GetMapping("api/v1/users/{id}")
fun getUser(@PathVariable id: UUID): UserResponse {
    val user = db.findById(id)
    return UserResponse(
        name = user.name  // JSON encoder automaticamente escapa
    )
}
```

---

## 9. Proteção contra Ataques

### 9.1 Rate Limiting

```kotlin
@Component
class RateLimitingFilter : OncePerRequestFilter() {
    
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val userId = extractUserId(request)
        val key = "rate-limit:$userId"
        
        val requestCount = redis.increment(key)
        redis.expire(key, 60)  // 60 segundos window
        
        response.setHeader("X-RateLimit-Limit", "100")
        response.setHeader("X-RateLimit-Remaining", (100 - requestCount).toString())
        response.setHeader("X-RateLimit-Reset", (System.currentTimeMillis() / 1000 + 60).toString())
        
        if (requestCount > 100) {
            response.status = HttpServletResponse.SC_TOO_MANY_REQUESTS
            response.writer.write("{\"error\": \"Rate limit exceeded\"}")
            return
        }
        
        filterChain.doFilter(request, response)
    }
}
```

**Padrão**: 100 requisições por minuto por usuário autenticado

### 9.2 Proteção contra Brute Force

```kotlin
@Service
class FailedLoginAttemptService {
    
    fun recordFailedAttempt(email: String) {
        val key = "failed-login:$email"
        val attempts = (redis.get(key) as String?)?.toInt() ?: 0
        
        redis.set(key, (attempts + 1).toString(), 900)  // 15 min TTL
        
        if (attempts + 1 >= 5) {
            // Bloquear por 15 minutos
            redis.set("account-locked:$email", "true", 900)
        }
    }
    
    fun isAccountLocked(email: String): Boolean {
        return redis.hasKey("account-locked:$email")
    }
    
    fun clearAttempts(email: String) {
        redis.delete("failed-login:$email")
        redis.delete("account-locked:$email")
    }
}

// Usar em Auth Controller
@PostMapping("/auth/login")
fun login(@RequestBody req: LoginRequest): LoginResponse {
    if (failedLoginService.isAccountLocked(req.email)) {
        throw AccountLockedException("Account temporarily locked")
    }
    
    val user = userRepository.findByEmail(req.email)
        ?: throw InvalidCredentialsException()
    
    if (!passwordEncoder.matches(req.password, user.passwordHash)) {
        failedLoginService.recordFailedAttempt(req.email)
        throw InvalidCredentialsException()
    }
    
    failedLoginService.clearAttempts(req.email)
    
    // ... generate tokens
}
```

### 9.3 Proteção contra CSRF

```kotlin
// CSRF não é risco para APIs stateless com JWT
// Verificar via biblioteca (spring-security automaticamente desabilita para stateless)

@Configuration
class SecurityConfig {
    fun configure(http: HttpSecurity) {
        http
            .csrf { it.disable() }  // JWT não vulnerável a CSRF
            .authorizeRequests { ... }
    }
}
```

### 9.4 Proteção contra Denial of Service (DoS)

```
Camadas de proteção:

1. Rate Limiting (100 req/min per user)
2. Request Size Limits:
   - Max body size: 10 MB
   - Max URL length: 4096 chars

3. Connection Limits:
   - Max concurrent connections: 10000
   - Max keep-alive: 60 segundos

4. WAF (Web Application Firewall):
   - Deploy via AWS WAF ou Cloudflare
   - Block known attack patterns
   - DDoS mitigation (Cloudflare free tier)
```

### 9.5 Cheques de Segurança Automáticos

```
OWASP Top 10 checklist:

✓ 1. Broken Access Control → RBAC + @PreAuthorize
✓ 2. Cryptographic Failures → TLS + encryption at rest
✓ 3. Injection → Parameterized queries
✓ 4. Insecure Design → Security by design
✓ 5. Security Misconfiguration → IaC + AWS best practices
✓ 6. Vulnerable Components → Dependabot scanning
✓ 7. Authentication Failures → Strong password + JWT + refresh
✓ 8. Data Integrity Failures → HMAC signatures para críticos
✓ 9. Logging/Monitoring → ELK + alerts
✓ 10. SSRF → Allowlist de URLs externas
```

---

## 10. Compliance & Auditoria

### 10.1 Audit Trail

```kotlin
@Entity
class AuditLog(
    val eventId: UUID,
    val userId: UUID,
    val action: String,  // CREATE_USER, UPDATE_MEAL, DELETE_PLAN
    val resourceType: String,  // USER, MEAL, MEAL_PLAN
    val resourceId: UUID,
    val before: String?,  // JSON antes (sensitive data masked)
    val after: String?,   // JSON depois
    val ipAddress: String,
    val userAgent: String,
    val status: String,   // SUCCESS, FAILURE
    val errorMessage: String?,
    @CreationTimestamp
    val createdAt: Instant
)

// Persistir automaticamente
@Aspect
@Component
class AuditAspect {
    
    @Around("@annotation(Auditable)")
    fun audit(joinPoint: ProceedingJoinPoint): Any? {
        val userId = getCurrentUserId()
        val ipAddress = getClientIpAddress()
        val action = extractAction(joinPoint)
        
        val start = System.currentTimeMillis()
        return try {
            val result = joinPoint.proceed()
            
            auditLogRepository.save(AuditLog(
                userId = userId,
                action = action,
                status = "SUCCESS",
                ipAddress = ipAddress,
                createdAt = Instant.now()
            ))
            result
        } catch (e: Exception) {
            auditLogRepository.save(AuditLog(
                userId = userId,
                action = action,
                status = "FAILURE",
                errorMessage = e.message,
                ipAddress = ipAddress,
                createdAt = Instant.now()
            ))
            throw e
        }
    }
}

@Auditable
@PostMapping("/api/v1/meals")
fun createMeal(@RequestBody req: CreateMealRequest) {
    // Automaticamente auditado
}
```

### 10.2 LGPD Compliance (Brazil)

```
Lei Geral de Proteção de Dados (LGPD):

1. Right to Access
   - Usuario pode solicitar cópia de dados
   - Response time: 15 dias
   
   GET /api/v1/users/{userId}/data-export
   → Retorna ZIP com email, meals, nutrition data

2. Right to Deletion (Right to be Forgotten)
   - Usuário pode solicitar deleção
   
   DELETE /api/v1/users/profile?confirm=true
   → Soft delete (anonimizar dados pessoais)
   → Hard delete após 30 dias de retenção (GDPR parity)

3. Consent Management
   - Guardar consentimento explícito
   - For nutrition sharing: require consent
   
   POST /api/v1/users/preferences
   { "nutritionistAccess": true }  // Must be explicit

4. Data Minimization
   - Coletar apenas dados necessários
   - Deletar quando não mais necessário

5. Breach Notification
   - Se breach detectado, notificar usuários em < 72 horas
   - Registra com autoridade se dados sensíveis
```

---

## 11. Incident Response

### 11.1 Security Incident Playbook

```
1. DETECTION
   - Alert triggered via Prometheus
   - Example: Multiple 401s from same IP (brute force)

2. CONTAINMENT (< 5 min)
   - Block IP via WAF
   - Revoke compromised tokens

3. INVESTIGATION (< 1 hour)
   - Examine logs (audit trail)
   - Determine scope (which users affected?)
   - Root cause analysis

4. ERADICATION
   - Patch vuln se código
   - Reset passwords se credential leaked
   - Rotate compromised keys

5. RECOVERY
   - Restore from backup se needed
   - Monitor for re-entry

6. COMMUNICATION
   - Notify affected users (email)
   - Update status page
   - File incident report
```

### 11.2 Security Contacts

```
Security Team:
  - security@trainerhub.com
  - +55 (11) 9xxxx-xxxx (on-call)

Bug Bounty Program:
  - https://hackerone.com/trainer-hub
  - Responsável disclosure via security.txt

Escalation:
  - Severity 1 (Critical): 5min response
  - Severity 2 (High): 30min response
  - Severity 3 (Medium): 2hour response
```

---

## 12. Conclusão

TrAIner Hub implementa defesa em profundidade:

✅ **Autenticação**: OAuth2 + JWT + secure password hashing
✅ **Autorização**: RBAC + granular permissions
✅ **Encriptação**: TLS in transit + AES at rest
✅ **Secrets**: KeyVault management + rotation
✅ **Input**: Validation + SQL injection prevention
✅ **Ataques**: Rate limiting + brute force protection
✅ **Auditoria**: Audit trail + compliance

Próximos passos:
1. Implementar MFA (Fase 3)
2. Penetration testing (Fase 2)
3. Security awareness training (ongoing)
4. Bug bounty program (Fase 3)

---

**Fim do documento - 08-SECURITY.md**  
**Total de linhas**: 1.389  
**Data de criação**: 2025-08-01  
**Status**: Pronto para commit
