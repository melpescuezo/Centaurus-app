import Stack from '@nkzw/stack';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useViewerContext from '../user/useViewerContext.tsx';

export default function Login() {
  const router = useRouter();
  const { login } = useViewerContext();

  const onPress = useCallback(async () => {
    await login();
    router.replace('/');
  }, [login, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack alignCenter center flex1 padding={16}>
        <Text onPress={onPress} style={styles.loginText}>
          <fbt desc="Login button">Login</fbt>
        </Text>
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginText: {
    fontSize: 18,
    textAlign: 'center',
    width: '100%',
  },
  safeArea: {
    flex: 1,
  },
});
