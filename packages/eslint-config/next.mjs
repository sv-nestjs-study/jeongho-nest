import eslintConfigPrettier from 'eslint-config-prettier';
import nextConfig from 'eslint-config-next';

export default [
  { ignores: ['.next/**', 'dist/**', 'node_modules/**', 'next-env.d.ts'] },
  ...nextConfig,
  eslintConfigPrettier,
  {
    rules: {
      // 최초 화면 데이터 조회는 effect에서 상태를 갱신하므로 이 규칙을 적용하지 않습니다.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];
