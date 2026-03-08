module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type enum
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova feature
        'fix',      // Bug fix
        'docs',     // Documentação
        'style',    // Formatação (não muda lógica)
        'refactor', // Refactoring (não muda comportamento)
        'perf',     // Performance improvement
        'test',     // Adicionar/modificar testes
        'chore',    // Manutenção (deps, config)
        'ci',       // CI/CD changes
        'build',    // Build system changes
        'revert',   // Revert previous commit
      ],
    ],
    
    // Scope rules
    'scope-case': [2, 'always', 'kebab-case'],
    'scope-empty': [1, 'never'], // Warning, não bloqueia
    
    // Subject rules
    'subject-case': [
      2,
      'never',
      ['upper-case', 'pascal-case', 'start-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-min-length': [2, 'always', 10],
    'subject-max-length': [2, 'always', 100],
    
    // Header rules
    'header-max-length': [2, 'always', 120],
    
    // Body rules
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 120],
    
    // Footer rules
    'footer-leading-blank': [1, 'always'],
  },
};
