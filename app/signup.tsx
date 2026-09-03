import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/context/auth';

export default function SignupScreen() {
  const { signUpWithPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const canSubmit =
    email.trim().length > 0 &&
    password.length >= 6;

  const isDisabled =
    !canSubmit || isSubmitting;

  const handleSignup = async () => {
    if (isDisabled) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const { error } =
      await signUpWithPassword(
        email.trim(),
        password,
      );

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(
        '登録に失敗しました。メールアドレスとパスワードをご確認ください。',
      );
      return;
    }

    router.replace('/onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.logo}>
          POSEQ
        </Text>

        <Text style={styles.sub}>
          START YOUR ADVENTURE
        </Text>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>
            JOIN POSEQ
          </Text>

          <Text style={styles.title}>
            はじめての{'\n'}
            冒険へ。
          </Text>

          <Text style={styles.description}>
            アカウントを作って、{'\n'}
            新しい体験を始めよう。
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>
            EMAIL
          </Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#4F5B6E"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!isSubmitting}
          />

          <Text style={styles.label}>
            PASSWORD
          </Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#4F5B6E"
            secureTextEntry
            editable={!isSubmitting}
          />

          <Text style={styles.passwordHint}>
            6文字以上で入力してください
          </Text>
        </View>

        {errorMessage && (
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        )}

        <Pressable
          style={[
            styles.button,
            isDisabled &&
              styles.disabledButton,
          ]}
          onPress={handleSignup}
          disabled={isDisabled}
        >
          <Text style={styles.buttonText}>
            {isSubmitting
              ? 'SIGNING UP...'
              : 'SIGN UP'}
          </Text>
        </Pressable>

        <Text style={styles.agreement}>
          登録することで
          {' '}
          <Link
            href="/terms"
            style={styles.agreementLink}
          >
            利用規約
          </Link>
          {' '}および{' '}
          <Link
            href="/privacy-policy"
            style={styles.agreementLink}
          >
            プライバシーポリシー
          </Link>
          {'\n'}
          に同意したものとします。
        </Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>
            すでにアカウントをお持ちですか？
          </Text>

          <Link
            href="/login"
            style={styles.switchLink}
          >
            <Text
              style={styles.switchLinkText}
            >
              ログイン
            </Text>
          </Link>
        </View>

        <Text style={styles.footer}>
          YOUR ADVENTURE. YOUR STORY.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B12',
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 40,
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
    marginTop: 60,
  },

  eyebrow: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 44,
    fontWeight: '900',
    marginTop: 12,
  },

  description: {
    color: '#7B8799',
    fontSize: 12,
    lineHeight: 20,
    marginTop: 17,
  },

  form: {
    marginTop: 45,
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

  passwordHint: {
    color: '#586477',
    fontSize: 9,
    fontWeight: '700',
    marginTop: -10,
    marginBottom: 20,
  },

  errorText: {
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
    marginTop: 6,
  },

  disabledButton: {
    opacity: 0.35,
  },

  buttonText: {
    color: '#080B12',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  agreement: {
    color: '#687386',
    fontSize: 9,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 17,
  },

  agreementLink: {
    color: '#8ECAFF',
    fontWeight: '900',
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    flexWrap: 'wrap',
  },

  switchText: {
    color: '#687386',
    fontSize: 11,
    fontWeight: '700',
  },

  switchLink: {
    marginLeft: 6,
  },

  switchLinkText: {
    color: '#8ECAFF',
    fontSize: 11,
    fontWeight: '900',
  },

  footer: {
    color: '#354052',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 30,
  },
});