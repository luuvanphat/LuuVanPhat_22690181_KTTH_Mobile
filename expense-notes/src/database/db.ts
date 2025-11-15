import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const DATABASE_NAME = 'expenses.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Mở kết nối database
 */
export const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (Platform.OS === 'web') {
    console.warn('⚠️ SQLite không hỗ trợ web. Sử dụng mock database.');
    // Trên web, ta sẽ dùng mock object
    return {} as SQLite.SQLiteDatabase;
  }

  if (db) {
    return db;
  }
  
  try {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    console.log('✅ Database connected successfully');
    return db;
  } catch (error) {
    console.error('❌ Error opening database:', error);
    throw error;
  }
};

/**
 * Đóng kết nối database
 */
export const closeDatabase = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  if (db) {
    await db.closeAsync();
    db = null;
    console.log('🔒 Database closed');
  }
};

/**
 * Lấy instance database hiện tại
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (Platform.OS === 'web') {
    return {} as SQLite.SQLiteDatabase;
  }

  if (!db) {
    throw new Error('Database chưa được khởi tạo. Gọi openDatabase() trước.');
  }
  return db;
};