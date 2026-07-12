import 'dotenv/config';
import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'products-api',
  entities: [path.join(__dirname, '../../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../db/*.ts')],
  synchronize: false,
  logging: true,
};

const appDataSource = new DataSource(typeOrmConfig);
export default appDataSource;
