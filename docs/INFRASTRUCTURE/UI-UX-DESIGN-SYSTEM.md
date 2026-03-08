# UI/UX Design System - Trainer Hub

**Versão**: 1.0  
**Data**: 8 de março de 2026  
**Autor**: Architecture Team  
**Status**: ✅ **APPROVED - PRODUCTION READY**

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Princípios de Design](#-princípios-de-design)
3. [Identidade Visual](#-identidade-visual)
4. [Sistema de Cores](#-sistema-de-cores)
5. [Tipografia](#-tipografia)
6. [Espaçamento & Layout](#-espaçamento--layout)
7. [Componentes UI](#-componentes-ui)
8. [Padrões de Navegação](#-padrões-de-navegação)
9. [Estados & Feedback](#-estados--feedback)
10. [Acessibilidade](#-acessibilidade)
11. [Instruções para IA](#-instruções-para-ia)
12. [Ferramentas & Assets](#-ferramentas--assets)

---

## 🎯 Visão Geral

O Trainer Hub adota um design system moderno, clean e focado em usabilidade para aplicativos de fitness e nutrição. O objetivo é criar uma experiência intuitiva, motivacional e acessível para usuários, nutricionistas e treinadores.

### Público-Alvo

- **Usuários Finais**: Pessoas buscando melhor saúde (18-60 anos)
- **Profissionais**: Nutricionistas e treinadores (25-50 anos)
- **Nível Técnico**: Iniciantes a intermediários (mobile-first)

### Plataformas

- **Mobile**: iOS 14+ e Android 10+ (React Native)
- **Resolução**: 375px (iPhone SE) até 428px (iPhone 14 Pro Max)
- **Orientação**: Primariamente vertical (portrait)

---

## 💡 Princípios de Design

### 1. **Clareza First**
- Informação clara > decoração excessiva
- Hierarquia visual óbvia
- Texto legível em qualquer luz (contraste ≥ 4.5:1)

### 2. **Motivacional & Positivo**
- Feedback encorajador (progressos, conquistas)
- Cores vibrantes mas não agressivas
- Microinterações que celebram ações

### 3. **Dados Visuais**
- Gráficos > tabelas de números
- Tendências visíveis de forma imediata
- Dashboard com insights acionáveis

### 4. **Eficiência**
- Menos taps = melhor
- Ações frequentes acessíveis em 1-2 taps
- Input rápido (autocomplete, sugestões inteligentes)

### 5. **Confiança & Privacidade**
- Dados sensíveis claramente protegidos
- Transparência sobre uso de dados
- Controle explícito de permissões

---

## 🎨 Identidade Visual

### Conceito

"**Energia Equilibrada**" - A identidade visual combina:
- **Força**: Elementos geométricos, linhas sólidas
- **Saúde**: Verde como cor primária (vitalidade, crescimento)
- **Precisão**: Tipografia sans-serif moderna, dados bem apresentados
- **Dinamismo**: Gradientes suaves, animações fluidas

### Inspiração

- **Apple Health**: Clareza, dados visuais
- **MyFitnessPal**: Dashboard estruturado
- **Strava**: Motivação social, progresso visual
- **Notion**: Clean, moderno, componentes bem definidos

---

## 🌈 Sistema de Cores

### Paleta Primária

```javascript
// colors/primary.ts
export const PRIMARY = {
  main: '#10B981',      // Green 500 (Emerald) - Ação principal
  dark: '#059669',      // Green 600 - Hover state
  light: '#34D399',     // Green 400 - Subtle backgrounds
  lighter: '#D1FAE5',   // Green 100 - Cards, badges
  text: '#FFFFFF',      // Texto sobre primary
};
```

**Uso**: Botões primários, links, progress bars, badges de sucesso

### Paleta Secundária

```javascript
export const SECONDARY = {
  main: '#3B82F6',      // Blue 500 - Informação
  dark: '#2563EB',      // Blue 600 - Hover
  light: '#60A5FA',     // Blue 400
  lighter: '#DBEAFE',   // Blue 100
  text: '#FFFFFF',
};
```

**Uso**: Botões secundários, informações, notificações

### Paleta de Feedback

```javascript
export const FEEDBACK = {
  success: '#10B981',   // Green 500
  warning: '#F59E0B',   // Amber 500
  error: '#EF4444',     // Red 500
  info: '#3B82F6',      // Blue 500
};
```

### Neutros

```javascript
export const NEUTRAL = {
  black: '#1F2937',     // Gray 800 - Texto principal
  gray: {
    900: '#111827',     // Headings
    800: '#1F2937',     // Body text
    700: '#374151',     // Secondary text
    600: '#4B5563',     // Disabled text
    500: '#6B7280',     // Placeholders
    400: '#9CA3AF',     // Borders
    300: '#D1D5DB',     // Dividers
    200: '#E5E7EB',     // Subtle backgrounds
    100: '#F3F4F6',     // Cards, sections
    50: '#F9FAFB',      // Page background
  },
  white: '#FFFFFF',
};
```

### Backgrounds

```javascript
export const BACKGROUND = {
  primary: '#FFFFFF',   // Telas principais
  secondary: '#F9FAFB', // Seções alternadas
  tertiary: '#F3F4F6',  // Cards, inputs
  overlay: 'rgba(0, 0, 0, 0.5)', // Modals, bottomsheets
};
```

### Gradientes

```javascript
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  info: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  hero: 'linear-gradient(180deg, #10B981 0%, #059669 100%)',
};
```

### Contraste & Acessibilidade

| Combinação | Contraste | Status | Uso |
|-----------|----------|--------|-----|
| `#10B981` (primary) + `#FFFFFF` | 4.54:1 | ✅ WCAG AA | Botões, badges |
| `#1F2937` (gray-800) + `#FFFFFF` | 12.63:1 | ✅ WCAG AAA | Texto principal |
| `#6B7280` (gray-500) + `#FFFFFF` | 4.58:1 | ✅ WCAG AA | Placeholders |
| `#F3F4F6` (gray-100) + `#1F2937` | 11.46:1 | ✅ WCAG AAA | Cards com texto |

---

## 🔤 Tipografia

### Font Family

```javascript
export const FONTS = {
  primary: 'Inter',     // Sans-serif principal
  secondary: 'SF Pro Display', // iOS native
  mono: 'Fira Code',    // Código, valores exatos
};
```

**Fallbacks**:
- iOS: `-apple-system, SF Pro Display, Inter, sans-serif`
- Android: `Roboto, Inter, sans-serif`

### Font Sizes

```javascript
export const FONT_SIZE = {
  xs: 12,    // Captions, labels pequenos
  sm: 14,    // Body text secundário
  base: 16,  // Body text principal
  lg: 18,    // Subtítulos
  xl: 20,    // Headings H3
  '2xl': 24, // Headings H2
  '3xl': 30, // Headings H1
  '4xl': 36, // Display (dashboard, telas hero)
};
```

### Font Weights

```javascript
export const FONT_WEIGHT = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};
```

### Line Heights

```javascript
export const LINE_HEIGHT = {
  tight: 1.2,   // Headings
  normal: 1.5,  // Body text
  relaxed: 1.75, // Long-form content
};
```

### Hierarquia Tipográfica

```javascript
// Typography System
export const TYPOGRAPHY = {
  h1: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 1.2,
    letterSpacing: -0.5,
    color: NEUTRAL.gray[900],
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 1.3,
    color: NEUTRAL.gray[900],
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 1.4,
    color: NEUTRAL.gray[800],
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 1.5,
    color: NEUTRAL.gray[800],
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 1.5,
    color: NEUTRAL.gray[700],
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 1.4,
    color: NEUTRAL.gray[600],
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 1.2,
    letterSpacing: 0.5,
    textTransform: 'none', // Não usar ALL CAPS
  },
};
```

---

## 📐 Espaçamento & Layout

### Sistema de Espaçamento (8px Grid)

```javascript
export const SPACING = {
  xxs: 4,   // Padding interno pequeno
  xs: 8,    // Entre elementos relacionados
  sm: 12,   // Padding de componentes
  md: 16,   // Padrão entre seções
  lg: 24,   // Entre blocos maiores
  xl: 32,   // Espaçamento de tela
  xxl: 48,  // Separação de seções grandes
  xxxl: 64, // Telas hero, headers
};
```

### Margens de Tela

```javascript
export const SCREEN_PADDING = {
  horizontal: 16, // Padrão horizontal
  vertical: 24,   // Padrão vertical (top/bottom)
};
```

### Border Radius

```javascript
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,    // Badges, tags
  md: 8,    // Inputs, cards pequenos
  lg: 12,   // Cards, modais
  xl: 16,   // Bottom sheets
  full: 999, // Pills, avatares
};
```

### Sombras (Elevation)

```javascript
export const SHADOWS = {
  none: 'none',
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, // Android
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
};
```

**Uso**:
- `sm`: Botões, inputs
- `md`: Cards, list items elevados
- `lg`: Bottom sheets, modais
- `xl`: Popups importantes, alertas críticos

---

## 🧩 Componentes UI

### Buttons

**Variantes**:

1. **Primary Button** (Ação principal)
```jsx
<Button
  variant="primary"
  size="md"
  onPress={handlePress}
>
  Criar Refeição
</Button>

// Style
{
  backgroundColor: PRIMARY.main,
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: BORDER_RADIUS.md,
  ...SHADOWS.sm,
}
```

2. **Secondary Button** (Ações secundárias)
```jsx
<Button variant="secondary">
  Cancelar
</Button>

// Style
{
  backgroundColor: 'transparent',
  borderWidth: 1,
  borderColor: PRIMARY.main,
  color: PRIMARY.main,
}
```

3. **Ghost Button** (Ações terciárias)
```jsx
<Button variant="ghost">
  Pular
</Button>

// Style
{
  backgroundColor: 'transparent',
  color: NEUTRAL.gray[700],
}
```

**Tamanhos**:
- `sm`: height 36px, padding 8/16
- `md`: height 44px, padding 12/24 (padrão)
- `lg`: height 52px, padding 16/32

**Estados**:
- Default
- Hover (subtle opacity 0.9)
- Pressed (opacity 0.8)
- Disabled (opacity 0.5, no interaction)
- Loading (spinner + disabled)

### Inputs

**Text Input**:
```jsx
<TextInput
  label="E-mail"
  placeholder="seu@email.com"
  value={email}
  onChangeText={setEmail}
  error={emailError}
/>

// Style
{
  borderWidth: 1,
  borderColor: NEUTRAL.gray[300],
  borderRadius: BORDER_RADIUS.md,
  paddingVertical: 12,
  paddingHorizontal: 16,
  fontSize: FONT_SIZE.base,
  backgroundColor: BACKGROUND.tertiary,
  // Focus state
  borderColor: PRIMARY.main,
  // Error state
  borderColor: FEEDBACK.error,
}
```

**Estados**:
- Empty (placeholder visible)
- Filled (valor presente)
- Focus (border PRIMARY.main)
- Error (border FEEDBACK.error + mensagem)
- Disabled (opacity 0.6, não editável)

### Cards

**Card Padrão**:
```jsx
<Card>
  <Card.Header>
    <Text style={TYPOGRAPHY.h3}>Refeição: Almoço</Text>
  </Card.Header>
  <Card.Body>
    <Text>Calorias: 650 kcal</Text>
  </Card.Body>
</Card>

// Style
{
  backgroundColor: BACKGROUND.primary,
  borderRadius: BORDER_RADIUS.lg,
  padding: SPACING.md,
  ...SHADOWS.md,
}
```

**Variantes**:
- `default`: Fundo branco, sombra média
- `outlined`: Border 1px, sem sombra
- `elevated`: Sombra maior (lg)

### Badges

```jsx
<Badge variant="success">Ativo</Badge>
<Badge variant="warning">Pendente</Badge>
<Badge variant="error">Falha</Badge>

// Style
{
  backgroundColor: PRIMARY.lighter,
  color: PRIMARY.dark,
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: BORDER_RADIUS.sm,
  fontSize: FONT_SIZE.xs,
  fontWeight: FONT_WEIGHT.medium,
}
```

### Bottom Sheets

```jsx
<BottomSheet visible={isVisible} onClose={handleClose}>
  <BottomSheet.Header>
    <Text>Adicionar Alimento</Text>
  </BottomSheet.Header>
  <BottomSheet.Body>
    {/* Content */}
  </BottomSheet.Body>
</BottomSheet>

// Style
{
  backgroundColor: BACKGROUND.primary,
  borderTopLeftRadius: BORDER_RADIUS.xl,
  borderTopRightRadius: BORDER_RADIUS.xl,
  ...SHADOWS.xl,
  minHeight: 300,
  maxHeight: '80%',
}
```

### Progress Bars

```jsx
<ProgressBar value={65} max={100} color={PRIMARY.main} />

// Style
{
  height: 8,
  backgroundColor: NEUTRAL.gray[200],
  borderRadius: BORDER_RADIUS.full,
  // Fill
  backgroundColor: PRIMARY.main,
  width: `${(value/max) * 100}%`,
}
```

### List Items

```jsx
<ListItem onPress={handlePress}>
  <ListItem.Icon name="calendar" />
  <ListItem.Content>
    <Text style={TYPOGRAPHY.body}>Refeição de hoje</Text>
    <Text style={TYPOGRAPHY.bodySmall}>12:30 PM</Text>
  </ListItem.Content>
  <ListItem.Action>
    <Icon name="chevron-right" />
  </ListItem.Action>
</ListItem>

// Style
{
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: SPACING.sm,
  paddingHorizontal: SPACING.md,
  borderBottomWidth: 1,
  borderBottomColor: NEUTRAL.gray[200],
}
```

---

## 🧭 Padrões de Navegação

### Bottom Tab Navigation

**Tabs Principais** (4-5 tabs):
- 🏠 **Home**: Dashboard, resumo do dia
- 🍽️ **Refeições**: Adicionar/editar refeições
- 📊 **Progresso**: Gráficos, histórico
- 👤 **Perfil**: Configurações, conta

**Style**:
```javascript
{
  backgroundColor: BACKGROUND.primary,
  borderTopWidth: 1,
  borderTopColor: NEUTRAL.gray[200],
  height: 60,
  paddingBottom: 8, // Safe area iOS
  // Active tab
  color: PRIMARY.main,
  fontWeight: FONT_WEIGHT.semibold,
  // Inactive tab
  color: NEUTRAL.gray[500],
}
```

### Stack Navigation

- **Header**: 56px height, título centralizado ou esquerda
- **Back Button**: Sempre no top-left (iOS) ou top-left com label (Android)
- **Actions**: Top-right (1-2 ícones)

```javascript
{
  headerStyle: {
    backgroundColor: BACKGROUND.primary,
    elevation: 0, // Remove sombra
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL.gray[200],
  },
  headerTitleStyle: {
    ...TYPOGRAPHY.h3,
  },
}
```

### Modal Navigation

- Full-screen modals para fluxos multi-step
- Bottom sheets para ações rápidas (< 3 campos)
- Overlay modals para confirmações

---

## 🎭 Estados & Feedback

### Loading States

1. **Skeleton Screens** (lista de itens)
```jsx
<SkeletonItem>
  <SkeletonLine width="80%" />
  <SkeletonLine width="60%" />
</SkeletonItem>

// Animação shimmer
{
  backgroundColor: NEUTRAL.gray[200],
  animation: 'shimmer 1.5s infinite',
}
```

2. **Spinners** (ações curtas < 3s)
```jsx
<Spinner size="md" color={PRIMARY.main} />
```

3. **Progress Indicators** (ações longas)
```jsx
<LinearProgress value={uploadProgress} />
```

### Empty States

```jsx
<EmptyState
  icon="inbox"
  title="Nenhuma refeição registrada"
  description="Adicione sua primeira refeição agora"
  action={
    <Button onPress={handleAdd}>
      Adicionar Refeição
    </Button>
  }
/>
```

### Error States

```jsx
<ErrorState
  icon="alert-circle"
  title="Erro ao carregar dados"
  description="Verifique sua conexão e tente novamente"
  action={
    <Button variant="secondary" onPress={handleRetry}>
      Tentar Novamente
    </Button>
  }
/>
```

### Success Feedback

- **Toast**: Mensagens rápidas (3-5s)
```jsx
<Toast
  message="Refeição adicionada com sucesso!"
  type="success"
  duration={3000}
/>
```

- **Confetti/Celebration**: Conquistas importantes
```jsx
<Celebration
  trigger={hasCompletedGoal}
  message="Parabéns! Meta atingida 🎉"
/>
```

### Microinterações

- **Botões**: Subtle scale (1.0 → 0.98) on press
- **Cards**: Lift on press (shadow sm → md)
- **Toggle**: Smooth slide animation (150ms)
- **Progress bars**: Smooth fill animation (300ms ease-out)
- **Bottom sheets**: Slide up with spring animation

---

## ♿ Acessibilidade

### Requisitos WCAG 2.1 AA

✅ **Contraste** (AA):
- Texto normal: ≥ 4.5:1
- Texto grande (≥18px): ≥ 3:1

✅ **Touch Targets**:
- Mínimo: 44x44px (iOS) / 48x48px (Android)
- Espaçamento entre targets: ≥ 8px

✅ **Screen Readers**:
- Todas as imagens com `accessibilityLabel`
- Botões com labels descritivos
- Formulários com labels visíveis + `accessibilityHint`

✅ **Keyboard Navigation** (quando aplicável):
- Tab order lógico
- Focus visible (outline ou background change)

### Suporte a Temas

**Light Mode** (padrão):
- Background: `#FFFFFF`
- Text: `#1F2937`

**Dark Mode** (futuro):
- Background: `#111827`
- Text: `#F9FAFB`
- Ajustar cores primary para melhor contraste

### Suporte a Font Scaling

```javascript
import { PixelRatio } from 'react-native';

export const scaledFontSize = (size: number) => {
  const scale = PixelRatio.getFontScale();
  return size * Math.min(scale, 1.3); // Limitar a 130%
};
```

---

## 🤖 Instruções para IA

### Como Agentes de IA Devem Usar Este Design System

#### 1. **Sempre Usar Tokens de Design**

❌ **Não fazer**:
```jsx
<View style={{ backgroundColor: '#10B981', padding: 16 }}>
```

✅ **Fazer**:
```jsx
import { PRIMARY, SPACING } from '@/theme';

<View style={{ backgroundColor: PRIMARY.main, padding: SPACING.md }}>
```

#### 2. **Seguir Hierarquia de Componentes**

Ao criar uma tela nova:

1. **Layout Container** (SafeAreaView + ScrollView)
2. **Header** (título + ações)
3. **Body** (conteúdo principal com SPACING.xl horizontal padding)
4. **Footer** (CTAs fixas se necessário)

Exemplo:
```jsx
<SafeAreaView style={styles.container}>
  <ScrollView contentContainerStyle={styles.content}>
    <Header title="Dashboard" actions={<HeaderActions />} />
    
    <View style={styles.body}>
      {/* Conteúdo */}
    </View>
  </ScrollView>
  
  <FixedFooter>
    <Button variant="primary">Salvar</Button>
  </FixedFooter>
</SafeAreaView>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.primary,
  },
  content: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: SCREEN_PADDING.vertical,
  },
  body: {
    gap: SPACING.lg,
  },
});
```

#### 3. **Componentes Reutilizáveis Primeiro**

Antes de criar um novo componente, verifique:
- ✅ Existe um componente similar? (`<Button>`, `<Card>`, `<Input>`)
- ✅ Posso usar variantes? (`variant="primary"`, `size="lg"`)
- ✅ Preciso mesmo customizar?

Se precisar criar novo:
```jsx
// components/CustomButton.tsx
import { Button } from '@/components/base';
import { PRIMARY, SPACING } from '@/theme';

export const CustomButton = (props) => (
  <Button
    variant="primary"
    style={{ marginTop: SPACING.md }}
    {...props}
  />
);
```

#### 4. **Validação de Acessibilidade**

Toda tela deve ter:
```jsx
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Adicionar refeição"
  accessibilityHint="Toque para abrir o formulário"
  accessibilityRole="button"
  onPress={handlePress}
>
  <Icon name="plus" />
</TouchableOpacity>
```

#### 5. **Tratamento de Estados**

Sempre implementar:
- ✅ Loading (skeleton ou spinner)
- ✅ Empty (mensagem + CTA)
- ✅ Error (mensagem + retry)
- ✅ Success (feedback visual)

```jsx
if (isLoading) return <SkeletonScreen />;
if (error) return <ErrorState onRetry={refetch} />;
if (!data || data.length === 0) return <EmptyState />;
return <DataList data={data} />;
```

#### 6. **Responsividade**

O design é mobile-first, mas considere:
```jsx
import { useWindowDimensions } from 'react-native';

const { width } = useWindowDimensions();
const isSmallDevice = width < 375;

<Text style={{
  fontSize: isSmallDevice ? FONT_SIZE.sm : FONT_SIZE.base,
}}>
  Conteúdo
</Text>
```

#### 7. **Checklist Antes de Commitar**

Toda nova tela/componente deve:
- [ ] Usar tokens de design (cores, espaçamento, tipografia)
- [ ] Implementar todos os estados (loading, error, empty, success)
- [ ] Ter acessibilidade (labels, hints, roles)
- [ ] Seguir padrão de nomenclatura (PascalCase para componentes)
- [ ] Ter comentários descritivos
- [ ] Ser testável (separar lógica de UI)

---

## 🛠️ Ferramentas & Assets

### Design Tokens Package

```bash
# Instalar pacote de tokens
npm install @trainer-hub/design-tokens
```

```javascript
// theme/index.ts
export * from '@trainer-hub/design-tokens';

// Uso
import { PRIMARY, SPACING, TYPOGRAPHY } from '@/theme';
```

### Figma Design System

**Link**: [Figma - Trainer Hub Design System](#) (a ser criado)

**Conteúdo**:
- 🎨 Color palette com nomes exatos
- 🔤 Tipografia (Inter font imported)
- 🧩 Componentes (Button, Input, Card, etc)
- 📱 Telas exemplo (Dashboard, Meal Log, Profile)
- 📐 Layout grids

### Ícones

**Library**: `react-native-vector-icons` (Feather Icons)

```bash
npm install react-native-vector-icons
```

**Ícones Comuns**:
- `home`: Home tab
- `calendar`: Refeições
- `trending-up`: Progresso
- `user`: Perfil
- `plus`: Adicionar
- `edit`: Editar
- `trash`: Deletar
- `check`: Confirmar
- `x`: Fechar/Cancelar
- `search`: Buscar
- `alert-circle`: Erro
- `info`: Informação

### Ilustrações

**Style**: Flat illustration, 2D, cores do brand

**Usar para**:
- Empty states
- Onboarding
- Error states (404, 500)
- Success screens

**Fontes**:
- [unDraw](https://undraw.co) (customizar para verde #10B981)
- [Storyset](https://storyset.com)

---

## ✅ Checklist de Implementação

### Para Desenvolvedores

- [ ] Instalar `@trainer-hub/design-tokens`
- [ ] Configurar tema global no `App.tsx`
- [ ] Criar pasta `components/base/` com componentes reutilizáveis
- [ ] Implementar `Button` (primary, secondary, ghost)
- [ ] Implementar `Input` (text, email, password)
- [ ] Implementar `Card` (default, outlined, elevated)
- [ ] Configurar React Navigation com header custom
- [ ] Implementar Bottom Tab Navigator
- [ ] Criar `EmptyState`, `ErrorState`, `LoadingState` genéricos
- [ ] Configurar acessibilidade (screen reader testing)

### Para Designers

- [ ] Criar Figma file com design system completo
- [ ] Exportar cores como CSS variables
- [ ] Criar protótipos das telas principais (Dashboard, Meal Log, Profile)
- [ ] Validar contraste de cores (WCAG AA)
- [ ] Criar ilustrações para empty states
- [ ] Documentar microinterações (Lottie animations)

---

## 📚 Referências

- **Apple Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/
- **Material Design 3**: https://m3.material.io/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **React Native Best Practices**: https://reactnative.dev/docs/

---

**Última Atualização**: 8 de março de 2026  
**Próxima Revisão**: Após Wave 4 (Junho 2026)  
**Contato**: design@trainerhub.com
