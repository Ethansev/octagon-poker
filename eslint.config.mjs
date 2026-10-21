import nextVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  ...nextVitals,
  {
    files: ['src/components/ui/**', 'src/hooks/use-mobile.ts'],
    rules: { 'react-hooks/set-state-in-effect': 'off', 'react-hooks/purity': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
