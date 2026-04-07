/**
 * Manual mock for database connection
 * Used in unit tests to avoid PostgreSQL driver initialization
 */

export const getDataSource = jest.fn();
export const closeDataSource = jest.fn();
