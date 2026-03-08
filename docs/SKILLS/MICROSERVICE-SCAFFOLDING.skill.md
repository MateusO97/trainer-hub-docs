# SKILL: Microservice Scaffolding Generator

**Purpose**: Automatizar criação de estrutura padrão para novo microserviço  
**Categoria**: Automation / Code Generation  
**Aplicável a**: Todos os 10 microserviços (Auth, User, Meal, Food, Nutrition, Tracking, AI, Notification, Gateway, Mobile)

---

## 🎯 O Que Esta Skills Faz

Gera **estrutura completa de microserviço** em Kotlin/Spring Boot, seguindo:
- ✅ Clean Architecture (controller → service → repository)
- ✅ SOLID principles
- ✅ Project structure (src/, test/, docs/)
- ✅ Padrões do projeto (DTOs, custom exceptions, error handling)
- ✅ Testes básicos (unit + integration)
- ✅ Dockerização
- ✅ Documentação (README, API docs)

**Tempo economizado**: ~8 horas por serviço

---

## 📋 Como Usar Esta Skill

### Input Necessário

```yaml
serviceName: "auth"                    # Lowercase, sem espaços
displayName: "Authentication Service"  # Nome legível
description: "OAuth2 + JWT auth"       # Breve descrição
port: 8081                            # Default port (8080=gateway, 8081+=services)
mainFeatures:                         # Features principais
  - "OAuth2 login"
  - "JWT token generation"
  - "Token refresh mechanism"
database:                             # Tipo de DB
  - "PostgreSQL"                      # Primary DB
dependencies:                         # Libraries beyond basics
  - "spring-security"
  - "java-jwt"
```

### Output Gerado

```
src/
  main/
    kotlin/
      com/trainerhubamd/{serviceName}/
        controller/          # REST endpoints
          {Service}Controller.kt
          dto/              # Request/Response DTOs
            {Service}Request.kt
            {Service}Response.kt
        service/            # Business logic
          {Service}Service.kt
          I{Service}Service.kt  # Interface
        repository/         # Data access
          {Service}Repository.kt
        entity/             # Domain models
          {Entity}.kt
        exception/          # Error handling
          {Service}Exception.kt
        config/             # Configuration
          {Service}Config.kt
        {ServiceApplication.kt}  # Spring Boot main class
    resources/
      application.properties
      application-dev.properties
      application-prod.properties
      db/migration/
        V1__initial_schema.sql
  test/
    kotlin/
      com/trainerhubamd/{serviceName}/
        controller/
          {Service}ControllerTest.kt
        service/
          {Service}ServiceTest.kt
        repository/
          {Service}RepositoryTest.kt
        integration/
          {Service}IntegrationTest.kt
      resources/
        application-test.properties

config/
  build.gradle.kts              # Gradle config
  Dockerfile                    # Container config
  docker-compose.yml            # Local development
  sonarqube-configuration.xml   # Code quality

docs/
  README.md                     # Setup guide
  API.md                        # Endpoint documentation
  DEPLOYMENT.md                 # How to deploy
  ARCHITECTURE.md               # Service architecture
```

---

## 🔄 Workflow de Uso

### Preparação (10 min)

1. **Crie issue** (use ISSUE-TEMPLATES.md):
```markdown
[FEATURE] auth: implement OAuth2 + JWT authentication

OBJECTIVE: Secure authentication system
ACCEPTANCE CRITERIA:
  - [ ] POST /auth/login with email+password
  - [ ] JWT token (1h expiry)
  - [ ] Refresh token (7d expiry)
  - [ ] All tests ≥80%
  - [ ] Dockerizable
```

2. **Create branch**:
```bash
git checkout -b feature/AUTH-001-oauth2-jwt
```

### Geração do Scaffolding (5 min)

**Opção A: Interativa (recommended)**
```bash
# Executar scaffolding generator (skill)
./scripts/generate-microservice.sh

# Responde perguntas:
# ? Service name: auth
# ? Display name: Authentication Service
# ? Port: 8081
# ? Database: PostgreSQL
# ? Features: OAuth2, JWT, refresh token
# ? Create? (y/n): y

# Output:
# ✅ Created 25 files
# ✅ Generated tests (basic structure)
# ✅ Created Docker config
# ✅ Ready for implementation
```

**Opção B: Script com config**
```bash
./scripts/generate-microservice.sh --config ./auth-config.yaml
```

### Implementação (1-2 weeks)

1. **Preencha os TODOs** no código gerado:
```kotlin
// src/main/kotlin/auth/controller/AuthController.kt

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(private val authService: IAuthService) {
    
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<LoginResponse> {
        // TODO: Implement OAuth2 + email/password login
        // See CODING-STANDARDS.md for patterns
        return ResponseEntity.ok(authService.login(request))
    }
}
```

2. **Implemente a service**:
```kotlin
// src/main/kotlin/auth/service/AuthService.kt

@Service
@Transactional
class AuthService(
    @Autowired private val userRepo: UserRepository,
    @Autowired private val jwtProvider: JwtProvider
) : IAuthService {
    
    override fun login(request: LoginRequest): LoginResponse {
        // TODO: Validate credentials
        // TODO: Generate JWT + refresh token
        // TODO: Save token to database
        // TODO: Return response
        val user = userRepo.findByEmail(request.email)
            ?: throw NotFoundException("User ${request.email} not found")
        
        val accessToken = jwtProvider.generateToken(user.id, user.email)
        val refreshToken = jwtProvider.generateRefreshToken(user.id)
        
        return LoginResponse(accessToken, refreshToken)
    }
}
```

3. **Write tests**:
```kotlin
// src/test/kotlin/auth/service/AuthServiceTest.kt

class AuthServiceTest {
    private lateinit var authService: AuthService
    @Mock private lateinit var userRepo: UserRepository
    @Mock private lateinit var jwtProvider: JwtProvider
    
    @Test
    fun `should login user with valid credentials`() {
        // Arrange
        val user = User(id = UUID.randomUUID(), email = "user@test.com")
        whenever(userRepo.findByEmail("user@test.com")).thenReturn(user)
        whenever(jwtProvider.generateToken(any(), any())).thenReturn("token123")
        
        // Act
        val result = authService.login(LoginRequest("user@test.com", "password"))
        
        // Assert
        assertNotNull(result.accessToken)
        assertEquals("token123", result.accessToken)
    }
}
```

4. **Validate**:
```bash
./gradlew test              # Unit tests + coverage report
./gradlew integrationTest   # With database
./gradlew ktlintFormat      # Code style
```

5. **Commit progress**:
```bash
git commit -m "feat(auth): implement OAuth2 login endpoint

- Add POST /auth/login for email+password
- Validate credentials against user database
- Generate JWT token (1h expiry)
- Add JwtProvider utility for token creation
- 87% test coverage

Implements: #AUTH-001"
```

---

## 📂 Estrutura Gerada (Detalhada)

### Controller Layer

**File**: `src/main/kotlin/auth/controller/AuthController.kt`
```kotlin
@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    @Autowired private val service: IAuthService
) {
    
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<LoginResponse> {
        return ResponseEntity.ok(service.login(request))
    }
    
    @PostMapping("/refresh")
    fun refreshToken(@RequestBody request: RefreshTokenRequest): ResponseEntity<TokenResponse> {
        return ResponseEntity.ok(service.refreshToken(request.refreshToken))
    }
    
    @PostMapping("/logout")
    fun logout(@RequestHeader("Authorization") token: String): ResponseEntity<Void> {
        service.logout(token)
        return ResponseEntity.noContent().build()
    }
}
```

### DTO Layer

**Files**: `src/main/kotlin/auth/controller/dto/`

**Requests**:
```kotlin
data class LoginRequest(
    @Email val email: String,
    @NotBlank val password: String
)

data class RefreshTokenRequest(
    @NotBlank val refreshToken: String
)
```

**Responses**:
```kotlin
data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Long = 3600,  // 1 hour
    val user: UserDto
)

data class TokenResponse(
    val accessToken: String,
    val expiresIn: Long = 3600
)
```

### Service Layer

**Interface**: `src/main/kotlin/auth/service/IAuthService.kt`
```kotlin
interface IAuthService {
    fun login(request: LoginRequest): LoginResponse
    fun refreshToken(token: String): TokenResponse
    fun logout(token: String)
    fun validateToken(token: String): Boolean
}
```

**Implementation**: `src/main/kotlin/auth/service/AuthService.kt`
```kotlin
@Service
@Transactional
class AuthService(
    @Autowired private val userRepo: UserRepository,
    @Autowired private val jwtProvider: JwtProvider,
    @Autowired private val passwordEncoder: PasswordEncoder,
    @Autowired private val tokenBlacklist: TokenBlacklistRepo
) : IAuthService {
    
    override fun login(request: LoginRequest): LoginResponse {
        // Validate input
        require(request.email.isNotBlank()) { "Email required" }
        require(request.password.isNotBlank()) { "Password required" }
        
        // Find user
        val user = userRepo.findByEmail(request.email)
            ?: throw NotFoundException("User ${request.email} not found")
        
        // Check password
        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw UnauthorizedException("Invalid password")
        }
        
        // Generate tokens
        val accessToken = jwtProvider.generateToken(user.id, user.email, 3600)  // 1h
        val refreshToken = jwtProvider.generateRefreshToken(user.id, 604800)   // 7d
        
        // Save audit log
        auditLog.log("user_login", user.id, "Successful login from ${request.email}")
        
        return LoginResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            user = user.toDto()
        )
    }
    
    override fun validateToken(token: String): Boolean {
        return !tokenBlacklist.isBlacklisted(token) && jwtProvider.isValid(token)
    }
}
```

### Repository Layer

**File**: `src/main/kotlin/auth/repository/UserRepository.kt`
```kotlin
@Repository
interface UserRepository : JpaRepository<User, UUID> {
    fun findByEmail(email: String): User?
    fun existsByEmail(email: String): Boolean
}

@Repository
interface TokenBlacklistRepo : JpaRepository<TokenBlacklist, UUID> {
    fun isBlacklisted(token: String): Boolean
}
```

### Entity Layer

**File**: `src/main/kotlin/auth/entity/User.kt`
```kotlin
@Entity
@Table(name = "users")
data class User(
    @Id val id: UUID = UUID.randomUUID(),
    val email: String,
    val passwordHash: String,
    val firstName: String,
    val lastName: String,
    
    @Enumerated(EnumType.STRING)
    val role: UserRole = UserRole.USER,
    
    val isActive: Boolean = true,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
) {
    fun toDto() = UserDto(id, email, firstName, lastName, role)
}

enum class UserRole {
    USER, NUTRITIONIST, TRAINER, ADMIN
}
```

### Exception Handling

**File**: `src/main/kotlin/auth/exception/AuthExceptions.kt`
```kotlin
sealed class AuthException(message: String) : RuntimeException(message)

class NotFoundException(message: String) : AuthException(message)
class UnauthorizedException(message: String) : AuthException(message)
class TokenExpiredException(message: String) : AuthException(message)

@RestControllerAdvice
class AuthErrorHandler {
    @ExceptionHandler(NotFoundException::class)
    fun handleNotFound(ex: NotFoundException) = 
        ResponseEntity(ErrorResponse("404", ex.message), HttpStatus.NOT_FOUND)
    
    @ExceptionHandler(UnauthorizedException::class)
    fun handleUnauthorized(ex: UnauthorizedException) = 
        ResponseEntity(ErrorResponse("401", ex.message), HttpStatus.UNAUTHORIZED)
}
```

### Tests

**Unit Test**: `src/test/kotlin/auth/service/AuthServiceTest.kt`
```kotlin
@ExtendWith(MockitoExtension::class)
class AuthServiceTest {
    
    @Mock private lateinit var userRepo: UserRepository
    @Mock private lateinit var jwtProvider: JwtProvider
    @Mock private lateinit var passwordEncoder: PasswordEncoder
    
    @InjectMocks private lateinit var authService: AuthService
    
    @Test
    fun `should login successfully with valid credentials`() {
        // Arrange
        val user = User(
            id = UUID.randomUUID(),
            email = "user@test.com",
            passwordHash = "hashed_password"
        )
        
        whenever(userRepo.findByEmail("user@test.com")).thenReturn(user)
        whenever(passwordEncoder.matches("password", user.passwordHash)).thenReturn(true)
        whenever(jwtProvider.generateToken(user.id, user.email, any())).thenReturn("token123")
        
        // Act
        val result = authService.login(LoginRequest("user@test.com", "password"))
        
        // Assert
        assertEquals("token123", result.accessToken)
        assertNotNull(result.refreshToken)
    }
    
    @Test
    fun `should not login with wrong password`() {
        // Arrange
        val user = User(email = "user@test.com", passwordHash = "hashed")
        whenever(userRepo.findByEmail("user@test.com")).thenReturn(user)
        whenever(passwordEncoder.matches("wrong", user.passwordHash)).thenReturn(false)
        
        // Act & Assert
        assertThrows<UnauthorizedException> {
            authService.login(LoginRequest("user@test.com", "wrong"))
        }
    }
}
```

**Integration Test**: `src/test/kotlin/auth/AuthIntegrationTest.kt`
```kotlin
@SpringBootTest
@Testcontainers
class AuthIntegrationTest {
    
    @Autowired private lateinit var mockMvc: MockMvc
    @Autowired private lateinit var userRepo: UserRepository
    
    @Container
    companion object {
        val postgres = PostgreSQLContainer<Nothing>("postgres:15")
            .withDatabaseName("test_auth")
            .withUsername("test")
            .withPassword("test")
    }
    
    @Test
    fun `should login user via POST auth login`() {
        // Arrange
        val user = userRepo.save(User(
            email = "user@test.com",
            passwordHash = BCrypt.hashpw("password", BCrypt.gensalt())
        ))
        
        // Act
        val response = mockMvc.perform(
            post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"email":"user@test.com","password":"password"}""")
        ).andExpect(status().isOk)
            .andReturn().response.contentAsString
        
        // Assert
        val json = JSONObject(response)
        assertNotNull(json.getString("accessToken"))
    }
}
```

---

## 🚀 Commands Úteis

```bash
# Generate new microservice
./scripts/generate-microservice.sh

# Generate with specific config
./scripts/generate-microservice.sh --config ./services/auth/config.yaml

# Generate multiple services (batch)
./scripts/generate-microservice.sh --batch ./wave1-services.yaml

# Build specific service
./gradlew :services:auth:build

# Test specific service
./gradlew :services:auth:test
./gradlew :services:auth:integrationTest

# Run service locally
./gradlew :services:auth:bootRun --args='--spring.profiles.active=dev'

# Docker
docker build -f services/auth/Dockerfile -t trainer-hub/auth:latest .
docker-compose -f services/auth/docker-compose.yml up
```

---

## ✅ Validation Checklist

Após gerar scaffolding, verifique:

- [ ] Build error-free: `./gradlew :services:auth:build`
- [ ] No IDE warnings in generated code
- [ ] Tests compile and run: `./gradlew :services:auth:test`
- [ ] Dockerfile builds: `docker build -f services/auth/Dockerfile ...`
- [ ] README is clear and complete
- [ ] API documentation is generated
- [ ] No hardcoded values (use properties/environment)
- [ ] Follows CODING-STANDARDS.md patterns
- [ ] README-ENGINEERING-STANDARDS.md compliance

---

## 🔁 Reutilização em Todos os 10 Serviços

Esta skill economiza tempo em cada um dos 10 serviços:

| Serviço | Scaffolding | Impl | Tests | Deploy | Total |
|---------|-----------|------|-------|--------|-------|
| Auth | 0.5h | 5h | 2h | 1h | 8.5h |
| User | 0.5h | 4h | 2h | 1h | 7.5h |
| Food | 0.5h | 3h | 1.5h | 1h | 6h |
| Meal | 0.5h | 5h | 2h | 1h | 8.5h |
| Nutrition | 0.5h | 4h | 1.5h | 1h | 7h |
| Tracking | 0.5h | 4h | 1.5h | 1h | 7h |
| AI | 0.5h | 6h | 2h | 1h | 9.5h |
| Notification | 0.5h | 3h | 1.5h | 1h | 6h |
| Gateway | 0.5h | 3h | 1.5h | 1h | 6h |
| Mobile | 0.5h | 8h | 3h | 2h | 13.5h |
| **TOTAL** | **5h** | **45h** | **18.5h** | **10h** | **78.5h** |

**Sem skill**: ~90-100h (muito boilerplate repetido)
**Com skill**: ~78.5h (scaffold automático = 11.5h saved!)

---

## 📌 Próximas Steps

1. ✅ Create this SKILL document (você está lendo)
2. ⏳ Implement ./scripts/generate-microservice.sh
3. ⏳ Test com Auth service
4. ⏳ Refine baseado em feedback

---

**Status**: Template completo, pronto para ser implementado como script  
**Owner**: DevOps / Tech Lead  
**Version**: 1.0
