import { defineRailway, github, postgres, preserve, project, service } from 'railway/iac';

const WATCH = [
  'package.json',
  'package-lock.json',
  'src/**',
  'public/**',
  'drizzle/**',
  'scripts/**',
  'next.config.mjs',
  'Dockerfile',
  'postcss.config.mjs',
  'tsconfig.json',
];

export default defineRailway(() => {
  const db = postgres('postgres');
  const source = github('Ethansev/octagon-poker', { branch: 'main' });

  const web = service('web', {
    source,
    build: { builder: 'DOCKERFILE', watchPatterns: WATCH },
    deploy: { healthcheckPath: '/api/health', preDeployCommand: ['node dist/predeploy.mjs'] },
    env: {
      DATABASE_URL: db.env.DATABASE_URL,
      BETTER_AUTH_SECRET: preserve(),
      BETTER_AUTH_URL: preserve(),
      GROUP_TIME_ZONE: 'America/Los_Angeles',
    },
  });

  return project('octagon-poker', { resources: [db, web] });
});
