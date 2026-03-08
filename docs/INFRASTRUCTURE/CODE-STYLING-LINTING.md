# Code Styling & Linting - Trainer Hub

**Versão**: 1.0  
**Data**: 8 de março de 2026  
**Autor**: Architecture Team  
**Status**: ✅ **APPROVED - PRODUCTION READY**

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Backend (Kotlin + Spring Boot)](#-backend-kotlin--spring-boot)
3. [Frontend (React Native + TypeScript)](#-frontend-react-native--typescript)
4. [Automação (GitHub Actions)](#-automação-github-actions)
5. [Pre-commit Hooks](#-pre-commit-hooks)
6. [IDE Configuration](#-ide-configuration)
7. [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

Este documento define os padrões de code styling, linting e formatação para todo o código do Trainer Hub. O objetivo é:

✅ **Consistência**: Código uniforme independente do autor  
✅ **Qualidade**: Detectar bugs e code smells precocemente  
✅ **Automação**: Formatação automática via pre-commit + CI/CD  
✅ **Produtividade**: Menos tempo discutindo estilo, mais tempo programando  

### Princípios

1. **Automatizar tudo**: Se pode ser automatizado, deve ser
2. **Fail fast**: Erros de lint bloqueiam PR merge
3. **Auto-fix quando possível**: ktlint/prettier podem corrigir automaticamente
4. **Documentar exceções**: Se precisar desabilitar regra, comentar o porquê

---

## 🟢 Backend (Kotlin + Spring Boot)

### Ferramentas

| Tool | Purpose | Version | Config File |
|------|---------|---------|-------------|
| **ktlint** | Lint + formatter | 11.0+ | `.editorconfig` |
| **detekt** | Static analysis | 1.23+ | `detekt.yml` |
| **SonarQube** | Code quality | Latest | `sonar-project.properties` |

### ktlint Configuration

**Instalar no Gradle**:

```kotlin
// build.gradle.kts (raiz do projeto)
plugins {
    id("org.jlleitschuh.gradle.ktlint") version "11.6.1"
}

allprojects {
    apply(plugin = "org.jlleitschuh.gradle.ktlint")

    configure<org.jlleitschuh.gradle.ktlint.KtlintExtension> {
        version.set("1.0.1")
        android.set(false)
        verbose.set(true)
        outputToConsole.set(true)
        coloredOutput.set(true)
        reporters {
            reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.CHECKSTYLE)
            reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.JSON)
        }
        filter {
            exclude("**/generated/**")
            exclude("**/build/**")
        }
    }
}
```

**Configuração (`.editorconfig`)**:

```ini
# .editorconfig (raiz do projeto)

root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 4
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true
max_line_length = 120

[*.{kt,kts}]
indent_size = 4
max_line_length = 120
ij_kotlin_imports_layout = *
ktlint_standard_no-wildcard-imports = disabled
ktlint_standard_filename = disabled

# Kotlin specific rules
ktlint_standard_function-naming = enabled
ktlint_standard_property-naming = enabled
ktlint_standard_class-naming = enabled
ktlint_standard_enum-entry-name-case = enabled
ktlint_standard_package-name = enabled

# Formatting
ktlint_standard_indent = enabled
ktlint_standard_trailing-comma-on-call-site = enabled
ktlint_standard_trailing-comma-on-declaration-site = enabled
ktlint_standard_wrapping = enabled

# Code quality
ktlint_standard_no-consecutive-blank-lines = enabled
ktlint_standard_no-empty-class-body = enabled
ktlint_standard_no-multi-spaces = enabled
ktlint_standard_no-unused-imports = enabled

[*.{json,yml,yaml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
max_line_length = off
```

### Comandos Gradle

```bash
# Verificar code style (não modifica arquivos)
./gradlew ktlintCheck

# Formatar automaticamente (auto-fix)
./gradlew ktlintFormat

# Rodar ambos em todos os módulos
./gradlew :services:auth:ktlintFormat :services:user:ktlintFormat

# Gerar relatório detalhado
./gradlew ktlintCheck --console=verbose
```

### detekt Configuration

**Instalar**:

```kotlin
// build.gradle.kts
plugins {
    id("io.gitlab.arturbosch.detekt") version "1.23.0"
}

detekt {
    buildUponDefaultConfig = true
    allRules = false
    config.setFrom("$projectDir/config/detekt/detekt.yml")
    baseline = file("$projectDir/config/detekt/baseline.xml")
}

dependencies {
    detektPlugins("io.gitlab.arturbosch.detekt:detekt-formatting:1.23.0")
}
```

**Configuração (`detekt.yml`)**:

```yaml
# config/detekt/detekt.yml

build:
  maxIssues: 0
  excludeCorrectable: false
  weights:
    complexity: 2
    LongParameterList: 1
    style: 1
    comments: 1

config:
  validation: true
  warningsAsErrors: true
  checkExhaustiveness: true

complexity:
  active: true
  CyclomaticComplexMethod:
    active: true
    threshold: 15
  LongMethod:
    active: true
    threshold: 60
  LongParameterList:
    active: true
    functionThreshold: 6
    constructorThreshold: 7
  NestedBlockDepth:
    active: true
    threshold: 4

exceptions:
  active: true
  TooGenericExceptionCaught:
    active: true
    exceptionNames:
      - Exception
      - Throwable
      - RuntimeException
  SwallowedException:
    active: true

naming:
  active: true
  ClassNaming:
    active: true
    classPattern: '[A-Z][a-zA-Z0-9]*'
  FunctionNaming:
    active: true
    functionPattern: '[a-z][a-zA-Z0-9]*'
    excludeClassPattern: '$^'
    ignoreAnnotated: ['Test']
  VariableNaming:
    active: true
    variablePattern: '[a-z][a-zA-Z0-9]*'
    privateVariablePattern: '(_)?[a-z][a-zA-Z0-9]*'
  ConstantNaming:
    active: true
    constantPattern: '[A-Z][_A-Z0-9]*'

potential-bugs:
  active: true
  UnsafeCast:
    active: true
  UselessPostfixExpression:
    active: true

style:
  active: true
  MagicNumber:
    active: true
    ignoreNumbers: ['-1', '0', '1', '2']
    ignoreHashCodeFunction: true
    ignorePropertyDeclaration: true
    ignoreAnnotation: true
  MaxLineLength:
    active: true
    maxLineLength: 120
    excludePackageStatements: true
    excludeImportStatements: true
  UnusedImports:
    active: true
  WildcardImport:
    active: false  # Permitido para DSLs (Spring, TestContainers)
```

**Comandos**:

```bash
# Rodar análise estática
./gradlew detekt

# Gerar relatório HTML
./gradlew detekt --report html:build/reports/detekt.html

# Criar baseline (ignora issues existentes)
./gradlew detektBaseline
```

### Regras Kotlin

#### Naming Conventions

```kotlin
// ✅ Classes: PascalCase
class UserService
class AuthController
data class MealResponse

// ✅ Functions: camelCase
fun createUser()
fun validateToken()

// ✅ Properties: camelCase
val userId: String
var isActive: Boolean

// ✅ Constants: UPPER_SNAKE_CASE
const val MAX_RETRY_ATTEMPTS = 3
const val DEFAULT_TIMEOUT_MS = 5000

// ✅ Private properties: camelCase (optional underscore prefix)
private val _userCache = mutableMapOf<String, User>()
private var refreshToken: String? = null

// ❌ Evitar
val UserID: String  // PascalCase em variável
fun CreateUser()    // PascalCase em função
const val maxRetry = 3  // camelCase em constante
```

#### Code Organization

```kotlin
// ✅ Ordem de membros em classes
class UserService {
    // 1. Companion object / constants
    companion object {
        private const val MAX_USERS = 1000
    }

    // 2. Properties (públicas depois privadas)
    val publicProperty: String = ""
    private val privateProperty: String = ""

    // 3. Init blocks
    init {
        // Inicialização
    }

    // 4. Constructor secundários
    constructor(param: String) : this()

    // 5. Public methods
    fun publicMethod() {}

    // 6. Private methods
    private fun privateMethod() {}

    // 7. Nested classes/objects
    object Config {}
}
```

#### Imports

```kotlin
// ✅ Organizar imports alfabeticamente
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.GetMapping
import java.time.Instant
import com.trainerhub.domain.User

// ✅ Wildcard permitido para DSLs
import org.springframework.web.bind.annotation.*
import io.mockk.*

// ❌ Evitar imports não utilizados
import java.util.UUID  // Se não usar, remover
```

#### Line Length

```kotlin
// ✅ Máximo 120 caracteres por linha
fun createUser(
    name: String,
    email: String,
    password: String,
    role: UserRole = UserRole.USER,
): User {
    return userRepository.save(
        User(
            name = name,
            email = email,
            passwordHash = hashPassword(password),
            role = role,
        )
    )
}

// ✅ Quebrar chamadas longas
val result = userService
    .findById(userId)
    .map { user -> user.toDto() }
    .orElseThrow { UserNotFoundException(userId) }
```

#### Trailing Commas

```kotlin
// ✅ Usar trailing commas em listas multi-linha
data class User(
    val id: String,
    val name: String,
    val email: String,  // <- trailing comma
)

val list = listOf(
    "item1",
    "item2",
    "item3",  // <- trailing comma
)
```

---

## 🔵 Frontend (React Native + TypeScript)

### Ferramentas

| Tool | Purpose | Version | Config File |
|------|---------|---------|-------------|
| **ESLint** | Lint | 8.50+ | `.eslintrc.js` |
| **Prettier** | Formatter | 3.0+ | `.prettierrc` |
| **TypeScript** | Type checking | 5.0+ | `tsconfig.json` |

### ESLint Configuration

**Instalar**:

```bash
npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-native \
  eslint-plugin-react-hooks \
  eslint-config-prettier
```

**Configuração (`.eslintrc.js`)**:

```javascript
// .eslintrc.js (raiz mobile/)

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  env: {
    'react-native/react-native': true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:react-hooks/recommended',
    'prettier', // Desabilita regras conflitantes com Prettier
  ],
  plugins: [
    '@typescript-eslint',
    'react',
    'react-native',
    'react-hooks',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
    }],

    // React
    'react/react-in-jsx-scope': 'off', // React 17+ não precisa
    'react/prop-types': 'off', // TypeScript já faz type checking
    'react/jsx-uses-react': 'off',
    'react/display-name': 'off',

    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // React Native
    'react-native/no-unused-styles': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'off',

    // Geral
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'prefer-template': 'error',
    'object-shorthand': 'error',
    'arrow-body-style': ['error', 'as-needed'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'node_modules/',
    'build/',
    'dist/',
    'coverage/',
    'android/',
    'ios/',
    '.expo/',
  ],
};
```

### Prettier Configuration

**Instalar**:

```bash
npm install --save-dev prettier
```

**Configuração (`.prettierrc`)**:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "endOfLine": "lf"
}
```

**Ignorar arquivos (`.prettierignore`)**:

```
node_modules/
build/
dist/
coverage/
android/
ios/
.expo/
*.lock
package-lock.json
yarn.lock
```

### Comandos NPM

```bash
# Lint
npm run lint

# Lint + auto-fix
npm run lint:fix

# Format com Prettier
npm run format

# Type check
npm run type-check

# Rodar todos
npm run check
```

**Adicionar no `package.json`**:

```json
{
  "scripts": {
    "lint": "eslint 'src/**/*.{js,jsx,ts,tsx}'",
    "lint:fix": "eslint 'src/**/*.{js,jsx,ts,tsx}' --fix",
    "format": "prettier --write 'src/**/*.{js,jsx,ts,tsx,json,css,md}'",
    "format:check": "prettier --check 'src/**/*.{js,jsx,ts,tsx,json,css,md}'",
    "type-check": "tsc --noEmit",
    "check": "npm run lint && npm run format:check && npm run type-check"
  }
}
```

### TypeScript Configuration

**`tsconfig.json`**:

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "lib": ["ES2021"],
    "jsx": "react-native",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["./components/*"],
      "@screens/*": ["./screens/*"],
      "@theme/*": ["./theme/*"],
      "@utils/*": ["./utils/*"],
      "@services/*": ["./services/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "dist", "android", "ios"]
}
```

### Regras TypeScript/React

#### Type Safety

```typescript
// ✅ Sempre tipar explicitamente props e retornos de funções
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}: ButtonProps): JSX.Element => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};

// ❌ Evitar any
const handleData = (data: any) => {}; // ❌
const handleData = (data: unknown) => {}; // ✅ (e depois narrow type)
```

#### Hooks

```typescript
// ✅ Dependências explícitas
useEffect(() => {
  fetchData();
}, [userId]); // Incluir todas as dependências

// ✅ Custom hooks começam com "use"
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  // ...
  return { user, login, logout };
};

// ❌ Evitar
useEffect(() => {
  fetchData();
}, []); // Se fetchData usa props/state, adicionar nas deps
```

#### Component Organization

```typescript
// ✅ Estrutura de componente
import type { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PRIMARY, SPACING } from '@/theme';

interface Props {
  title: string;
  subtitle?: string;
}

export const Card: FC<Props> = ({ title, subtitle }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: PRIMARY.main,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});
```

#### Naming Conventions

```typescript
// ✅ Componentes: PascalCase
export const Button = () => {};
export const UserProfile = () => {};

// ✅ Hooks: camelCase prefixado com "use"
export const useAuth = () => {};
export const useFetchData = () => {};

// ✅ Utilitários: camelCase
export const formatDate = () => {};
export const validateEmail = () => {};

// ✅ Constants: UPPER_SNAKE_CASE
export const API_BASE_URL = 'https://api.trainerhub.com';
export const MAX_RETRIES = 3;

// ✅ Types/Interfaces: PascalCase
interface User {}
type UserRole = 'USER' | 'ADMIN';
```

---

## ⚙️ Automação (GitHub Actions)

### Lint Workflow

**Arquivo**: `.github/workflows/lint.yml`

```yaml
name: Code Linting & Formatting

on:
  push:
    branches: [develop, master]
  pull_request:
    branches: [develop, master]

jobs:
  # Backend (Kotlin)
  lint-backend:
    name: Lint Backend (Kotlin)
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'gradle'
          
      - name: Grant execute permission for gradlew
        run: chmod +x gradlew
        
      - name: Run ktlint check
        run: ./gradlew ktlintCheck
        
      - name: Run detekt
        run: ./gradlew detekt
        
      - name: Upload ktlint report
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: ktlint-report
          path: '**/build/reports/ktlint/'
          
      - name: Upload detekt report
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: detekt-report
          path: '**/build/reports/detekt/'

  # Frontend (React Native)
  lint-frontend:
    name: Lint Frontend (React Native)
    runs-on: ubuntu-latest
    
    defaults:
      run:
        working-directory: mobile
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: mobile/package-lock.json
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run ESLint
        run: npm run lint
        
      - name: Run Prettier check
        run: npm run format:check
        
      - name: Run TypeScript check
        run: npm run type-check

  # Comentar PR com resultados
  comment-pr:
    name: Comment Lint Results
    runs-on: ubuntu-latest
    needs: [lint-backend, lint-frontend]
    if: always() && github.event_name == 'pull_request'
    
    steps:
      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            const backendStatus = '${{ needs.lint-backend.result }}';
            const frontendStatus = '${{ needs.lint-frontend.result }}';
            
            let message = '## 🔍 Lint Results\n\n';
            message += `- Backend (Kotlin): ${backendStatus === 'success' ? '✅ Passed' : '❌ Failed'}\n`;
            message += `- Frontend (React Native): ${frontendStatus === 'success' ? '✅ Passed' : '❌ Failed'}\n`;
            
            if (backendStatus !== 'success' || frontendStatus !== 'success') {
              message += '\n⚠️ Please fix linting errors before merging.';
            }
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: message
            });
```

### Auto-format Workflow

**Arquivo**: `.github/workflows/auto-format.yml`

```yaml
name: Auto-format Code

on:
  push:
    branches: ['feature/**', 'bugfix/**']

jobs:
  auto-format:
    name: Auto-format and Commit
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          fetch-depth: 0
          
      # Backend
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
          
      - name: Run ktlintFormat
        run: |
          chmod +x gradlew
          ./gradlew ktlintFormat
          
      # Frontend
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install frontend dependencies
        working-directory: mobile
        run: npm ci
        
      - name: Run Prettier
        working-directory: mobile
        run: npm run format
        
      # Commit se houver mudanças
      - name: Commit changes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add -A
          git diff --staged --quiet || git commit -m "style: auto-format code with ktlint and prettier"
          
      - name: Push changes
        uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          branch: ${{ github.ref }}
```

---

## 🪝 Pre-commit Hooks

### Husky Setup

**Instalar**:

```bash
# Na raiz do projeto
npm install --save-dev husky lint-staged

# Inicializar husky
npx husky install

# Criar script no package.json
npm pkg set scripts.prepare="husky install"
```

**Criar hook** (`.husky/pre-commit`):

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Backend: ktlint check
echo "📦 [Backend] Running ktlint..."
./gradlew ktlintFormat --quiet

if [ $? -ne 0 ]; then
  echo "❌ [Backend] ktlint failed. Please fix and try again."
  exit 1
fi

# Frontend: lint-staged
echo "📱 [Frontend] Running lint-staged..."
cd mobile && npx lint-staged

if [ $? -ne 0 ]; then
  echo "❌ [Frontend] Linting failed. Please fix and try again."
  exit 1
fi

echo "✅ Pre-commit checks passed!"
```

### lint-staged Configuration

**Arquivo**: `mobile/package.json`

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
```

### Commit Message Lint

**Instalar commitlint**:

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

**Configuração** (`commitlint.config.js`):

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova feature
        'fix',      // Bug fix
        'docs',     // Documentação
        'style',    // Formatação
        'refactor', // Refactoring
        'perf',     // Performance
        'test',     // Testes
        'chore',    // Manutenção
        'ci',       // CI/CD
        'build',    // Build system
        'revert',   // Revert commit
      ],
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
```

**Criar hook** (`.husky/commit-msg`):

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"
```

---

## 💻 IDE Configuration

### IntelliJ IDEA / Android Studio

**Configuração automática**:

1. Abrir `Settings > Editor > Code Style`
2. Importar `.editorconfig` (será detectado automaticamente)
3. Ativar "Reformat code on save"

**Shortcuts**:
- `Ctrl + Alt + L` (Windows/Linux) / `Cmd + Option + L` (Mac): Formatar arquivo
- `Ctrl + Alt + O` (Windows/Linux) / `Cmd + Option + O` (Mac): Organizar imports

**Plugins recomendados**:
- Kotlin
- Detekt
- Save Actions (auto-format on save)

### VS Code

**Extensões**:

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "orta.vscode-jest",
    "firsttris.vscode-jest-runner"
  ]
}
```

**Configuração** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "prettier.requireConfig": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 🐛 Troubleshooting

### Backend (Kotlin)

**Problema**: `ktlintCheck` falha com muitos erros

```bash
# Solução: Auto-fix primeiro
./gradlew ktlintFormat

# Se ainda houver erros manuais, ver relatório
./gradlew ktlintCheck --console=verbose
```

**Problema**: `detekt` reporta muitos issues

```bash
# Criar baseline (ignora issues existentes)
./gradlew detektBaseline

# Corrigir novos issues gradualmente
```

**Problema**: Imports wildcards sendo removidos

```ini
# Adicionar no .editorconfig
ktlint_standard_no-wildcard-imports = disabled
```

### Frontend (React Native)

**Problema**: ESLint e Prettier conflitando

```bash
# Verificar se eslint-config-prettier está instalado
npm install --save-dev eslint-config-prettier

# Garantir que "prettier" seja o último extends em .eslintrc.js
```

**Problema**: Hook dependencies warning

```typescript
// Opção 1: Adicionar dependência
useEffect(() => {
  fetchData(userId);
}, [userId, fetchData]); // Adicionar fetchData

// Opção 2: useCallback
const fetchData = useCallback((id: string) => {
  // ...
}, []);
```

**Problema**: Slow linting

```bash
# Adicionar cache ao ESLint
npx eslint --cache 'src/**/*.{ts,tsx}'

# No package.json
"lint": "eslint --cache 'src/**/*.{ts,tsx}'"
```

---

## ✅ Checklist de Implementação

### Backend Team

- [ ] Instalar ktlint plugin no Gradle
- [ ] Criar `.editorconfig` na raiz
- [ ] Instalar detekt e configurar `detekt.yml`
- [ ] Rodar `./gradlew ktlintFormat` em todo código existente
- [ ] Commitar mudanças: `git commit -m "style: apply ktlint formatting"`
- [ ] Configurar pre-commit hook para ktlint
- [ ] Adicionar GitHub Action para lint check em PRs

### Frontend Team

- [ ] Instalar ESLint + Prettier + plugins
- [ ] Criar `.eslintrc.js` e `.prettierrc`
- [ ] Configurar `tsconfig.json` com strict mode
- [ ] Rodar `npm run format` em todo código existente
- [ ] Commitar mudanças: `git commit -m "style: apply prettier formatting"`
- [ ] Instalar Husky + lint-staged
- [ ] Configurar commitlint
- [ ] Adicionar GitHub Action para lint check em PRs

### DevOps Team

- [ ] Criar `.github/workflows/lint.yml`
- [ ] Criar `.github/workflows/auto-format.yml` (opcional)
- [ ] Configurar branch protection: require lint check antes de merge
- [ ] Adicionar status badges no README.md
- [ ] Documentar processo no onboarding

---

## 📚 Referências

- **ktlint**: https://pinterest.github.io/ktlint/
- **detekt**: https://detekt.dev/
- **ESLint**: https://eslint.org/
- **Prettier**: https://prettier.io/
- **Husky**: https://typicode.github.io/husky/
- **Conventional Commits**: https://www.conventionalcommits.org/

---

**Última Atualização**: 8 de março de 2026  
**Próxima Revisão**: Após Wave 1 (Março 2026)  
**Contato**: backend@trainerhub.com / frontend@trainerhub.com
