import { AppDataSource } from './data-source';

let isInitialized = false;

export async function getDataSource() {
  if (!isInitialized) {
    await AppDataSource.initialize();
    isInitialized = true;
    console.log('✅ Database connection initialized');
  }
  return AppDataSource;
}

export async function closeDataSource() {
  if (isInitialized && AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    isInitialized = false;
    console.log('✅ Database connection closed');
  }
}
