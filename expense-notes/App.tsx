import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Platform } from 'react-native';
import { openDatabase } from './src/database/db';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await openDatabase();
        setDbReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    initDatabase();
  }, []);

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
    <View style={styles.container}>
      <Text style={styles.successText}>✅ Database đã sẵn sàng!</Text>
      <Text style={styles.subtitle}>Expense Notes App</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  platform: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 10,
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
  warning: {
    fontSize: 12,
    color: '#FF9500',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 300,
  },
});