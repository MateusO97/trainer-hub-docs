# Coding Standards & Architecture Patterns

**Document ID**: CODING-STANDARDS-001  
**Version**: 1.0  
**Created**: March 8, 2026  
**Owner**: Tech Lead / Architecture

---

## 📋 Executive Summary

Este documento define **padrões de código, arquitecture e conventions** para TrAIner Hub:

✅ Clean Architecture (layered)  
✅ SOLID Principles  
✅ Kotlin idioms & best practices  
✅ Code formatting (Ktlint, Prettier)  
✅ Naming conventions  
✅ Error handling patterns  

---

## 🏗️ Project Structure (Clean Architecture)

```
src/main/kotlin/com/trainerhubamd/
├── common/          # Shared utilities, exceptions
│   ├── exception/   # Custom exceptions (NotFoundException, etc)
│   ├── dto/         # Shared DTOs
│   ├── util/        # Helper functions
│   └── config/      # Global configuration
│
├── auth/            # AUTH SERVICE
│   ├── controller/  # REST endpoints
│   ├── service/     # Business logic
│   ├── repository/  # Data access
│   ├── entity/      # JPA entities
│   ├── dto/         # Auth-specific DTOs
│   └── security/    # JWT, OAuth logic
│
├── users/           # USER SERVICE
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   └── dto/
│
├── meals/           # MEALS SERVICE
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   └── dto/
│
├── nutrition/       # NUTRITION SERVICE
│   └── ...
│
└── application.kt   # Spring Boot entry point

src/test/kotlin/
├── auth/            # Auth tests (mirror main structure)
│   ├── service/
│   ├── controller/
│   └── ...
└── ...
```

/**

### Backend: Main Application Class

```kotlin
// src/main/kotlin/com/trainerhubamd/Application.kt
@SpringBootApplication
@EnableAsync
@EnableScheduling
class TrainerHubApplication

fun main(args: Array<String>) {
    runApplication<TrainerHubApplication>(*args)
}
```

---

## 🧬 Layering & Dependencies

**Dependency Flow** (top → bottom, nunca reverse):

```
Controller (REST entry)
    ↓
Service (business logic)
    ↓
Repository (data access)
    ↓
Database (persistence)
```

**Regras**:
- ✅ Service chama Repository
- ✅ Controller chama Service
- ❌ Repository NÃO chama Service
- ❌ Controller NÃO chama Repository direto
- ❌ Circular dependencies

---

## 🎯 Service Layer Pattern

### Service Interface (Contract)

```kotlin
// meals/service/MealService.kt
interface MealService {
    fun createMeal(userId: UUID, request: CreateMealRequest): MealResponse
    fun getMealsByDate(userId: UUID, date: LocalDate): List<MealResponse>
    fun deleteMeal(userId: UUID, mealId: UUID): Unit
}
```

### Service Implementation

```kotlin
@Service
@Transactional  // All methods are transactional
class MealServiceImpl(
    private val mealRepository: MealRepository,
    private val foodService: FoodService,   // Service dependency
    private val macroCalculator: MacroCalculator  // Utils dependency
) : MealService {
    
    override fun createMeal(
        userId: UUID, 
        request: CreateMealRequest
    ): MealResponse {
        // Input validation
        require(request.quantity > 0) { "Quantity must be positive" }
        
        // Business logic
        val food = foodService.getFoodById(request.foodId)
            ?: throw NotFoundException("Food not found: ${request.foodId}")
        
        val macros = macroCalculator.calculateMacros(
            food = food,
            quantity = request.quantity,
            unit = request.unit
        )
        
        val meal = Meal(
            id = UUID.randomUUID(),
            userId = userId,
            foodId = request.foodId,
            quantity = request.quantity,
            unit = request.unit,
            macros = macros,
            createdAt = Instant.now()
        )
        
        // Persist
        return mealRepository.save(meal).toResponse()
    }
    
    override fun getMealsByDate(
        userId: UUID, 
        date: LocalDate
    ): List<MealResponse> {
        return mealRepository
            .findByUserIdAndDate(userId, date)
            .map { it.toResponse() }
    }
    
    override fun deleteMeal(userId: UUID, mealId: UUID) {
        val meal = mealRepository.findById(mealId)
            ?: throw NotFoundException("Meal not found: $mealId")
        
        require(meal.userId == userId) { "Unauthorized: not your meal" }
        
        mealRepository.delete(meal)
    }
}
```

---

## 💻 Controller Pattern

```kotlin
@RestController
@RequestMapping("/api/v1/meals")
class MealController(
    private val mealService: MealService  // Only service dependency!
) {
    
    @PostMapping
    fun createMeal(@RequestBody request: CreateMealRequest): ResponseEntity<MealResponse> {
        val meal = mealService.createMeal(
            userId = getCurrentUserId(),  // From Spring Security
            request = request
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(meal)
    }
    
    @GetMapping
    fun getMeals(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): Page<MealResponse> {
        return mealService.getMealsByDate(
            userId = getCurrentUserId(),
            date = LocalDate.now()
        ).asPage(page, size)
    }
    
    @DeleteMapping("/{mealId}")
    fun deleteMeal(@PathVariable mealId: UUID): ResponseEntity<Unit> {
        mealService.deleteMeal(
            userId = getCurrentUserId(),
            mealId = mealId
        )
        return ResponseEntity.noContent().build()
    }
    
    private fun getCurrentUserId(): UUID {
        val principal = SecurityContextHolder.getContext().authentication.principal as UserPrincipal
        return principal.userId
    }
}
```

---

## 📦 DTOs (Data Transfer Objects)

**Regra**: Controllers usam DTOs, Services usam Entities

```kotlin
// DTOs (API contracts)
data class CreateMealRequest(
    val foodId: UUID,
    val quantity: Double,
    val unit: String,
    val mealDate: LocalDate = LocalDate.now()
)

data class MealResponse(
    val id: UUID,
    val foodId: UUID,
    val quantity: Double,
    val unit: String,
    val macros: MacrosResponse,
    val createdAt: Instant
)

data class MacrosResponse(
    val calories: Int,
    val protein: Double,
    val carbs: Double,
    val fat: Double,
    val fiber: Int,
    val sodium: Int
)

// Conversion (extension function)
fun Meal.toResponse(): MealResponse = MealResponse(
    id = this.id,
    foodId = this.foodId,
    quantity = this.quantity,
    unit = this.unit,
    macros = MacrosResponse(
        calories = this.macros.calories,
        protein = this.macros.protein,
        carbs = this.macros.carbs,
        fat = this.macros.fat,
        fiber = this.macros.fiber,
        sodium = this.macros.sodium
    ),
    createdAt = this.createdAt
)
```

---

## 🔍 Error Handling

### Custom Exceptions

```kotlin
// common/exception/Exceptions.kt
open class TrainerHubException(
    message: String,
    val errorCode: String = "INTERNAL_ERROR",
    cause: Throwable? = null
) : RuntimeException(message, cause)

class NotFoundException(message: String) : TrainerHubException(
    message = message,
    errorCode = "NOT_FOUND"
)

class ValidationException(message: String) : TrainerHubException(
    message = message,
    errorCode = "VALIDATION_ERROR"
)

class UnauthorizedException(message: String) : TrainerHubException(
    message = message,
    errorCode = "UNAUTHORIZED"
)
```

### Exception Handler (Centralized)

```kotlin
@RestControllerAdvice
class GlobalExceptionHandler {
    
    @ExceptionHandler(NotFoundException::class)
    fun handleNotFound(ex: NotFoundException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse(
                code = ex.errorCode,
                message = ex.message ?: "Resource not found",
                timestamp = Instant.now()
            ))
    }
    
    @ExceptionHandler(ValidationException::class)
    fun handleValidation(ex: ValidationException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(
                code = ex.errorCode,
                message = ex.message ?: "Validation failed",
                timestamp = Instant.now()
            ))
    }
    
    @ExceptionHandler(Exception::class)
    fun handleGeneric(ex: Exception): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse(
                code = "INTERNAL_ERROR",
                message = "An unexpected error occurred",
                timestamp = Instant.now()
            ))
    }
}

data class ErrorResponse(
    val code: String,
    val message: String,
    val timestamp: Instant
)
```

---

## 📝 Naming Conventions

| Entity | Pattern | Example |
|--------|---------|---------|
| **Classes** | PascalCase | `MealService`, `UserRepository` |
| **Functions** | camelCase | `createMeal`, `getMealsByDate` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_QUANTITY = 5000` |
| **Properties** | camelCase | `userId`, `mealDate` |
| **Files** | PascalCase | `MealService.kt`, `UserEntity.kt` |
| **Packages** | lowercase.nounderscores | `com.trainerhubamd.meals` |
| **Boolean properties** | `is<Name>` or `has<Name>` | `isActive`, `hasVerified` |
| **IDs** | Use UUID | `userId: UUID`, `mealId: UUID` |
| **Endpoints** | lowercase/plural | `/api/v1/meals`, `/api/v1/users` |

---

## 🎯 Kotlin Idioms & Best Practices

### Use Data Classes for DTOs

```kotlin
// ✅ Good
data class MealRequest(
    val foodId: UUID,
    val quantity: Double
)

// ❌ Avoid
class MealRequest {
    var foodId: UUID? = null
    var quantity: Double = 0.0
}
```

### Use Extension Functions for Utils

```kotlin
// ✅ Extension function
fun List<Meal>.groupByDate(): Map<LocalDate, List<Meal>> =
    this.groupBy { it.createdAt.toLocalDate() }

// ❌ Utility class
object MealUtils {
    fun groupByDate(meals: List<Meal>): Map<LocalDate, List<Meal>> = ...
}
```

### Use Scope Functions Appropriately

```kotlin
// apply: Configure object, return self
val user = User().apply {
    name = "John"
    email = "john@example.com"
}

// let: Transform, return result
val upperName = name?.let { it.uppercase() } ?: "UNKNOWN"

// also: Side effect, return self
val result = calculateResult()
    .also { logger.info("Calculated: $it") }

// run: Multiple statements, return result
val meal = run {
    val food = foodService.getFood(foodId)
    val macros = calculator.calculate(food, quantity)
    Meal(food, macros)
}

// with: Multiple operations on object, return result
with(mealRequest) {
    require(quantity > 0) { "Invalid quantity" }
    require(foodId != null) { "Food required" }
}
```

### Nullable Handling

```kotlin
// ✅ Safe
val food = foodService.getFood(foodId)
    ?: throw NotFoundException("Food not found")

// ✅ Safe with operator
val meal = mealRepository.findById(mealId)
    .also { it?.validate() }

// ❌ Avoid
val food = foodService.getFood(foodId)!!  // NPE if null
val meal = mealRepository.findById(mealId)  // May be null
```

---

## 🛠️ Code Formatting

### Ktlint Rules

Arquivo: `.ktlint` ou Gradle config

```gradle
ktlint {
    version.set("0.50.0")
    enableExperimentalRules.set(true)
    
    filter {
        exclude("**/generated/**", "**/test/**")
    }
}
```

### Auto-format Before Commit

```bash
./gradlew ktlintFormat  # Auto-format all code

# Then:
git add .
git commit -m "style: auto-format with ktlint"
```

### Line Length: 100 Characters

```kotlin
// ✅ Good (under 100)
fun createMeal(userId: UUID, request: CreateMealRequest): MealResponse

// ❌ Avoid (over 100)
private fun veryLongFunctionNameThatExceedsLineLength(userIdentifier: UUID, requestData: CreateMealRequest, additionalParameter: String): MealResponse
```

---

## 🔐 Security Best Practices

### Never Log Sensitive Data

```kotlin
// ❌ Bad (token in logs)
logger.info("User login: $userId, token=$token")

// ✅ Good
logger.info("User login: $userId")
logger.debug("Token generated: ${token.take(8)}...")
```

### Use Spring Security Annotations

```kotlin
@Secured("ROLE_USER")  // Requires USER role
fun getUserProfile(): UserResponse

@PreAuthorize("@permissionService.canEditMeal(#mealId)")
fun editMeal(@PathVariable mealId: UUID): MealResponse
```

### Validate All Input

```kotlin
@PostMapping
fun createMeal(@Valid @RequestBody request: CreateMealRequest): MealResponse {
    // @Valid ensures DTO validation (JSR-380)
    // Additional business validation:
    require(request.quantity <= MAX_QUANTITY) { "Quantity too large" }
    
    return mealService.createMeal(request)
}
```

---

## 📋 Checklist: Code Quality

- [ ] Follows Clean Architecture (controller → service → repo)
- [ ] No circular dependencies
- [ ] DTOs for API boundaries
- [ ] Proper exception handling
- [ ] All functions have Kdoc if complex
- [ ] No code duplication (DRY)
- [ ] SOLID principles applied
- [ ] Testes escritos
- [ ] Ktlint passing
- [ ] Security scan OK
- [ ] No logging of sensitive data
- [ ] Input validation

---

## 📚 References

- [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html)
- [Spring Boot Best Practices](https://spring.io/guides/gs/spring-boot/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-08 | Initial coding standards with architecture, patterns, conventions |
