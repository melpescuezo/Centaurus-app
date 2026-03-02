import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useCallback } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INSTAGRAM_URL = 'https://www.instagram.com/frecuenciafm95.5murcia';
const WHATSAPP_URL = 'https://wa.me/34673718593';

export default function ContactScreen() {
  const openInstagram = useCallback(() => {
    Linking.openURL(INSTAGRAM_URL).catch(() => {});
  }, []);

  const openWhatsApp = useCallback(() => {
    Linking.openURL(WHATSAPP_URL).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Frecuencia FM</Text>

        <View style={styles.actions}>
          <Pressable onPress={openInstagram} style={styles.actionButton}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="instagram" size={28} color="#ff1f1f" />
            </View>
            <Text style={styles.actionLabel}>Síguenos en Instagram</Text>
          </Pressable>

          <Pressable onPress={openWhatsApp} style={styles.actionButton}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="whatsapp" size={28} color="#ff1f1f" />
            </View>
            <Text style={styles.actionLabel}>Envíanos un WhatsApp</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Desarrollado por:</Text>
          <Text style={styles.cardLine}>TODO FM S.L.</Text>
          <Text style={styles.cardLine}>info@todofm.com</Text>
          <Text style={styles.cardLine}>Apasionados de la radio 📻</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  title: {
    color: '#f2f2f2',
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },
  actions: {
    marginTop: 36,
    gap: 18,
  },
  actionButton: {
    backgroundColor: '#0000fe',
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    marginTop: 'auto',
    marginBottom: 90,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2b2b2b',
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  cardLine: {
    color: '#d8d8d8',
    fontSize: 16,
    fontWeight: '600',
  },
});
