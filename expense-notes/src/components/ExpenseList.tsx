import React from 'react';
import { FlatList, Text, View, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { Expense } from '../database/db';

interface ExpenseListProps {
  expenses: Expense[];
  onTogglePaid?: (id: number) => void;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: number, title: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onTogglePaid, onEdit, onDelete }) => {
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('vi-VN')}đ`;
  };

  const handleDeleteWithConfirm = (id: number, title: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa "${title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => onDelete && onDelete(id, title),
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: Expense }) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      onTogglePaid && onTogglePaid(item.id);
    };

    const handleLongPress = () => {
      onEdit && onEdit(item);
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.expenseItemWrapper}>
          <TouchableOpacity
            style={styles.expenseItem}
            onPress={handlePress}
            onLongPress={handleLongPress}
            activeOpacity={0.9}
          >
            <View style={styles.expenseHeader}>
              <Text style={styles.expenseTitle}>{item.title}</Text>
              <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
            </View>
            <View style={styles.expenseFooter}>
              <Text style={styles.expenseCategory}>
                {item.category ? `📁 ${item.category}` : '📁 Không phân loại'}
              </Text>
              <View style={[styles.statusBadge, item.paid === 1 ? styles.paidBadge : styles.unpaidBadge]}>
                <Text style={[styles.statusText, item.paid === 1 ? styles.paidText : styles.unpaidText]}>
                  {item.paid === 1 ? '✓ Đã trả' : '⏳ Chưa trả'}
                </Text>
              </View>
            </View>
            <Text style={styles.hintText}>👆 Chạm = đổi trạng thái | Giữ = sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteWithConfirm(item.id, item.title)}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
      <Text style={styles.emptySubtitle}>Thử tìm kiếm với từ khóa khác</Text>
    </View>
  );

  if (expenses.length === 0) {
    return renderEmptyState();
  }

  return (
    <FlatList
      data={expenses}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  expenseItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  expenseCategory: {
    fontSize: 13,
    color: '#757575',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: '#E8F5E9',
  },
  unpaidBadge: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paidText: {
    color: '#2E7D32',
  },
  unpaidText: {
    color: '#E65100',
  },
  hintText: {
    fontSize: 10,
    color: '#BDBDBD',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  deleteButton: {
    width: 50,
    height: 50,
    backgroundColor: '#FF3B30',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
});

export default ExpenseList;