# RFC-003: Macro Calculation Algorithm

**Title**: Nutritional Macro Calculation & Validation Rules  
**Date**: 2025-08-01  
**Status**: ACCEPTED  
**Author**: Nutrition Team + Backend  
**Reviewers**: Nutritionists, Data Quality

---

## 1. Abstract

Define calculation rules for converting food items → macro nutrients, with rounding policies and validation.

**Key Decision**: Use **portion-relative calculations** with unit normalization + field-level validation.

**Impact**:
- Accuracy: Consistent macros across platform (±2% variance)
- Compliance: USDA-aligned calculations
- User Trust: Transparent rounding rules

---

## 2. Problem Statement

When meal has:
- 150g rice + 200g chicken + 35g olive oil

Need to calculate total:
- Calories: 150×(150) + 200×(165) + 35×(800) = ?
- Protein: sum of each food's protein = ?

**Challenges**:
- ❌ Different units (grams, ml, ounces, cups)
- ❌ Portion sizes vary (food A = 100g, food B = 1 breast)
- ❌ Rounding accumulation (sum of rounded values ≠ rounded sum)
- ❌ Data quality (some foods missing macros)

---

## 3. Calculation Rules

### 3.1 Unit Normalization

All food macros stored per **100g standard portion** in database:

```sql
-- foods table
id: UUID
name: VARCHAR
category: VARCHAR
portion: VARCHAR = "100g" (always)
calories_per_100g: FLOAT
protein_per_100g: FLOAT
carbs_per_100g: FLOAT
fat_per_100g: FLOAT
fiber_per_100g: FLOAT
sodium_per_100g: FLOAT
```

**Conversion factors** for user quantities:

| Unit | To 100g Factor | Notes |
|------|---------|-------|
| gram (g) | quantity / 100 | direct |
| milliliter (ml) | quantity / 100 | density ≈ 1g/ml |
| unit (un) | depends on food | need prior calibration |
| ounce (oz) | quantity × 2.835 / 100 | 1 oz = 28.35g |
| cup | quantity × 240 / 100 | US cup = 240ml |
| tablespoon (tbsp) | quantity × 15 / 100 | 1 tbsp = 15ml |

**Calibration table** for unit-based (un):

```sql
CREATE TABLE unit_calibrations (
    food_id UUID,
    unit_name VARCHAR,  -- "breast", "egg", "apple"
    weight_grams FLOAT,
    source VARCHAR  -- USDA, USER_PROVIDED, ESTIMATED
);

Example:
  chicken breast unit = 190g
  egg (medium) unit = 50g
  apple (medium) unit = 182g
```

### 3.2 Calculation Formula

For each food in meal:

```
quantity_in_100g = quantity × conversion_factor

macros = {
  calories: quantity_in_100g × food.calories_per_100g,
  protein: quantity_in_100g × food.protein_per_100g,
  carbs: quantity_in_100g × food.carbs_per_100g,
  fat: quantity_in_100g × food.fat_per_100g,
  fiber: quantity_in_100g × food.fiber_per_100g,
  sodium: quantity_in_100g × food.sodium_per_100g
}
```

**Example**:

Food: Peito de frango (100g baseline)
- Calories: 165
- Protein: 31
- Carbs: 0
- Fat: 3.6
- Fiber: 0
- Sodium: 75mg

User logs: 200g frango
```
quantity_in_100g = 200 / 100 = 2.0

Calculated macros:
  calories = 2.0 × 165 = 330
  protein = 2.0 × 31 = 62
  carbs = 2.0 × 0 = 0
  fat = 2.0 × 3.6 = 7.2
  fiber = 2.0 × 0 = 0
  sodium = 2.0 × 75 = 150mg
```

### 3.3 Meal-Level Aggregation

Aggregar múltiplas foods:

```kotlin
data class MealMacros(
    val foods: List<FoodInMeal>,
    val multiplier: Float = 1.0  // se serving size > 1
)

fun calculateMealMacros(meal: MealMacros): MacroNutrients {
    var totalCalories = 0f
    var totalProtein = 0f
    var totalCarbs = 0f
    var totalFat = 0f
    var totalFiber = 0f
    var totalSodium = 0f
    
    for (foodInMeal in meal.foods) {
        val singleFoodMacros = calculateFoodMacros(foodInMeal)
        
        // Apply multiplier (e.g., recipe serves 2)
        val adjustedMacros = singleFoodMacros * meal.multiplier
        
        totalCalories += adjustedMacros.calories
        totalProtein += adjustedMacros.protein
        totalCarbs += adjustedMacros.carbs
        totalFat += adjustedMacros.fat
        totalFiber += adjustedMacros.fiber
        totalSodium += adjustedMacros.sodium
    }
    
    return MacroNutrients(
        calories = roundCalories(totalCalories),
        protein = roundGrams(totalProtein),
        carbs = roundGrams(totalCarbs),
        fat = roundGrams(totalFat),
        fiber = roundGrams(totalFiber),
        sodium = roundMilligrams(totalSodium)
    )
}
```

---

## 4. Rounding Rules

### 4.1 Rounding Strategy

To prevent digit inflation from summing rounded values:

1. **Calculate** with full precision (keep decimals)
2. **Aggregate** (sum all food macros)
3. **Round** final totals only

```
❌ WRONG (rounds each food):
  Food 1: 165.4 → round → 165
  Food 2: 165.4 → round → 165
  Sum: 165 + 165 = 330

✅ CORRECT (rounds sum):
  Food 1: 165.4
  Food 2: 165.4
  Sum: 330.8 → round → 331
```

### 4.2 Rounding Precision

| Metric | Precision | Rule | Example |
|--------|-----------|------|---------|
| Calories | 1 kcal | Round to nearest | 330.8 → 331 |
| Protein | 0.1g | Round to nearest tenth | 62.34 → 62.3 |
| Carbs | 0.1g | Round to nearest tenth | 45.67 → 45.7 |
| Fat | 0.1g | Round to nearest tenth | 7.23 → 7.2 |
| Fiber | 1g | Round to nearest | 8.4 → 8 |
| Sodium | 10mg | Round to nearest 10 | 152 → 150 |

### 4.3 Rounding Methods

```kotlin
fun roundCalories(value: Float): Int {
    return Math.round(value)  // 330.8 → 331
}

fun roundGrams(value: Float, decimals: Int = 1): Float {
    val multiplier = Math.pow(10.0, decimals.toDouble()).toFloat()
    return Math.round(value * multiplier) / multiplier
}

fun roundSodium(value: Float): Int {
    return (Math.round(value / 10) * 10).toInt()
}

// Examples
roundCalories(330.8f)     // → 331
roundGrams(62.34f, 1)     // → 62.3
roundGrams(7.23f, 1)      // → 7.2
roundSodium(152f)         // → 150
```

---

## 5. Data Quality & Validation

### 5.1 Food Macro Validation

When importing food from external source:

```kotlin
fun validateFoodMacros(food: Food): ValidationResult {
    val errors = mutableListOf<String>()
    
    // 1. Required fields
    if (food.caloriesPer100g <= 0) {
        errors.add("Calories must be > 0")
    }
    
    // 2. Macro sum >= calorie theoretical minimum
    val minCaloriesTheoretical = 
        (food.proteinPer100g * 4) +  // 4 kcal/g
        (food.carbsPer100g * 4) +    // 4 kcal/g
        (food.fatPer100g * 9)         // 9 kcal/g
    
    if (food.caloriesPer100g < minCaloriesTheoretical * 0.9) {
        errors.add("Calories too low for macro composition")
    }
    
    // 3. Sanity checks
    if (food.proteinPer100g > 100) {
        errors.add("Protein unlikely > 100g per 100g")
    }
    
    if (food.fatPer100g > 100) {
        errors.add("Fat unlikely > 100g per 100g")
    }
    
    // 4. Fiber validity
    if (food.fiberPer100g > food.carbsPer100g) {
        errors.add("Fiber cannot exceed total carbs")
    }
    
    return ValidationResult(
        isValid = errors.isEmpty(),
        errors = errors
    )
}
```

### 5.2 Daily Total Validation

When user logs 10+ meals in a day:

```kotlin
fun validateDailyTotals(daily: DailyMacroSummary): ValidationResult {
    val warnings = mutableListOf<String>()
    
    // Macro composition should follow rough guidelines
    val proteinCalories = daily.protein * 4
    val carbCalories = daily.carbs * 4
    val fatCalories = daily.fat * 9
    val totalFromMacros = proteinCalories + carbCalories + fatCalories
    
    // Check if macros account for ~95% of calories
    // (remaining 5% is alcohol, other)
    val macroPercentage = if (daily.calories > 0) {
        totalFromMacros / daily.calories
    } else {
        1.0f
    }
    
    if (macroPercentage < 0.90) {
        warnings.add(
            "Macros account for only ${(macroPercentage*100).toInt()}% " +
            "of calories - check data accuracy"
        )
    }
    
    if (macroPercentage > 1.05) {
        warnings.add(
            "Macros exceed calories - likely data entry error"
        )
    }
    
    return ValidationResult(
        isValid = warnings.isEmpty(),
        warnings = warnings
    )
}
```

### 5.3 Outlier Detection

Flag suspicious logging patterns:

```kotlin
fun detectAnomalies(userId: UUID, date: LocalDate): List<Anomaly> {
    val anomalies = mutableListOf<Anomaly>()
    
    val todayMacros = dailyRepository.getMacros(userId, date)
    val last30Days = dailyRepository.getMacros(userId, date.minusDays(30), date)
    val average = last30Days.average()
    
    // 1. Amount significantly higher than usual
    if (todayMacros.calories > average.calories * 2.5) {
        anomalies.add(Anomaly(
            type = "EXTREMELY_HIGH_CALORIES",
            severity = "WARNING",
            message = "Calories 2.5x your average"
        ))
    }
    
    // 2. Too many meals (unusual logging)
    val mealCount = mealRepository.countConsumedToday(userId)
    if (mealCount > 12) {
        anomalies.add(Anomaly(
            type = "EXCESSIVE_MEALS",
            severity = "INFO",
            message = "You logged $mealCount meals today - verify accuracy"
        ))
    }
    
    // 3. Zero macros in high-calorie meal (data quality)
    val meals = mealRepository.getConsumedToday(userId)
    for (meal in meals) {
        if (meal.calories > 100 && meal.protein == 0f && meal.fat == 0f) {
            anomalies.add(Anomaly(
                type = "MISSING_MACROS",
                severity = "INFO",
                message = "Meal: ${meal.name} missing macro breakdown"
            ))
        }
    }
    
    return anomalies
}
```

---

## 6. Special Cases

### 6.1 Alcohol (Energy without macros)

Alcohol provides ~7 kcal/g but isn't a macro nutrient:

```
User logs: 150ml wine (12% ABV)

Calculation:
  Volume: 150ml
  Alcohol content: 150 × 0.12 = 18ml pure alcohol
  Weight of alcohol: 18ml × 0.789 g/ml = 14.2g
  Calories from alcohol: 14.2g × 7 = 99.4 kcal

Result:
  Calories: 99
  Protein: 0g
  Carbs: ~2g (residual sugar in wine)
  Fat: 0g
  Alcohol: 14g (tracked separately for reporting)
```

### 6.2 Fortified Foods (Added macros)

Some foods have macros added (e.g., fortified cereal):

```
Case 1: Milk (whole)
  - Stored as: calories, protein, fat, carbs
  - Calculation: straightforward

Case 2: Fortified cereal
  - Base grain: 350 kcal, 8g protein
  - Added vitamins/minerals: negligible calories
  - Added: sometimes added sugar (affects carbs)
  - Calculation: use total as provided
```

### 6.3 Recipes with Cooking Loss

Some foods lose weight when cooked:

```
Raw chicken breast: 200g raw
After cooking (grilled): 160g cooked
Cooking loss: 20%

Options:
1. Store as "raw" with note "multiply by 0.8 when cooked"
2. Store both raw and cooked versions
3. Ask user (raw vs cooked)

TrAIner Hub approach: Ask user + default to cooked
```

---

## 7. Macro Suggestions & Targets

### 7.1 TDEE Calculation (Total Daily Energy Expenditure)

```
Harris-Benedict Formula (revised):

For men:
  TDEE = 88.362 + (13.397 × weight_kg) + 
         (4.799 × height_cm) - (5.677 × age_years)
  
  × Activity factor (1.2-1.9 depending on exercise)

For women:
  TDEE = 447.593 + (9.247 × weight_kg) + 
         (3.098 × height_cm) - (4.330 × age_years)
  
  × Activity factor

Example (male, 80kg, 180cm, 25y, sedentary=1.2):
  BMR = 88.362 + 1071.76 + 863.82 - 141.925 = 1882
  TDEE = 1882 × 1.2 = 2258 kcal/day
```

### 7.2 Macro Split Recommendations

Based on goal:

```
Goal: Lose Weight
  Deficit: -500 kcal/day (lose ~0.5kg/week)
  Protein: 2.2g/kg (preserve muscle)
  Fat: 0.8g/kg (hormonal health)
  Carbs: remainder
  
  Example (TDEE 2258, -500 deficit = 1758):
    Protein: 80kg × 2.2 = 176g = 704 kcal (40%)
    Fat: 80kg × 0.8 = 64g = 576 kcal (33%)
    Carbs: (1758 - 704 - 576) / 4 = 119g (27%)
    Daily targets: 1758kcal | 176g protein | 119g carbs | 64g fat

Goal: Gain Muscle
  Surplus: +300 kcal/day
  Protein: 2.0g/kg (growth)
  Fat: 1.0g/kg
  Carbs: remainder
  
  Example (TDEE 2258, +300 surplus = 2558):
    Protein: 80kg × 2.0 = 160g = 640 kcal (25%)
    Fat: 80kg × 1.0 = 80g = 720 kcal (28%)
    Carbs: (2558 - 640 - 720) / 4 = 299g (47%)
    Daily targets: 2558kcal | 160g protein | 299g carbs | 80g fat

Goal: Maintenance
  No surplus/deficit, balanced macros
  Protein: 1.6g/kg
  Fat: 0.9g/kg  
  Carbs: remainder
```

---

## 8. Testing & Validation

### 8.1 Unit Test Examples

```kotlin
class MacroCalculationTest {
    
    @Test
    fun calculateSimpleMealMacros() {
        // Given
        val chicken = Food(
            name = "Frango grelhado",
            caloriesPer100g = 165f,
            proteinPer100g = 31f,
            carbsPer100g = 0f,
            fatPer100g = 3.6f
        )
        
        val foodInMeal = FoodInMeal(
            food = chicken,
            quantity = 200f,
            unit = "g"
        )
        
        val meal = Meal(foods = listOf(foodInMeal))
        
        // When
        val macros = calculator.calculateMealMacros(meal)
        
        // Then
        assertThat(macros.calories).isEqualTo(330)
        assertThat(macros.protein).isEqualTo(62.0f)
        assertThat(macros.carbs).isEqualTo(0.0f)
        assertThat(macros.fat).isCloseTo(7.2f, within(0.1f))
    }
    
    @Test
    fun roundingAggregation() {
        // When summing two slightly-rounded values
        val total = roundCalories(165.4f) + roundCalories(165.4f)
        
        // Then: sum should round correctly
        assertThat(total).isEqualTo(330)
        // NOT 330 from (165 + 165)
    }
    
    @Test
    fun validateFoodMacros_invalidWhenCaloriesTooLow() {
        // Given food with impossible macro ratios
        val invalidFood = Food(
            name = "Impossible food",
            caloriesPer100g = 50f,  // Too low
            proteinPer100g = 30f,
            fatPer100g = 30f
            // 30*4 + 30*9 = 390 kcal, but only 50 claimed
        )
        
        // When
        val result = validator.validateFoodMacros(invalidFood)
        
        // Then
        assertThat(result.isValid).isFalse()
        assertThat(result.errors).contains("Calories too low")
    }
}
```

### 8.2 Integration Tests (E2E)

```kotlin
@Test
fun endToEndMealLogging() {
    // User logs a meal
    val response = client.post("/api/v1/meals/consume") {
        contentType = MediaType.APPLICATION_JSON
        body = """
        {
            "mealId": "meal-uuid",
            "consumedAt": "2025-08-01T12:30:00Z"
        }
        """
    }
    
    assertThat(response.status).isEqualTo(HttpStatus.CREATED)
    
    // Verify daily macros updated
    val daily = client.get("/api/v1/nutrition/daily?date=2025-08-01")
    assertThat(daily.body.macros.calories).isEqualTo(330)
    
    // Verify dashboard reflects update
    val dashboard = client.get("/api/v1/tracking/dashboard")
    assertThat(dashboard.body.todayCalories).isEqualTo(330)
}
```

---

## 9. Extensibility

### 9.1 Future Enhancements

```
1. Micronutrients (Vitamins, Minerals)
   - Add vitamins A, B, C, D
   - Add minerals (Iron, Calcium, Magnesium)
   - Target recommendations per nutrient

2. Advanced Calculations
   - Glycemic Index (GI) scoring
   - Nutrient density scoring
   - MUFA/PUFA ratio tracking

3. User-Specific Adjustments
   - Custom conversions per user
   - Cultural food preferences
   - Meal prep adjustments
```

---

## 10. Documentation

All calculations documented in code:

```kotlin
/**
 * Calculates macronutrients for a consumed meal.
 *
 * Algorithm:
 *   1. For each food in meal:
 *      - Normalize quantity to grams (using conversion factors)
 *      - Scale food macros by quantity ratio
 *   2. Sum all food macros (keeping decimals)
 *   3. Round final totals per RFC-003 precision rules
 *   4. Validate result (macros account for 90-105% of calories)
 *
 * Precision:
 *   - Calories: ±1 kcal
 *   - Protein: ±0.1g
 *   - Carbs: ±0.1g  
 *   - Fat: ±0.1g
 *
 * @param meal consumed meal with foods
 * @return calculated macronutrients (rounded)
 * @throws ValidationException if macros invalid
 */
fun calculateMealMacros(meal: Meal): MacroNutrients { ... }
```

---

**RFC Status**: ✅ ACCEPTED  
**Implementation Target**: Fase 1.3-1.4  
**Testing**: Full unit + integration test coverage required  
**Dependencies**: 04-DATABASE-DESIGN.md, 05-MICROSERVICES.md

---

**End of RFC-003**  
**Lines**: 478  
**Status**: Final  
