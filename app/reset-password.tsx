import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { supabase } from '../lib/supabase';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const canSubmit =
    password.length >= 6 &&
    confirmPassword.length >= 6 &&
    password === confirmPassword &&
    !saving;

  const handleReset = async () => {
    if (!canSubmit) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    setSaving(false);

    if (error) {
      console.log(
        'PASSWORD UPDATE ERROR:',
        error,
      );

      setErrorMessage(
        'パスワードを変更できませんでした。再設定メールをもう一度お試しください。',
      );
      return;
    }

    setCompleted(true);
  };

  if (completed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.logo}>
            POSEQ
          </Text>

          <Text style={styles.sub}>
            PASSWORD RESET
          </Text>

          <View style={styles.hero}>
            <Text style={styles.completeMark}>
              ✓
            </Text>

            <Text style={styles.title}>
              変更しました。
            </Text>

            <Text style={styles.description}>
              新しいパスワードが設定されました。
              {'\n'}
              ログイン画面からログインしてください。
            </Text>

            <Pressable
              style={styles.button}
              onPress={async () => {
                await supabase.auth.signOut();
                router.replace('/login');
              }}
            >
              <Text style={styles.buttonText}>
                GO TO LOGIN
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>
          POSEQ
        </Text>

        <Text style={styles.sub}>
          PASSWORD RESET
        </Text>

        <View style={styles.hero}>
          <Text style={styles.title}>
            新しい{'\n'}
            パスワード。
          </Text>

          <Text style={styles.description}>
            新しいパスワードを
            6文字以上で入力してください。
          </Text>
        </View>

        <Text style={styles.label}>
          NEW PASSWORD
        </Text>

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#4F5B6E"
          secureTextEntry
          editable={!saving}
        />

        <Text style={styles.label}>
          CONFIRM PASSWORD
        </Text>

        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
          placeholderTextColor="#4F5B6E"
          secureTextEntry
          editable={!saving}
        />

        {confirmPassword.length > 0 &&
          password !== confirmPassword && (
            <Text style={styles.error}>
              パスワードが一致していません。
            </Text>
          )}

        {errorMessage && (
          <Text style={styles.error}>
            {errorMessage}
          </Text>
        )}

        <Pressable
          style={[
            styles.button,
            !canSubmit && styles.disabled,
          ]}
          onPress={handleReset}
          disabled={!canSubmit}
        >
          <Text style={styles.buttonText}>
            {saving
              ? 'SAVING...'
              : 'SET NEW PASSWORD'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B12',
  },

  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 30,
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },

  sub: {
    color: '#586477',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 7,
  },

  hero: {
    marginTop: 65,
  },

  completeMark: {
    color: '#8ECAFF',
    fontSize: 42,
    fontWeight: '900',
    marginBottom: 18,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 44,
    fontWeight: '900',
  },

  description: {
    color: '#7B8799',
    fontSize: 12,
    lineHeight: 21,
    marginTop: 18,
    marginBottom: 38,
  },

  label: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 9,
  },

  input: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 16,
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 20,
  },

  error: {
    color: '#D98282',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 14,
  },

  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
  },

  disabled: {
    opacity: 0.35,
  },

  buttonText: {
    color: '#080B12',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
});