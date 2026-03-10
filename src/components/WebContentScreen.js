// @ts-nocheck
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function WebContentScreen({ title, url }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.content}>
        <WebView
          key={reloadKey}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          onHttpError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          onLoadEnd={() => setIsLoading(false)}
          onLoadStart={() => {
            setHasError(false);
            setIsLoading(true);
          }}
          source={{ uri: url }}
          style={styles.webview}
          startInLoadingState
        />

        {isLoading && !hasError && (
          <View style={styles.overlay}>
            <ActivityIndicator color="#1a78ff" size="large" />
            <Text style={styles.overlayText}>Cargando contenido...</Text>
          </View>
        )}

        {hasError && (
          <View style={styles.overlay}>
            <Text style={styles.errorTitle}>No se pudo abrir esta página</Text>
            <Text style={styles.errorText}>Revisa tu conexión e inténtalo de nuevo.</Text>
            <Pressable onPress={retry} style={styles.retryButton}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#05070c',
    flex: 1,
  },
  header: {
    borderBottomColor: '#1a2231',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: {
    color: '#e8edf8',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    backgroundColor: '#05070c',
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: '#05070c',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  overlayText: {
    color: '#b7bfd4',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  errorTitle: {
    color: '#f3f7ff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#b7bfd4',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1a78ff',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
