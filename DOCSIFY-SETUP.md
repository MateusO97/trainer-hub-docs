# 📝 Configuração do GitHub Pages

## ⚠️ IMPORTANTE: Habilite GitHub Pages PRIMEIRO

**Antes de rodar o workflow**, você PRECISA habilitar GitHub Pages manualmente:

### Passos Obrigatórios:

1. **Acesse as configurações do repositório**:
   ```
   https://github.com/MateusO97/trainer-hub-docs/settings/pages
   ```

2. **Habilite GitHub Pages**:
   - Em "Build and deployment"
   - **Source**: Selecione **"GitHub Actions"** (não "Deploy from a branch")
   - Clique em "Save" se aparecer o botão

3. **Aguarde a confirmação**:
   - Você verá uma mensagem: "GitHub Pages source saved"
   - Agora o workflow pode rodar com sucesso

4. **Faça o push (ou re-run workflow)**:
   - Push para `master` ou vá em Actions → Re-run workflow
   - O deploy rodará automaticamente
   - Aguarde ~2-3 minutos

5. **Acesse a documentação**:
   - URL: https://mateuso97.github.io/trainer-hub-docs/
   - Pode levar alguns minutos para o primeiro deploy

---

## 🔧 Troubleshooting

### ❌ Erro: "GitHub Pages not enabled"

**Sintoma**:
```
Error: Get Pages site failed. Please verify that the repository has Pages 
enabled and configured to build using GitHub Actions
```

**Solução**:
1. Vá em Settings → Pages
2. Source: **GitHub Actions** (não "Deploy from a branch")
3. Aguarde 1 minuto
4. Force novo deploy: Actions → Re-run all jobs

---

### ❌ Erro: "deprecated version of actions/upload-artifact: v3"

**Sintoma**:
```
Error: This request has been automatically failed because it uses a 
deprecated version of `actions/upload-artifact: v3`
```

**Solução**: ✅ Workflow atualizado! Agora usa `actions/configure-pages@v5`.

---

### ❌ Erro: "Some specified paths were not resolved" (Node.js)

**Sintoma**:
```
Error: Some specified paths were not resolved, unable to cache dependencies.
```

**Solução**: ✅ Workflow corrigido! Não usa mais Node.js (Docsify é HTML estático puro).

---

## Estrutura Docsify

```
trainer-hub-docs/
├── index.html          # Configuração principal do Docsify
├── _coverpage.md       # Landing page com cover
├── _sidebar.md         # Menu de navegação lateral
├── .nojekyll          # Arquivo necessário para GitHub Pages
├── README.md          # Página inicial
└── docs/              # Documentação markdown
```

## Funcionalidades

- ✅ **Cover page** elegante com gradient
- ✅ **Sidebar** com navegação completa
- ✅ **Search** integrado em toda documentação
- ✅ **Copy code** com um clique
- ✅ **Pagination** entre páginas
- ✅ **Mermaid** para diagramas
- ✅ **Syntax highlighting** para múltiplas linguagens
- ✅ **Zoom de imagens**
- ✅ **Tabs** para conteúdo organizado
- ✅ **Tema Vue** moderno e responsivo

## Desenvolvimento Local

Para testar localmente:

```bash
# Instalar docsify-cli globalmente
npm i docsify-cli -g

# Executar servidor local
docsify serve .

# Acessar: http://localhost:3000
```

## Atualizar Documentação

1. Edite qualquer arquivo `.md` no repositório
2. Faça commit e push para `master`
3. GitHub Actions fará deploy automático
4. Documentação atualizada em ~2 minutos

## Customização

### Tema e Cores

Edite o `<style>` em `index.html`:

```css
:root {
  --theme-color: #6366f1;  /* Cor primária */
  --theme-color-dark: #4f46e5;  /* Cor secundária */
}
```

### Adicionar Nova Página

1. Crie um arquivo `.md` em `docs/`
2. Adicione link em `_sidebar.md`
3. Commit e push

### Plugins Adicionais

Ver: https://docsify.js.org/#/awesome?id=plugins

## Troubleshooting

### Página 404
- Verifique se GitHub Pages está habilitado
- Verifique se o branch está correto (master)
- Aguarde alguns minutos após o primeiro deploy

### Sidebar não aparece
- Verifique se `_sidebar.md` existe na raiz
- Verifique se `loadSidebar: true` está em `index.html`

### Diagramas Mermaid não renderizam
- Aguarde o carregamento completo da página
- Verifique se o código Mermaid está dentro de blocos \`\`\`mermaid

## Links Úteis

- [Docsify Docs](https://docsify.js.org/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Mermaid Docs](https://mermaid.js.org/)
