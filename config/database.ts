export default ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("DATABASE_HOST", "localhost"),
      port: env.int("DATABASE_PORT", 5432),
      database: env("DATABASE_NAME"),
      user: env("DATABASE_USERNAME"),
      password: env("DATABASE_PASSWORD"),
      ssl: env.bool("DATABASE_SSL", false),
      schema: env("DATABASE_SCHEMA"),
    },
    pool: {
      min: 2,
      max: 10,
    },
    acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
  },
});
