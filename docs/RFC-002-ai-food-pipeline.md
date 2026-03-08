# RFC-002: AI Food Pipeline

**Title**: Multi-Source Food Data Pipeline with IA Fallback  
**Date**: 2025-08-01  
**Status**: ACCEPTED  
**Author**: ML Team + Backend  
**Reviewers**: Nutrition, Architecture, AI  

---

## 1. Abstract

Define strategy for resolving food nutritional data when users log meals through multiple sources with IA as fallback.

**Key Decision**: Use **cascading fallback chain** to maximize hit rate while maintaining accuracy.

**Impact**:
- User Exp: 95%+ meals resolved without manual entry
- Cost: Optimized API calls (prefer cache + local DB)
- Quality: IA prevents manual entry for unrecognized foods

---

## 2. Problem Statement

When user logs "frango grelhado" (grilled chicken), TrAIner Hub needs nutritional data:
- If found locally → use (instant, trusted)
- If not found → search Nutritionix/USDA (external but curated)
- If external fails → use IA to estimate (last resort, but better than nothing)

**Current Challenge**: Multiple potential sources, each with trade-offs:
- ❌ Local database only: misses popular foods
- ❌ External APIs only: costly, may fail
- ❌ IA estimation only: slow (30+ seconds), inaccurate for obscure foods

**Desired Outcome**: Fast resolution with 95%+ success rate

---

## 3. Food Data Pipeline

### 3.1 Resolution Chain

```
User logs: "200g frango grelhado"
        ↓
    ┌─────────────────────────────────┐
    │ 1. LOCAL CACHE (Redis) - 2ms    │
    │ Index: food_name + quantity     │
    │ TTL: 7 days                     │
    └─────────────────────────────────┘
        ↓
    [HIT? Yes → Return immediately]
    [HIT? No ↓]
        ↓
    ┌─────────────────────────────────┐
    │ 2. LOCAL DB (PostgreSQL) - 50ms │
    │ Index: foods(name ILIKE)        │
    │ Verified: true                  │
    └─────────────────────────────────┘
        ↓
    [HIT? Yes → Cache + Return]
    [HIT? No ↓]
        ↓
    ┌──────────────────────────────────┐
    │ 3. EXTERNAL: Nutritionix - 500ms │
    │ Timeout: 2 seconds               │
    │ Fallback: skip if timeout        │
    └──────────────────────────────────┘
        ↓
    [HIT? Yes → Import + Cache]
    [HIT? No or Failed ↓]
        ↓
    ┌──────────────────────────────────┐
    │ 4. EXTERNAL: USDA (parallel) - 1s│
    │ Timeout: 2 seconds               │
    │ Fallback: skip if timeout        │
    └──────────────────────────────────┘
        ↓
    [HIT? Yes → Import + Cache]
    [HIT? No or All External Failed ↓]
        ↓
    ┌───────────────────────────────────┐
    │ 5. IA ESTIMATION (OpenAI) - 15s   │
    │ Model: GPT-4o                     │
    │ Fallback: Gemini if timeout       │
    │ Fallback: Heuristic if both fail  │
    └───────────────────────────────────┘
        ↓
    ┌───────────────────────────────────┐
    │ 6. HEURISTIC ESTIMATION           │
    │ (Rule-based defaults)             │
    │ E.g., "frango" + "200g" → lookup  │
    │ from common patterns              │
    └───────────────────────────────────┘
        ↓
    [Always succeed - user gets estimate]
    [Show: "Estimated data, accuracy ~85%"]
```

### 3.2 Time Budget

```
Total resolution time: < 2 seconds (for high-confidence sources)
                     ~15 seconds (if IA needed)

Timeline example (cache miss):
T=0ms:    User submits food
T=2ms:    Redis cache check → miss
T=20ms:   PostgreSQL lookup → 5 matches (partial)
T=25ms:   Parallel: Nutritionix (1500ms timeout) + USDA (2000ms)
T=30-100ms: One of external APIs returns match
T=110ms:  Import + cache result
T=115ms:  Return to user ✅

If all external fail:
T=120ms:  Trigger IA analysis (async, non-blocking)
T=120-3000ms: User sees "Analyzing meal composition..."
T=3000ms: Return IA estimate
```

---

## 4. Data Sources

### 4.1 Source 1: Local Database (PostgreSQL)

```sql
SELECT * FROM foods
WHERE LOWER(name) ILIKE '%frango%'
  AND category = 'PROTEIN'
  AND verified = true  -- Only curated
ORDER BY popularity DESC, name ASC
LIMIT 10;
```

**Pros**:
- ✅ Instant (< 50ms with index)
- ✅ Trusted (verified by nutritionists)
- ✅ Contextual (user history)

**Cons**:
- ❌ Limited coverage (new foods missing)
- ❌ Requires curation

**Strategy**:
- Import popular foods from Nutritionix during onboarding
- Allow users to favorite foods (increase local coverage)
- Nutritionists can create/verify standard foods

---

### 4.2 Source 2: Nutritionix API

```
GET https://api.nutritionix.com/v1_1/search?q=frango grelhado
Timeout: 2 seconds

Response:
{
  "hits": [
    {
      "fields": {
        "item_name": "Frango Grelhado, pele removida, peito",
        "nf_calories": 165,
        "nf_protein_g": 32,
        "nf_carbohydrate_total_g": 0,
        "nf_total_fat_g": 3.6,
        "nf_fiber_dietary_g": 0,
        "nf_sodium_mg": 87
      }
    }
  ]
}
```

**Pros**:
- ✅ Large database (500k+ foods)
- ✅ Curated by nutritionists
- ✅ Brazilian foods well-covered
- ✅ Real-time API

**Cons**:
- ❌ External dependency (may timeout/fail)
- ❌ API key management
- ❌ Costs: ~$0.001 per request

**Strategy**:
- Cache results (8-24 hours TTL)
- Retry on timeout (exponential backoff)
- Fall through to next source on failure

---

### 4.3 Source 3: USDA FoodData Central

```
GET https://fdc.nal.usda.gov/api/foods/search?query=grilled chicken breast
Timeout: 2 seconds

Response:
{
  "foods": [
    {
      "fdcId": "12345",
      "description": "Chicken, broilers or fryers, breast, skinless",
      "foodNutrients": [
        {"nutrientName": "Energy", "value": 165},
        {"nutrientName": "Protein", "value": 32},
        ...
      ]
    }
  ]
}
```

**Pros**:
- ✅ Official government database (USDA)
- ✅ Highly accurate
- ✅ Free API
- ✅ Massive coverage (300k+ foods)

**Cons**:
- ❌ English-language focus (less Brazilian foods)
- ❌ Slower API (< 5sec typical)
- ❌ Complex nutrient mapping

**Strategy**:
- Use as secondary after Nutritionix
- Map USDA nutrients to TrAIner Hub schema
- Cache aggressively

---

### 4.4 Source 4: OpenAI with Chain-of-Thought

```
Prompt (system):
"You are a nutritionist AI. When given a food description,
estimate the nutritional content based on standard portion sizes.
Respond in JSON format with calories, protein, carbs, fat, fiber, sodium.
If unsure, indicate confidence < 80%"

Prompt (user):
"200g frango grelhado (grilled chicken breast, skinless)"

Response:
{
  "foodName": "Grilled Chicken Breast (skinless)",
  "portionSize": "100g",
  "servings": 2,
  "estimates": {
    "calories": 165,
    "protein": 32,
    "carbs": 0,
    "fat": 3.6,
    "fiber": 0,
    "sodium": 75
  },
  "confidence": 95,
  "reasoning": "Standard USDA data for skinless chicken breast",
  "flags": []
}
```

**Pros**:
- ✅ Handles novel food descriptions (e.g., "my grandma's special frango")
- ✅ Context-aware (understands portion size qualifiers)
- ✅ Confidence scores
- ✅ Can explain reasoning

**Cons**:
- ❌ Slow (15-30 seconds)
- ❌ Costly ($0.01-0.05 per request)
- ❌ May hallucinate (less accurate than curated)
- ⚠️ API rate limits, quota management

**Strategy**:
- Async processing (don't block meal logging)
- Use only when other sources fail
- Cache results (24-hour TTL)
- Monitor confidence scores for quality control
- Fallback to Gemini if OpenAI times out

---

## 5. Implementation

### 5.1 Food Service - Food Search Endpoint

```kotlin
@PostMapping("/api/v1/foods/search")
fun searchFood(
    @Valid @RequestBody req: SearchFoodRequest,
    authentication: Authentication
): ResponseEntity<SearchFoodResponse> {
    
    val userId = authentication.principal as String
    val foodName = req.query.trim()
    
    // 1. Check cache
    val cached = cacheService.getFoodSearchResult(foodName)
    if (cached != null) {
        return ResponseEntity.ok(cached)
    }
    
    // 2. Local DB search
    val localFoods = foodRepository.searchByName(foodName, limit = 10)
    
    val response = SearchFoodResponse(local = localFoods.map { it.toResponse() })
    
    if (localFoods.isNotEmpty()) {
        // Found locally, update cache and return
        cacheService.set(foodName, response, TTL = 1.hours)
        return ResponseEntity.ok(response)
    }
    
    // 3. External sources (if enabled by user preference)
    if (req.includeExternal) {
        val externalResults = runBlocking {
            supervisorScope {
                val nutritionixTask = async { fetchNutritionix(foodName) }
                val usdaTask = async { fetchUSDA(foodName) }
                
                listOf(
                    nutritionixTask.awaitOrNull(),
                    usdaTask.awaitOrNull()
                ).filterNotNull()
            }
        }
        
        response.nutritionix = externalResults.getOrNull(0)?.toResponse()
        response.usda = externalResults.getOrNull(1)?.toResponse()
    }
    
    // 4. Update cache
    cacheService.set(foodName, response, TTL = 8.hours)
    
    return ResponseEntity.ok(response)
}
```

### 5.2 Async IA Fallback

```kotlin
@Service
class FoodAnalysisService {
    
    fun analyzeWithAI(foodDescription: String): FoodAnalysisResult {
        val response = aiService.estimateMacros(
            prompt = """
                Analyze this food description and estimate nutritional content:
                "$foodDescription"
                
                Provide estimate for 100g standard portion.
            """
        )
        
        return FoodAnalysisResult(
            foodName = response.foodName,
            macros = response.macroEstimate,
            source = "OPENAI",
            confidence = response.confidence,
            flags = listOf("Estimated", "Confidence ${response.confidence}%")
        )
    }
}

// Background worker for async IA analysis
@Scheduled(fixedDelay = 2000, timeUnit = TimeUnit.MILLISECONDS)
fun processAIPendingAnalysis() {
    val pending = foodAnalysisQueue.take()  // BlockingQueue
    
    if (pending == null) return
    
    try {
        val result = foodAnalysisService.analyzeWithAI(pending.foodDescription)
        
        // Import to local DB (unverified)
        foodRepository.save(Food(
            name = result.foodName,
            verified = false,
            source = "OPENAI",
            macros = result.macros,
            confidence = result.confidence
        ))
        
        // Notify user
        notificationService.sendNotification(
            userId = pending.userId,
            type = "FOOD_ANALYSIS_READY",
            body = "Analysis ready for ${result.foodName}"
        )
    } catch (e: Exception) {
        log.error("AI analysis failed for: ${pending.foodDescription}", e)
        // Dead letter handling
    }
}
```

### 5.3 Heuristic Fallback (No IA)

```kotlin
// Rule-based estimation for when all sources fail

data class FoodHeuristic(
    val keyword: String,
    val defaultCalories: Float,
    val defaultProtein: Float,
    // ...
)

val HEURISTICS = listOf(
    FoodHeuristic("frango", 165, 32),  // chicken
    FoodHeuristic("peixe", 100, 20),   // fish
    FoodHeuristic("carne", 250, 26),   // beef
    FoodHeuristic("ovos", 155, 13),    // eggs
    FoodHeuristic("arroz", 130, 2.7),  // rice
    FoodHeuristic("feijão", 127, 8.9), // beans
)

fun estimateViaHeuristic(foodName: String): FoodEstimate {
    val keyword = HEURISTICS.find { 
        foodName.contains(it.keyword, ignoreCase = true) 
    }
    
    return if (keyword != null) {
        FoodEstimate(
            name = foodName,
            calories = keyword.defaultCalories,
            protein = keyword.defaultProtein,
            source = "HEURISTIC",
            confidence = 65,
            flags = listOf("Low confidence", "Manual review recommended")
        )
    } else {
        // Ultimate fallback (shouldn't reach here often)
        FoodEstimate(
            name = foodName,
            calories = 200f,  // Generic default
            protein = 15f,
            source = "UNKNOWN",
            confidence = 30,
            flags = listOf("Very low confidence", "User should verify")
        )
    }
}
```

---

## 6. Quality Management

### 6.1 Confidence Scoring

```
Source           | Confidence | Notes
-----------------+------------+-----------------------------------
Local (verified) | 98-100%    | Nutritionist-reviewed
Nutritionix      | 90-95%     | Curated database
USDA             | 88-93%     | Official, but may need mapping
OpenAI           | 75-85%     | Context-aware but not verified
Heuristic        | 50-70%     | Pattern-based guess
Unknown Default  | < 50%      | Last resort, should alert user
```

### 6.2 User Review Workflow

```
When confidence < 80%:
  1. Show food to user
  2. Display "Estimated data"
  3. Allow quick manual adjustments
  4. Collect feedback (accurate Y/N)
  5. Use feedback to train heuristics
```

### 6.3 Nutritionist Curation

```
Nutritionists can:
1. Mark foods as "verified"
2. Batch import trusted foods from Nutritionix
3. Create standard portions (frango=100g, arroz=150g)
4. Flag low-confidence estimations for review
```

---

## 7. Caching Strategy

```
Layer                     | Duration | Strategy
-----------+---+------+------+----------+-----
Redis cache  |  7 days  | Full food object + macros
PostgreSQL   | ∞        | Imported foods (persistent)
Nutritionix  | 24 hours | Avoid duplicate API calls
USDA         | 24 hours | (cost optimization)
OpenAI       | 24 hours | Avoid re-analyzing same food
```

---

## 8. Monitoring

### 8.1 Metrics

```
food_search_resolution_rate:
  By source: local, nutritionix, usda, openai, heuristic

food_search_latency_ms:
  P50, P95, P99 per source

api_call_cost:
  Nutritionix and OpenAI API spend per day

confidence_distribution:
  % of foods at each confidence level (if < 80%, alert)

user_feedback_accuracy:
  % of foods marked as correct by users (target > 95%)
```

### 8.2 Alerts

```
Alert when:
  - OpenAI API costs > $50/day (runaway usage)
  - Confidence score < 60% for > 10% of foods
  - Nutritionix timeout rate > 5%
  - User correction rate > 20% (data quality issue)
```

---

## 9. Cost Analysis

```
Estimated monthly costs (for 10k active users):

Nutritionix: 10k users × 0.5 searches/day × $0.001 = $50/month
USDA:        Free
OpenAI:      100 users × 1 IA analysis/day × $0.02 = $60/month
AWS Cache:   Redis (small): $15/month

Total: ~$125/month (acceptable for MVP)

Optimization opportunity:
  - Increase local DB coverage (reduce external calls)
  - Track confidence scores (reduce IA usage)
```

---

## 10. Timeline & Rollout

```
Phase 1 (Week 1-2): Implement resolution chain
  - Add caching + local DB search
  - OpenAI integration
  
Phase 2 (Week 3): External APIs
  - Nutritionix integration
  - USDA integration
  
Phase 3 (Week 4): Quality assurance
  - Test fallback chains
  - Monitor confidence scores
  
Phase 4 (Week 5+): Optimization
  - Batch import popular foods
  - Train heuristics on feedback
```

---

**RFC Status**: ✅ ACCEPTED  
**Implementation Target**: Fase 1.5-1.6  
**Estimated Cost**: $125/month (API calls)  
**Dependencies**: RFC-001 (events), 07-MESSAGING-STRATEGY.md  

---

**End of RFC-002**  
**Lines**: 506  
**Status**: Final  
