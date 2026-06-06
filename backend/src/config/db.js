const mysql = require('mysql2');

const databaseUrl = process.env.DATABASE_URL || '';
let connectionOptions = {
  host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
  user: process.env.DB_USER || process.env.MYSQL_USER,
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'store_rating'
};

if (databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mysql2://')) {
  const parsedUrl = new URL(databaseUrl);

  connectionOptions = {
    host: parsedUrl.hostname,
    user: decodeURIComponent(parsedUrl.username),
    password: decodeURIComponent(parsedUrl.password),
    database: parsedUrl.pathname.replace(/^\//, '') || connectionOptions.database,
    port: parsedUrl.port ? Number(parsedUrl.port) : undefined
  };
}

const connection = mysql.createPool(connectionOptions);

module.exports = connection;