# 📝 Configuração do GitHub Pages

## Como Habilitar GitHub Pages

1. **Acesse as configurações do repositório**:
   - Vá em: https://github.com/MateusO97/trainer-hub-docs/settings/pages

2. **Configure a source**:
   - Em "Build and deployment"
   - Source: **GitHub Actions**

3. **GitHub Actions já configurado**:
   - O workflow `.github/workflows/deploy-pages.yml` já está configurado
   - Ele faz deploy automático sempre que houver push na branch `master`

4. **Acesse a documentação**:
   - URL: https://mateuso97.github.io/trainer-hub-docs/
   - Pode levar alguns minutos para o primeiro deploy

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
