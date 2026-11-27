export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.MYSQL_URL || process.env.DATABASE_URL,
  mysqlHost: process.env.MYSQL_HOST ?? 'localhost',
  mysqlPort: Number(process.env.MYSQL_PORT ?? 3306),
  mysqlDatabase: process.env.MYSQL_DATABASE ?? 'organiza',
  mysqlUser: process.env.MYSQL_USER ?? 'organiza',
  mysqlPassword: process.env.MYSQL_PASSWORD ?? 'organiza',
  redisUrl: process.env.REDIS_URL,
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 30),
  jwtSecret: process.env.JWT_SECRET ?? 'organiza-dev-secret-change-me',
  sessionMaxAgeMs: 1000 * 60 * 60 * 24 * 7
}

export const isProduction = config.nodeEnv === 'production'
