module.exports = {
  production: {
    client: 'postgresql',
    connection: {
      database: '',
      user: '',
      password: ''
    },
    pool: {
      max: 1
    },
    migrations: {
      tableName: 'postgresql'
    }
  }
};
