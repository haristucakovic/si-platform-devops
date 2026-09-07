const baseConfig = {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
};

module.exports = {
  development: {
    ...baseConfig,
    url: process.env.DB_URL || '',
  },
  test: {
    ...baseConfig,
    url: process.env.DB_URL || '',
  },
  production: {
    ...baseConfig,
    url: process.env.DB_URL || '',
  },
};