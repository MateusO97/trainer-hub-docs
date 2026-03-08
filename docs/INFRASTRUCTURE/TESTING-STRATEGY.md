# Testing Strategy & Coverage Standards

**Document ID**: TESTING-STRATEGY-001  
**Version**: 1.0  
**Created**: March 8, 2026  
**Owner**: QA Lead / Engineering Manager

---

## 📋 Executive Summary

Este documento define a **estratégia de testes** para TrAIner Hub:

✅ 3 níveis de testes (unit, integration, E2E)  
✅ Cobertura mínima de 80%  
✅ Pirâmide de testes invertida (muitos unit, alguns E2E)  
✅ Testes em pipeline CI/CD  
✅ Performance & load testing pré-release  

---

## 🔺 Test Pyramid

```
                     ▲
                    ╱ ╲
                   ╱   ╲              E2E Tests (10%)
                  ╱ E2E ╲             - User journeys
                 ╱       ╲            - Full stack
                ╱─────────╲
               ╱           ╲
              ╱             ╲         Integration Tests (30%)
             ╱ Integration  ╲        - API + DB
            ╱                ╲       - Service collaboration
           ╱──────────────────╲
          ╱                    ╲
         ╱                      ╲    Unit Tests (60%)
        ╱        Unit Tests     ╲   - Logic, helpers
       ╱                         ╲  - Fast, isolated
      ╱──────────────────────────╲
     ╱_____________________________╲

     Fast ≈ 100ms       Medium ≈ 1s       Slow ≈ 30s+
     Cheap (compute)    Moderate           Expensive
```

**Distribution por tipo**:
- **60%**: Unit tests (< 100ms each)
- **30%**: Integration tests (< 1s each)
- **10%**: E2E tests (< 30s each)

---

## 📊 Coverage Standards

| Métrica | Target | Tool |
|---------|--------|------|
| **Line Coverage** | ≥ 80% | JaCoCo (Kotlin/Java) |
| **Branch Coverage** | ≥ 75% | JaCoCo |
| **Critical Path** | 100% | Manual review |
| **Public APIs** | 100% | Enforced + linting |
| **Exception Handlers** | 100% | Code inspection |
| **Buggy Code** | 100% | By definition |

**Exemptions**:
- ❌ `@Configuration` classes (setup only)
- ❌ `@Generated` code (Lombok, protobuf)
- ❌ Integration point stubs
- ✅ Tudo mais deve ter cobertura

---

## 1️⃣ Unit Tests

**Definição**: Testar uma unidade isolada com mocks de dependências.

### Qual Testar?
```
✅ TESTE:
- Helper functions / utils
- Business logic em services
- Validators & converters
- Error handling
- Edge cases

❌ NÃO TESTE:
- Trivial getters/setters
- Framework code (@RequestMapping, @Transactional)
- Dependencies externas (mocke em integration tests)
```

### Exemplo: Kotlin + JUnit5 + Mockito

**Código a testar** (src/main/kotlin/meal/MacroCalculator.kt):
```kotlin
class MacroCalculator {
    fun calculateMacros(food: Food, quantity: Double, unit: String): Macros {
        val normalizedQuantity = when (unit) {
            "g" -> quantity / 100.0
            "ml" -> quantity / 100.0
            "oz" -> quantity * 28.35 / 100.0
            "cup" -> quantity * 240 / 100.0
            else -> throw IllegalArgumentException("Unknown unit: $unit")
        }
        
        return Macros(
            calories = (food.caloriesPer100 * normalizedQuantity).toInt(),
            protein = (food.proteinPer100 * normalizedQuantity).round(1),
            carbs = (food.carbsPer100 * normalizedQuantity).round(1),
            fat = (food.fatPer100 * normalizedQuantity).round(1)
        )
    }
}
```

**Testes unitários** (src/test/kotlin/meal/MacroCalculatorTest.kt):
```kotlin
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals

class MacroCalculatorTest {
    private val calculator = MacroCalculator()
    
    @Test
    fun `calculateMacros with grams returns correct values`() {
        // Arrange
        val chicken = Food(
            id = "chicken",
            caloriesPer100 = 165.0,
            proteinPer100 = 31.0,
            carbsPer100 = 0.0,
            fatPer100 = 3.6
        )
        
        // Act
        val result = calculator.calculateMacros(chicken, 200.0, "g")
        
        // Assert
        assertEquals(330, result.calories)
        assertEquals(62.0, result.protein)
        assertEquals(0.0, result.carbs)
        assertEquals(7.2, result.fat)
    }
    
    @Test
    fun `calculateMacros with ounces converts correctly`() {
        val egg = Food(
            id = "egg",
            caloriesPer100 = 155.0,
            proteinPer100 = 13.0,
            carbsPer100 = 1.1,
            fatPer100 = 11.0
        )
        
        // 1 oz = 28.35g
        val result = calculator.calculateMacros(egg, 2.0, "oz")
        
        assertEquals(88, result.calories)  // 155 * 2 * 28.35 / 100
        assertEquals(7.4, result.protein)
    }
    
    @Test
    fun `calculateMacros with invalid unit throws exception`() {
        val food = Food(id = "food", caloriesPer100 = 100.0, ...)
        
        assertThrows<IllegalArgumentException> {
            calculator.calculateMacros(food, 100.0, "invalidUnit")
        }
    }
    
    @Test
    fun `calculateMacros with zero quantity returns zero macros`() {
        val food = Food(id = "food", ...)
        
        val result = calculator.calculateMacros(food, 0.0, "g")
        
        assertEquals(0, result.calories)
        assertEquals(0.0, result.protein)
    }
}
```

**Executar**:
```bash
./gradlew test                  # Run all tests
./gradlew test --tests MacroCalculatorTest  # Run specific test class
./gradlew test --tests "*MacroCalculator*"  # Run by pattern
```

---

## 2️⃣ Integration Tests

**Definição**: Testar múltiplos componentes juntos (API + DB, Service + Cache).

### Exemplo: Spring Boot + TestContainers

**Código a testar** (src/main/kotlin/meal/MealService.kt):
```kotlin
@Service
class MealService(
    private val mealRepository: MealRepository,
    private val foodService: FoodService,
    private val macroCalculator: MacroCalculator
) {
    @Transactional
    fun createMeal(userId: UUID, request: CreateMealRequest): MealResponse {
        val food = foodService.getFoodById(request.foodId) 
            ?: throw NotFoundException("Food not found")
        
        val macros = macroCalculator.calculateMacros(
            food, request.quantity, request.unit
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
        
        mealRepository.save(meal)
        
        return meal.toResponse()
    }
}
```

**Teste de integração** (src/test/kotlin/meal/MealServiceIntegrationTest.kt):
```kotlin
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers

@SpringBootTest
@Testcontainers
class MealServiceIntegrationTest {
    companion object {
        @Container
        val postgresContainer = PostgreSQLContainer<Nothing>("postgres:15-alpine")
        
        @DynamicPropertySource
        @JvmStatic
        fun configureProperties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url", postgresContainer::getJdbcUrl)
            registry.add("spring.datasource.username", postgresContainer::getUsername)
            registry.add("spring.datasource.password", postgresContainer::getPassword)
        }
    }
    
    @Autowired
    private lateinit var mealService: MealService
    
    @Autowired
    private lateinit var mealRepository: MealRepository
    
    @Autowired
    private lateinit var foodRepository: FoodRepository
    
    @Test
    fun `createMeal persists to database and returns response`() {
        // Arrange: Setup food in DB
        val chicken = Food(
            id = UUID.randomUUID(),
            name = "Chicken Breast",
            caloriesPer100 = 165.0,
            proteinPer100 = 31.0
        )
        foodRepository.save(chicken)
        
        val userId = UUID.randomUUID()
        val request = CreateMealRequest(
            foodId = chicken.id,
            quantity = 200.0,
            unit = "g"
        )
        
        // Act
        val response = mealService.createMeal(userId, request)
        
        // Assert
        assertEquals(chicken.id, response.foodId)
        assertEquals(330, response.macros.calories)
        
        // Verify persistence
        val savedMeal = mealRepository.findById(response.id)
        assertNotNull(savedMeal)
        assertEquals(userId, savedMeal.userId)
    }
    
    @Test
    fun `createMeal throws NotFoundException when food missing`() {
        val request = CreateMealRequest(
            foodId = UUID.randomUUID(),  // Non-existent
            quantity = 200.0,
            unit = "g"
        )
        
        assertThrows<NotFoundException> {
            mealService.createMeal(UUID.randomUUID(), request)
        }
    }
}
```

**Executar**:
```bash
./gradlew integrationTest   # Run integration tests only
./gradlew test              # Run all tests (unit + integration)
```

---

## 3️⃣ E2E Tests

**Definição**: Testar fluxo completo desde API até database, como um usuário real.

### Exemplo: Spring Boot + MockMvc

```kotlin
@SpringBootTest
@AutoConfigureMockMvc
class MealEndpointE2ETest {
    @Autowired
    private lateinit var mockMvc: MockMvc
    
    @Autowired
    private lateinit var mealRepository: MealRepository
    
    @Test
    fun `POST /meals creates meal with correct status code`() {
        // Act
        val response = mockMvc.perform(
            post("/api/v1/meals")
                .header("Authorization", "Bearer $validToken")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "foodId": "550e8400-e29b-41d4-a716-446655440000",
                        "quantity": 200,
                        "unit": "g"
                    }
                """.trimIndent())
        )
        
        // Assert
        response
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.macros.calories").value(330))
            .andDo(print())
    }
    
    @Test
    fun `GET /meals returns user's meals with pagination`() {
        // Setup: Create test meals
        repeat(5) {
            val meal = Meal(
                id = UUID.randomUUID(),
                userId = currentUser.id,
                foodId = UUID.randomUUID(),
                quantity = 100.0,
                unit = "g"
            )
            mealRepository.save(meal)
        }
        
        // Act
        val response = mockMvc.perform(
            get("/api/v1/meals?page=0&size=10")
                .header("Authorization", "Bearer $validToken")
        )
        
        // Assert
        response
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(5))
            .andExpect(jsonPath("$.totalElements").value(5))
    }
}
```

---

## 🔄 Test Execution in CI/CD

**GitHub Actions Workflow** (.github/workflows/test.yml):

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          distribution: 'temurin'
      
      - name: Run unit tests
        run: ./gradlew test -x integrationTest
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./build/reports/jacoco/test/jacocoTestReport.xml
          flags: unittest
  
  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup JDK 21
        uses: actions/setup-java@v3
      
      - name: Run integration tests
        run: ./gradlew integrationTest
  
  coverage-check:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    steps:
      - name: Check coverage
        run: |
          coverage=$(cat ./build/reports/jacoco/test/jacocoTestReport.xml | grep -oP 'covered="\K[^"]+')
          if (( coverage < 80 )); then
            echo "Coverage $coverage% is below 80%"
            exit 1
          fi
```

**Execução**:
```bash
# Local
./gradlew test                    # All tests
./gradlew test --maxParallelForks 4  # Parallel execution

# CI/CD
GitHub Actions → test + coverage reports
```

---

## 🎯 Testing Standards

### Unit Tests

| Aspecto | Padrão |
|---------|--------|
| **Nomeação** | `test<Feature><Scenario>` ou `<Feature>_<Scenario>` |
| **Duração** | < 100ms (parallelizable) |
| **Isolamento** | 100% (mocks de dependencies) |
| **Coverage** | ≥ 80% por classe |
| **Exemplo** | `calculateMacros_withGrams_returnsCorrectValues` |

### Integration Tests

| Aspecto | Padrão |
|---------|--------|
| **Nomeação** | `test<Feature><Scenario>` (com DB/external systems) |
| **Duração** | < 1s cada (build containers once) |
| **Setup** | TestContainers para DB, cache, message broker |
| **Cleanup** | Automático (container lifecycle) |
| **Coverage** | > 75% (pode usar parametrized) |

### E2E Tests

| Aspecto | Padrão |
|---------|--------|
| **Nomeação** | `test<UserFlow><Scenario>` |
| **Duração** | < 10s cada |
| **Setup** | Real API, real data |
| **Scope** | Critical user journeys (auth, meal logging) |
| **Count** | ~10-20 key scenarios |

---

## 📋 Test Checklist (Pre-Push)

- [ ] Localmente: `./gradlew test` passa
- [ ] Coverage report gerado: `./build/reports/jacoco/`
- [ ] Coverage ≥ 80% (ou justificado)
- [ ] Sem testes skipped (@Disabled, @Ignore)
- [ ] Testes executados em CI/CD (não commitados com failures)
- [ ] Test names são descritivos
- [ ] Edge cases cobertos
- [ ] Nenhum hardcoded data (use fixtures, builders)

---

## 📚 References

- [JUnit 5](https://junit.org/junit5/)
- [Mockito](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [TestContainers](https://www.testcontainers.org/)
- [Spring Boot Testing](https://spring.io/guides/gs/testing-web/)
- [Testing Best Practices](https://google.github.io/eng-practices/testing/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-08 | Initial testing strategy with unit, integration, E2E examples |
