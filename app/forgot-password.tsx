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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const handleSend = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || sending) {
      return;
    }

    setSending(true);
    setErrorMessage(null);

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        {
          redirectTo: 'poseq://reset-password',
        },
      );

    setSending(false);

    if (error) {
      console.log(
        'PASSWORD RESET EMAIL ERROR:',
        error,
      );

      setErrorMessage(
        'メールを送信できませんでした。入力内容をご確認ください。',
      );
      return;
    }

    setSent(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Text style={styles.back}>
            ← BACK
          </Text>
        </Pressable>

        <Text style={styles.logo}>
          POSEQ
        </Text>

        <Text style={styles.sub}>
          PASSWORD RESET
        </Text>

        {sent ? (
          <View style={styles.messageArea}>
            <Text style={styles.title}>
              メールを{'\n'}
              確認してください。
            </Text>

            <Text style={styles.description}>
              パスワード再設定用のメールを送信しました。
              {'\n\n'}
              メール内のリンクから新しいパスワードを設定してください。
            </Text>

            <Pressable
              style={styles.button}
              onPress={() =>
                router.replace('/login')
              }
            >
              <Text style={styles.buttonText}>
                BACK TO LOGIN
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.hero}>
              <Text style={styles.title}>
                パスワードを{'\n'}
                再設定。
              </Text>

              <Text style={styles.description}>
                登録しているメールアドレスを
                入力してください。
              </Text>
            </View>

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
              editable={!sending}
            />

            {errorMessage && (
              <Text style={styles.error}>
                {errorMessage}
              </Text>
            )}

            <Pressable
              style={[
                styles.button,
                (!email.trim() || sending) &&
                  styles.disabled,
              ]}
              onPress={handleSend}
              disabled={
                !email.trim() || sending
              }
            >
              <Text style={styles.buttonText}>
                {sending
                  ? 'SENDING...'
                  : 'SEND RESET EMAIL'}
              </Text>
            </Pressable>
          </>
        )}
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
    paddingTop: 25,
  },

  back: {
    color: '#8ECAFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 35,
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

  messageArea: {
    marginTop: 65,
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
  },

  label: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 45,
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
  },

  error: {
    color: '#D98282',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 14,
  },

  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 28,
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