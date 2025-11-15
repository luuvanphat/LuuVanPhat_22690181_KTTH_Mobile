import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {
  openDatabase,
  seedSampleData,
  getAllExpenses,
  insertExpense,
  togglePaidStatus,
  updateExpense,
  deleteExpense,
  importExpensesFromAPI,
  type Expense,
} from './src/database/db';
import ExpenseList from './src/components/ExpenseList';
import AddExpenseModal from './src/components/AddExpenseModal';
import EditExpenseModal from './src/components/EditExpenseModal';
import ImportButton from './src/components/ImportButton';

// API URL - Dùng JSONPlaceholder hoặc API public khác
const API_URL = 'https://dummyjson.com/products?limit=10';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const loadExpenses = useCallback(async () => {
    try {
      const data = await getAllExpenses();
      const sorted = data.sort((a, b) => b.created_at - a.created_at);
      setExpenses(sorted);
    } catch (err) {
      console.error('Error loading expenses:', err);
    }
  }, []);

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
  }, [loadExpenses]);

  // Lấy danh sách categories unique
  const categories = useMemo(() => {
    const cats = expenses
      .map(e => e.category)
      .filter((cat): cat is string => cat !== null && cat !== '');
    return ['all', ...Array.from(new Set(cats))];
  }, [expenses]);

  // Filter expenses với useMemo để tối ưu
  const filteredExpenses = useMemo(() => {
    let result = expenses;

    // Filter by search query (tìm theo title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(expense =>
        expense.title.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      result = result.filter(expense => expense.category === filterCategory);
    }

    return result;
  }, [expenses, searchQuery, filterCategory]);

  const handleAddExpense = useCallback(async (
    title: string,
    amount: number,
    category: string | null
  ) => {
    await insertExpense(title, amount, category);
    await loadExpenses();
  }, [loadExpenses]);

  const handleTogglePaid = useCallback(async (id: number) => {
    try {
      await togglePaidStatus(id);
      await loadExpenses();
    } catch (err) {
      console.error('Error toggling paid status:', err);
    }
  }, [loadExpenses]);

  const handleEditExpense = useCallback((expense: Expense) => {
    setSelectedExpense(expense);
    setEditModalVisible(true);
  }, []);

  const handleUpdateExpense = useCallback(async (
    id: number,
    title: string,
    amount: number,
    category: string | null
  ) => {
    await updateExpense(id, title, amount, category);
    await loadExpenses();
  }, [loadExpenses]);

  const handleDeleteExpense = useCallback(async (id: number, title: string) => {
    try {
      await deleteExpense(id);
      await loadExpenses();
      console.log(`✅ Deleted expense: ${title}`);
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  }, [loadExpenses]);

  // Handle Import from API
  const handleImportFromAPI = useCallback(async () => {
    try {
      console.log('🔄 Fetching data from API...');
      
      // Fetch data từ API
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API Response:', data);

      // Parse data (API trả về format khác nhau)
      let items = [];
      if (data.products) {
        // DummyJSON format
        items = data.products.map((p: any) => ({
          title: p.title,
          price: p.price,
          category: p.category,
        }));
      } else if (Array.isArray(data)) {
        items = data;
      } else {
        throw new Error('Invalid API response format');
      }

      console.log(`📦 Parsed ${items.length} items`);

      // Import vào database
      const importedCount = await importExpensesFromAPI(items);
      
      // Reload expenses
      await loadExpenses();

      // Show result
      if (importedCount > 0) {
        Alert.alert(
          'Thành công! 🎉',
          `Đã import ${importedCount} khoản chi tiêu mới.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Thông báo',
          'Không có khoản chi tiêu mới nào được thêm (có thể đã tồn tại).',
          [{ text: 'OK' }]
        );
      }

    } catch (err) {
      console.error('❌ Import error:', err);
      Alert.alert(
        'Lỗi Import',
        err instanceof Error ? err.message : 'Không thể kết nối tới API',
        [{ text: 'OK' }]
      );
    }
  }, [loadExpenses]);

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
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>💰 Expense Notes</Text>
            <Text style={styles.headerSubtitle}>
              {filteredExpenses.length}/{expenses.length} khoản chi tiêu
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Import Button */}
        <View style={styles.importContainer}>
          <ImportButton onImport={handleImportFromAPI} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Tìm kiếm theo tên..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filter */}
        {categories.length > 1 && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Danh mục:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterButtons}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterButton,
                      filterCategory === cat && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilterCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        filterCategory === cat && styles.filterButtonTextActive,
                      ]}
                    >
                      {cat === 'all' ? 'Tất cả' : cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Expense List */}
      <ExpenseList
        expenses={filteredExpenses}
        onTogglePaid={handleTogglePaid}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleAddExpense}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        visible={editModalVisible}
        expense={selectedExpense}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedExpense(null);
        }}
        onSave={handleUpdateExpense}
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  },
  addButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  importContainer: {
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 8,
    fontWeight: '600',
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
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