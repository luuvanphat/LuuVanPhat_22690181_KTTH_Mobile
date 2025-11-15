import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, amount: number, category: string) => Promise<void>;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ visible, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; amount?: string }>({});

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: { title?: string; amount?: string } = {};

    // Validate title
    if (!title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }

    // Validate amount
    if (!amount.trim()) {
      newErrors.amount = 'Số tiền không được để trống';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) {
        newErrors.amount = 'Số tiền phải là số hợp lệ';
      } else if (numAmount <= 0) {
        newErrors.amount = 'Số tiền phải lớn hơn 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSave = async () => {
  if (!validate()) {
    return;
  }

  setLoading(true);
  try {
    const numAmount = parseFloat(amount);
    // Nếu category rỗng, truyền chuỗi rỗng thay vì null
    const safeCategory = category.trim() || "";
    await onSave(title.trim(), numAmount, safeCategory);
    resetForm();
    onClose();
  } catch (error) {
    Alert.alert('Lỗi', 'Không thể thêm chi tiêu. Vui lòng thử lại.');
    console.error('Error saving expense:', error);
  } finally {
    setLoading(false);
  }
};


  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>➕ Thêm chi tiêu mới</Text>
              <TouchableOpacity onPress={handleClose} disabled={loading}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tiêu đề <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="VD: Cà phê, Ăn trưa..."
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                editable={!loading}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Số tiền (VNĐ) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.amount && styles.inputError]}
                placeholder="VD: 30000"
                value={amount}
                onChangeText={(text) => {
                  // Chỉ cho phép số và dấu chấm
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  setAmount(cleaned);
                  if (errors.amount) setErrors({ ...errors, amount: undefined });
                }}
                keyboardType="numeric"
                editable={!loading}
              />
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount}</Text>
              )}
            </View>

            {/* Category Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Danh mục (tùy chọn)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Ăn uống, Di chuyển, Sinh hoạt..."
                value={category}
                onChangeText={setCategory}
                editable={!loading}
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  closeButton: {
    fontSize: 24,
    color: '#757575',
    fontWeight: '300',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212121',
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    backgroundColor: '#B0BEC5',
  },
});

export default AddExpenseModal;