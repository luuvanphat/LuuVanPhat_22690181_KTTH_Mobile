import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPENSES_KEY = '@expenses';
const INIT_KEY = '@expenses_initialized';

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string | null;
  paid: number; // 0 = chưa trả, 1 = đã trả
  created_at: number;
}

let expenses: Expense[] = [];
let initialized = false;

/**
 * Mở kết nối database và tạo "bảng" nếu chưa tồn tại
 */
export const openDatabase = async (): Promise<void> => {
  if (initialized) return;
  
  try {
    // Kiểm tra đã init chưa
    const isInit = await AsyncStorage.getItem(INIT_KEY);
    
    // Lấy dữ liệu có sẵn
    const data = await AsyncStorage.getItem(EXPENSES_KEY);
    expenses = data ? JSON.parse(data) : [];
    
    // Nếu chưa init lần nào, đánh dấu đã init
    if (!isInit) {
      await AsyncStorage.setItem(INIT_KEY, 'true');
      console.log('✅ Expenses "table" created');
    }
    
    initialized = true;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Error opening database:', error);
    throw error;
  }
};

/**
 * Lưu dữ liệu vào AsyncStorage
 */
const saveData = async (): Promise<void> => {
  await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

/**
 * Seed dữ liệu mẫu (chỉ chạy lần đầu)
 */
export const seedSampleData = async (): Promise<void> => {
  if (expenses.length === 0) {
    const sampleData: Expense[] = [
      {
        id: 1,
        title: 'Cà phê',
        amount: 30000,
        category: 'Ăn uống',
        paid: 1,
        created_at: Date.now() - 86400000, // 1 ngày trước
      },
      {
        id: 2,
        title: 'Ăn trưa',
        amount: 50000,
        category: 'Ăn uống',
        paid: 1,
        created_at: Date.now() - 43200000, // 12 giờ trước
      },
      {
        id: 3,
        title: 'Tiền điện',
        amount: 200000,
        category: 'Sinh hoạt',
        paid: 0, // Chưa trả
        created_at: Date.now(),
      },
    ];
    
    expenses = sampleData;
    await saveData();
    console.log('✅ Seeded 3 sample expenses');
  } else {
    console.log('ℹ️ Database already has data, skip seeding');
  }
};

/**
 * Lấy tất cả expenses
 */
export const getAllExpenses = async (): Promise<Expense[]> => {
  return [...expenses];
};

/**
 * Thêm expense mới
 */
export const insertExpense = async (
  title: string,
  amount: number,
  category: string | null = null
): Promise<number> => {
  const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
  const newExpense: Expense = {
    id: newId,
    title,
    amount,
    category,
    paid: 1,
    created_at: Date.now(),
  };
  expenses.push(newExpense);
  await saveData();
  return newId;
};

/**
 * Cập nhật expense
 */
export const updateExpense = async (
  id: number,
  title: string,
  amount: number,
  category: string | null
): Promise<void> => {
  const index = expenses.findIndex(e => e.id === id);
  if (index !== -1) {
    expenses[index] = { ...expenses[index], title, amount, category };
    await saveData();
  }
};

/**
 * Toggle paid status
 */
export const togglePaidStatus = async (id: number): Promise<void> => {
  const index = expenses.findIndex(e => e.id === id);
  if (index !== -1) {
    expenses[index].paid = expenses[index].paid === 1 ? 0 : 1;
    await saveData();
  }
};

/**
 * Xóa expense
 */
export const deleteExpense = async (id: number): Promise<void> => {
  expenses = expenses.filter(e => e.id !== id);
  await saveData();
};

/**
 * Reset database (xóa tất cả - dùng cho testing)
 */
export const resetDatabase = async (): Promise<void> => {
  await AsyncStorage.multiRemove([EXPENSES_KEY, INIT_KEY]);
  expenses = [];
  initialized = false;
  console.log('🗑️ Database reset');
};

// Export compatibility
export const getDatabase = () => ({});
export const closeDatabase = async () => {};

