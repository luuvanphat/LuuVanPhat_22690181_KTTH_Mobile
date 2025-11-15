import React from 'react';
import { FlatList, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Expense } from '../database/db';

interface ExpenseListProps {
  expenses: Expense[];
  onTogglePaid?: (id: number) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onTogglePaid }) => {
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('vi-VN')}đ`;
  };

  const renderItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      style={styles.expenseItem}
      onPress={() => onTogglePaid && onTogglePaid(item.id)}
      activeOpacity={0.7}
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
      
      {/* Hint cho user */}
      <Text style={styles.hintText}>Chạm để đổi trạng thái</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💸</Text>
      <Text style={styles.emptyTitle}>Chưa có khoản chi tiêu nào.</Text>
      <Text style={styles.emptySubtitle}>Nhấn nút "+" để thêm chi tiêu mới</Text>
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
    fontSize: 11,
    color: '#BDBDBD',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
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