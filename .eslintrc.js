module.exports = {
  extends: ['expo'],
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': 'warn', // Cambiado de 'error' a 'warn'
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-require-imports': 'warn', // Agregado para manejar require()
    
    // React rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'warn', // Agregado para manejar comillas
    
    // General rules
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': 'error',
    'no-alert': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'no-dupe-keys': 'error', // Agregado para manejar claves duplicadas
    'no-undef': 'error', // Agregado para manejar __dirname
    'import/no-unresolved': 'warn', // Agregado para manejar imports no resueltos
    'import/no-named-as-default': 'warn', // Agregado para imports por defecto
  },
  env: {
    'react-native/react-native': true,
    es6: true,
    node: true,
    jest: true,
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
        '@typescript-eslint/no-require-imports': 'off', // Permitir require en tests
      },
    },
    {
      files: ['**/*.js'], // Para archivos JavaScript
      env: {
        node: true,
      },
      rules: {
        'no-undef': 'off', // Permitir __dirname en archivos .js
      },
    },
  ],
};
