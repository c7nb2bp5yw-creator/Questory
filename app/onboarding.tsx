import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    if (!name.trim() || !userId.trim() || isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('ログイン情報を確認できませんでした。');
      setIsLoading(false);
      return;
    }

    const cleanUsername = userId.trim().replace(/^@/, '');

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: name.trim(),
        username: cleanUsername,
        onboarding_completed: false,
      });

    if (profileError) {
      console.log('PROFILE INSERT ERROR:', profileError);

      if (profileError.code === '23505') {
        setError('このUSER IDはすでに使われています。');
      } else {
        setError(`保存エラー: ${profileError.message}`);
      }

      setIsLoading(false);
      return;
    }

    Alert.alert(
      '保存成功',
      'プロフィールをSupabaseに保存しました。',
      [
        {
          text: 'OK',
          onPress: () => router.push('/diagnosis'),
        },
      ]
    );

    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>
          QUESTORY
        </Text>

        <Text style={styles.sub}>
          START YOUR ADVENTURE
        </Text>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>
            WELCOME TO QUESTORY
          </Text>

          <Text style={styles.title}>
            スマホを置いて、{'\n'}
            外へ出よう。
          </Text>

          <Text style={styles.description}>
            Questoryは、あなたの毎日に{'\n'}
            小さな冒険をつくるアプリです。
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>
            NAME
          </Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="あなたの名前"
            placeholderTextColor="#4F5B6E"
            maxLength={30}
          />

          <Text style={styles.label}>
            USER ID
          </Text>

          <TextInput
            style={styles.input}
            value={userId}
            onChangeText={setUserId}
            placeholder="@username"
            placeholderTextColor="#4F5B6E"
            autoCapitalize="none"
            maxLength={20}
          />

          {error ? (
            <Text style={styles.error}>
              {error}
            </Text>
          ) : null}
        </View>

        <Pressable
          style={[
            styles.button,
            (!name.trim() || !userId.trim() || isLoading) &&
              styles.disabledButton,
          ]}
          onPress={handleStart}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'SAVING...' : 'START'}
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          YOUR ADVENTURE. YOUR STORY.
        </Text>
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
    paddingBottom: 35,
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
    marginTop: 85,
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
    marginTop: 55,
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
    fontSize: 10,
    lineHeight: 15,
    marginTop: -8,
    marginBottom: 10,
  },

  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 'auto',
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

  footer: {
    color: '#354052',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 22,
  },
});