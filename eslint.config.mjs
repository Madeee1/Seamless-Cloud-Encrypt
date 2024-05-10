import eslintConfigPrettier from 'eslint-config-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  eslintConfigPrettier,
  files: ['**/*.ts', '**/*.tsx'],
})
