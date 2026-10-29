import 'dotenv/config';
import { Sequelize } from 'sequelize';

const requiredEnv = [
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_HOST',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Thiếu biến môi trường: ${key}`);
  }
}

const port = Number(process.env.DB_PORT ?? 1433);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('DB_PORT không hợp lệ');
}

export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    dialect: 'mssql',
    host: process.env.DB_HOST,
    port,
    logging: console.log,

    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true,
        cryptoCredentialsDetails: {
          minVersion: 'TLSv1',
        },
      },
    },
  }
);
