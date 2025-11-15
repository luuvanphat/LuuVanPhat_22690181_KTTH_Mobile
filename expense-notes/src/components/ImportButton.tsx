import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';

interface ImportButtonProps {
  onImport: () => Promise<void>;
}

const ImportButton: React.FC<ImportButtonProps> = ({ onImport }) => {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      await onImport();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể import dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <>
          <ActivityIndicator size="small" color="#fff" style={styles.loader} />
          <Text style={styles.buttonText}>Đang import...</Text>
        </>
      ) : (
        <Text style={styles.buttonText}>📥 Import từ API</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#34C759',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A8E6B8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    marginRight: 8,
  },
});

export default ImportButton;