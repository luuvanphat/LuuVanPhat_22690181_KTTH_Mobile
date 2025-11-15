import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { openDatabase, seedSampleData, getAllExpenses, resetDatabase, type Expense } from './src/database/db';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const initDatabase = async () => {
    try {
      setDbReady(false);
      await openDatabase();
      await seedSampleData();
      const data = await getAllExpenses();
      setExpenses(data);
      setDbReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    initDatabase();
  }, []);

  const handleReset = async () => {
    await resetDatabase();
    await initDatabase();
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>❌ Lỗi database: {error}</Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang khởi tạo database...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.successText}>✅ Database đã sẵn sàng!</Text>
      <Text style={styles.subtitle}>Expense Notes App</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📊 Dữ liệu mẫu đã seed:</Text>
        <Text style={styles.infoText}>Tổng số: {expenses.length} khoản chi tiêu</Text>
      </View>

      <View style={styles.expensesList}>
        {expenses.map((expense) => (
          <View key={expense.id} style={styles.expenseItem}>
            <View style={styles.expenseHeader}>
              <Text style={styles.expenseTitle}>{expense.title}</Text>
              <Text style={styles.expenseAmount}>
                {expense.amount.toLocaleString('vi-VN')}đ
              </Text>
            </View>
            <View style={styles.expenseFooter}>
              <Text style={styles.expenseCategory}>
                📁 {expense.category || 'Không phân loại'}
              </Text>
              <Text style={[styles.expenseStatus, expense.paid === 1 ? styles.paid : styles.unpaid]}>
                {expense.paid === 1 ? '✓ Đã trả' : '⏳ Chưa trả'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>🔄 Reset Database</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    maxWidth: 500,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
  },
  expensesList: {
    width: '100%',
    maxWidth: 500,
  },
  expenseItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseCategory: {
    fontSize: 13,
    color: '#757575',
  },
  expenseStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paid: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  unpaid: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});