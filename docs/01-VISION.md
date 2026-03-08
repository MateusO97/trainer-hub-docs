# TrAIner Hub - Visão do Produto

**Data**: Março 2026  
**Versão**: 1.0  
**Status**: Aprovado para Fase 1

---

## 1. O Problema

### A Dor do Usuário

Acompanhar uma dieta é uma tarefa **tediosa, fragmentada e imprecisa**. Usuários enfrentam desafios críticos:

1. **Entrada Manual Demorada**: Registrar refeições é lento (média 3-5 minutos por refeição)
2. **Inconsistência de Dados**: Macros variam entre apps (MyFitnessPal vs. manualmente em Excel)
3. **Falta de Inteligência**: Apps não sugerem alternativas intelligentes quando macros estão desbalanceados
4. **Sem Sincronização**: Plano planejado em casa não se conecta com o acompanhamento real consumido
5. **Sobrecarga de Informação**: Dashboards complexos sem insights acionáveis
6. **Falta de Contexto**: "Você comeu 80% de carbos" sem sugestões do que ajustar

### Oportunidade

**Inteligência Artificial + Sincronização em Tempo Real** podem resolver este problema:

- IA pode buscar dados nutricionais de forma inteligente (fallback: Nutritionix → OpenAI → formulação própria)
- IA pode sugerir alimentos alternativos com macros superiores ("frango + brócolis" em vez de "carne + batata")
- Sincronização de dados entre dispositivos (mobile/web) evita divergências
- Algoritmos de machine learning podem aprender padrões do usuário e propor otimizações

**Mercado Validado**: 2M+ usuários/mês usam MyFitnessPal, 500k+ usam Fittr. Demanda existe. Oportunidade de solução melhor.

---

## 2. Diferencial Competitivo

### O que TrAIner Hub Faz Melhor

| Aspecto | TrAIner Hub | MyFitnessPal | Fittr | Macros |
|--------|-----------|-----------|-------|--------|
| **Busca de Alimentos IA** | ✅ Sugestões inteligentes com fallback | ❌ Apenas busca de banco | ⚠️ Básica | ❌ Manual |
| **Alimentos Alternativos** | ✅ Sugestões de macros melhores | ❌ Sem sugestões | ⚠️ Limitado | ❌ Sem sugestões |
| **Sincronização Real-time** | ✅ Plano ↔ Consumo sync | ❌ Siloed | ✅ Bom | ✅ Bom |
| **Interface Modal de Refeição** | ✅ Feedback imediato | ❌ Página inteira | ✅ Similar | ✅ Similar |
| **Inteligência em Macros** | ✅ Sugestões para próx. refeição | ❌ Apenas visualização | ⚠️ Básica | ⚠️ Básica |
| **Relatórios Acionáveis** | ✅ "Coloque + 50g proteína amanhã" | ❌ Apenas gráficos | ⚠️ Simples | ⚠️ Simples |
| **API Aberta** | ✅ Planejado Fase 4 | ⚠️ Premium | ✅ Sim | ❌ Não |
| **Offline-first** | ✅ Funciona sem internet | ❌ Requer sync | ⚠️ Limitado | ⚠️ Limitado |

### Pilares do Diferencial

1. **IA Nativa no Core**: Não é feature, é arquitetura
2. **Foco em Aderência**: Métricas centradas em manter usuários no plano
3. **Desenho para Fitness**: Linguagem, padrões, features pensadas para atletas
4. **Escalabilidade**: Microsserviços que suportam crescimento até 1M usuarios

---

## 3. User Personas

### Persona 1: **Gabriel (Atleta Amador)**

- **Idade/Profissão**: 32 anos, engenheiro, treina crossfit 4x/semana
- **Objetivo**: Ganho muscular com perda de gordura (recomposição)
- **Dor**: "Preciso de 150g de proteína/dia, mas nunca sei se estou atingindo. MyFitnessPal é slow demais"
- **Sucesso em TrAIner Hub**: Registra refeição em < 1 minuto, vê macros em tempo real, recebe sugestão "faltam 30g proteína, toma whey ou frango"
- **Disposição a Pagar**: R$ 30-50/mes pelo premium (integração com Apple Health, relatórios avançados)

### Persona 2: **Marina (Pessoa em Dieta)**

- **Idade/Profissão**: 28 anos, consultora, quer perder 10kg em 3 meses
- **Objetivo**: Perda de peso sustentável com flexibilidade
- **Dor**: "Outras apps me fazem contar calorias manualmente. Quero algo mais fácil e que me diga se estou no caminho certo"
- **Sucesso em TrAIner Hub**: Planeja semana com IA ("refeições balanceadas 1500 cal"), acompanha consumo real, vê comparação visual (plano vs. realizado) com comentários tipo "Ótima semana! Continue assim"
- **Disposição a Pagar**: R$ 10-20/mes (ou free com ads)

### Persona 3: **Dr. Roberto (Profissional de Nutrição)**

- **Idade/Profissão**: 45 anos, nutricionista, acompanha 30+ clientes
- **Objetivo**: Oferecer ferramenta melhor aos clientes, monitora aderência
- **Dor**: "Clientes não rastreiam bem, preciso gastar tempo entrando em Excel. Não há ferramenta b2b para nutricionistas"
- **Sucesso em TrAIner Hub**: Cria plano no app, compartilha link com cliente, vê dashboard com aderência/sugestões, exporta relatórios
- **Disposição a Pagar**: R$ 100-200/mes por account com múltiplos clientes

---

## 4. MVP vs. Produto Completo

### MVP (Fase 1-3): Core Essencial (3-4 meses)

**Módulos Implementados**:

1. **Planejamento de Dieta**
   - Criar plano com macro targets (proteína, carbs, gordura, calorias)
   - Adicionar refeições ao plano (café, almoço, lanche, jantar)
   - Busca de alimentos com IA (fallback: Nutritionix → OpenAI)
   - Favoritos de alimentos

2. **Acompanhamento (Tracking)**
   - 3 formas de registrar: manual, favoritos, do plano
   - Modal mostrando macros registrados vs. target
   - Edição individual de macros
   - Histórico por data

3. **Monitoramento e Análise**
   - Dashboard diário com consumo vs. target
   - Gráficos simples (macros, calorias, progresso)
   - Histórico semanal com médias

4. **IA e Otimização (Básico)**
   - Sugestões de alimentos alternativos (mesmo macro, melhor nutrição)
   - Detecção de alimentos com macros inconsistentes

5. **Infraestrutura**
   - Mobile app (React Native)
   - 10 microsserviços
   - PostgreSQL + MongoDB
   - RabbitMQ para eventos

**Features Não Incluídas no MVP**:
- Pagamento e planos premium
- Integração com wearables (Apple Watch, Fitbit)
- Coaching comunitário
- Sincronização com nutricionistas
- APIs públicas
- Analytics avançado

### Roadmap Fase 4+: Escalabilidade (Após MVP)

**Q3 2026: Premium Features**
- [ ] Planos pagos (básico, pro, pro+)
- [ ] Integração Apple Health / Google Fit
- [ ] Export PDF de relatórios
- [ ] Histórico ilimitado (MVP: 6 meses)

**Q4 2026: Comunidade e Coaching**
- [ ] Grupos privados de usuários
- [ ] Leaderboards mensais (aderência)
- [ ] Coaching 1:1 por nutricionistas cadastrados
- [ ] Fórum de receitas otimizadas

**2027: API e Ecossistema**
- [ ] API REST pública (para apps de terceiros)
- [ ] Integrações com gym management systems
- [ ] Webhook para fitness trackers custom
- [ ] SDK para plataformas de saúde corporativa

**2027-2028: Scale e Monetização**
- [ ] Suporte a múltiplas linguagens
- [ ] Expansão geográfica (preços nutricionais locais)
- [ ] B2B para redes de academias
- [ ] Modelo Enterprise para hospitais/clínicas

---

## 5. Métricas de Sucesso

Mediremos o sucesso do MVP com as seguintes KPIs:

| Métrica | Target (ano 1) | Como Medir | Importância |
|---------|---|---|---|
| **Retention (D30)** | > 60% | % users que voltam após 30 dias | 🔴 CRÍTICA |
| **Aderência ao Plano** | > 85% | % dias que macros estão ±10% do target | 🔴 CRÍTICA |
| **Meals Logged/dia** | 3+  | Média de refeições registradas/dia | 🟠 ALTA |
| **Session Duration** | 5-10 min | Tempo médio gasto na app/dia | 🟠 ALTA |
| **Churn Rate** | < 10%/mês | % usuarios inativos/mês | 🟠 ALTA |
| **NPS (Net Promoter Score)** | > 50 | Quão provável recomendar (0-100) | 🟡 MÉDIA |
| **Food Search Time** | < 30s | Tempo para registrar uma refeição | 🟡 MÉDIA |
| **IA Suggestion Adoption** | > 30% | % vezes que usuário aceita sugestão IA | 🟡 MÉDIA |

### Hipóteses de Crescimento

- **Aquisição**: 100 usuários/semana via product hunt, organic search, comunidades fitness
- **Ativação**: 70% dos signups completa primeira refeição
- **Retention**: 60%+ voltam em 30 dias (vs. 30% em apps competidores)
- **Monetização Fase 4**: 10% convertem para premium (R$ 30/mês avg)

---

## 6. Visão de 2-3 Anos

### Year 1 (2026): Market Penetration

- **Usuários**: 50k ativos
- **Foco**: Validar product-market fit, atingir KPIs de retention/aderência
- **Geograpia**: Brasil
- **Receita**: $0 (MVP gratuito para validação)

### Year 2 (2027): Scale e Premium

- **Usuários**: 250k ativos
- **Features**: Wearables, nutritionist dashboard, comunidade
- **Monetização**: 10-15% em planos pagos (ARPU R$ 40/mês)
- **Receita**: R$ 1-1.5M/ano
- **Expansão**: Espanha, Argentina, México (português + espanhol)

### Year 3 (2028): Ecossistema

- **Usuários**: 1M+ ativos
- **Modelo**: B2B (academias, clínicas), B2C premium, APIs
- **Integrações**: 50+ wearables, health platforms, gym management
- **Receita**: R$ 10-15M/ano (mix B2B + B2C)
- **Expansão**: EUA, Europa (parceria local)

### Visão Estratégica 2030

**TrAIner Hub** será a **plataforma padrão para otimização nutricional** - o que Fittr é para treinamento e Strava para corrida, TrAIner Hub é para dieta inteligente.

- Usuários em 20+ países
- Parcerias com marcas de suplementos, food brands
- Integração nativa em smartwatches
- IA que treina modelo custom por usuário (preferências, biometria)
- Comunidade de 100k+ nutrition enthusiasts

---

## 7. Princípios de Design e Produto

### Princípios Centrais

1. **Velocidade**: Registrar refeição em < 1 min (vs. 3-5 min em apps tradicionais)
2. **Inteligência**: IA ajuda, não complica. Sugestões acionáveis, não apenas dados
3. **Confiança**: Dados sincronizados, sem perda, offline-first quando possível
4. **Foco**: Menos features, mais profundidade. Dietética primeiro, analytics depois
5. **Jornada**: Simples para iniciantes, poderoso para experts

### Decisões de Produto

- ❌ **Não faremos**: Calorie counter genérico (MyFitnessPal já faz bem)
- ✅ **Focaremos em**: Macro optimization + IA-driven suggestions
- ❌ **Não suportaremos**: Múltiplos idiomas no MVP (português/português-brasil)
- ✅ **Suportaremos**: Integração com APIs de nutrição (Nutritionix, USDA, local)

---

## 8. Conclusão

**TrAIner Hub** resolve um problema real e validado (2M+ usuários em apps existentes), oferecendo diferencial claro (IA nativa) e plano de crescimento realista.

O MVP focará em **planejamento + acompanhamento inteligente**, com roadmap claro para premium, comunidade e API.

Sucesso será medido por **retention > 60% e aderência ao plano > 85%** - métricas que importam mais que downloads.

**Horizonte**: 1M usuários em 3 anos, R$ 10-15M de receita, platform padrão de otimização nutricional.

---

**Próximos Passos**:
1. ✅ Validar visão com 20+ users-alvo (entrevistas)
2. ✅ Iniciar Fase 1.2 (Arquitetura de Microsserviços)
3. ✅ Prototipar UI da refeição (validar velocidade de entrada)
