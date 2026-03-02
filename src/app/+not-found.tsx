import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>
          <fbt desc="Screen not found title">This screen doesn&apos;t exist.</fbt>
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>
            <fbt desc="Go back link">Go to home screen!</fbt>
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 16,
    paddingTop: 16,
  },
  linkText: {
    color: '#2e78b7',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
});
