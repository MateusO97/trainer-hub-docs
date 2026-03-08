# 🚨 GitHub Actions Troubleshooting

## Workflow falhando? Siga estes passos:

### 1️⃣ Habilite GitHub Pages (OBRIGATÓRIO)

O erro mais comum:
```
Error: Get Pages site failed. Please verify that the repository has Pages enabled
```

**Solução**:
1. Vá em: https://github.com/MateusO97/trainer-hub-docs/settings/pages
2. Em "Build and deployment":
   - **Source**: Selecione **"GitHub Actions"**
   - NÃO use "Deploy from a branch"
3. Clique em Save
4. Aguarde 1 minuto
5. Vá em Actions e clique em "Re-run all jobs"

---

### 2️⃣ Workflow atualizado (ações v3 → v5)

Os erros foram corrigidos:
- ✅ `actions/configure-pages@v5` (era v4)
- ✅ `actions/upload-pages-artifact@v3` (sem cache Node.js)
- ✅ Removido setup-node (desnecessário para HTML estático)

---

### 3️⃣ Faça commit e push da correção

```bash
cd /Users/mateus/Documents/trainer-hub/trainer-hub-docs

# Verificar mudanças
git status

# Adicionar arquivos atualizados
git add .github/workflows/deploy-pages.yml
git add DOCSIFY-SETUP.md
git add TROUBLESHOOTING.md

# Commit
git commit -m "fix(ci): update GitHub Actions workflow to v5 and fix Pages deployment

- Update actions/configure-pages from v4 to v5
- Remove unnecessary Node.js setup (Docsify is static HTML)
- Add environment configuration for github-pages
- Update troubleshooting docs with clear setup steps

Fixes workflow errors:
- deprecated actions/upload-artifact v3
- Pages not enabled error
- Node.js cache resolution error"

# Push
git push origin master
```

---

### 4️⃣ Monitore o workflow

1. Vá em: https://github.com/MateusO97/trainer-hub-docs/actions
2. Aguarde o workflow "Deploy Docsify to GitHub Pages" completar
3. Status esperado: ✅ verde
4. Tempo: ~2-3 minutos

---

### 5️⃣ Acesse o site

Após deploy com sucesso:
- 🌐 https://mateuso97.github.io/trainer-hub-docs/

---

## Checklist de Deploy

- [ ] GitHub Pages habilitado (Settings → Pages → Source: GitHub Actions)
- [ ] Workflow atualizado (commit + push)
- [ ] Workflow rodou com sucesso (Actions → ✅)
- [ ] Site acessível (URL acima)

---

## Mais ajuda

Ver documentação completa: [DOCSIFY-SETUP.md](DOCSIFY-SETUP.md)
