import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {
  openDatabase,
  seedSampleData,
  getAllExpenses,
  insertExpense,
  togglePaidStatus,
  type Expense,
} from './src/database/db';
import ExpenseList from './src/components/ExpenseList';
import AddExpenseModal from './src/components/AddExpenseModal';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const loadExpenses = async () => {
    try {
      const data = await getAllExpenses();
      // Sort by created_at descending (mới nhất trên cùng)
      const sorted = data.sort((a, b) => b.created_at - a.created_at);
      setExpenses(sorted);
    } catch (err) {
      console.error('Error loading expenses:', err);
    }
  };

  useEffect(() => {
    const initDatabase = async () => {
      try {
        setLoading(true);
        await openDatabase();
        await seedSampleData();
        await loadExpenses();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    initDatabase();
  }, []);

  const handleAddExpense = async (
    title: string,
    amount: number,
    category: string | null
  ) => {
    await insertExpense(title, amount, category);
    await loadExpenses();
  };

  const handleTogglePaid = async (id: number) => {
    try {
      await togglePaidStatus(id);
      await loadExpenses();
    } catch (err) {
      console.error('Error toggling paid status:', err);
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>❌ Lỗi database</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>💰 Expense Notes</Text>
          <Text style={styles.headerSubtitle}>
            {expenses.length} khoản chi tiêu
          </Text>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Expense List */}
      <ExpenseList expenses={expenses} onTogglePaid={handleTogglePaid} />

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddExpense}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});