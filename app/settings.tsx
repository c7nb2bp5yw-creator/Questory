import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/context/auth';

export default function SettingsScreen() {
  const { signOut } = useAuth();

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const openAccount = () => {
    router.push('/account' as any);
  };

  const openBlockedUsers = () => {
    router.push('/blocked-users' as any);
  };

  const openTerms = () => {
    router.push('/terms' as any);
  };

  const openPrivacyPolicy = () => {
    router.push('/privacy-policy' as any);
  };

  const openSupport = () => {
    router.push('/support' as any);
  };

  const openAbout = () => {
    router.push('/about' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={12}
          >
            <Text style={styles.backButtonText}>
              ← BACK
            </Text>
          </Pressable>

          <View style={styles.headerBrand}>
            <Text style={styles.logo}>
              POSEQ
            </Text>

            <Text style={styles.sub}>
              SETTINGS
            </Text>
          </View>
        </View>

        <Text style={styles.title}>
          設定
        </Text>

        {/* ACCOUNT */}

        <Text style={styles.sectionLabel}>
          ACCOUNT
        </Text>

        <View style={styles.card}>
          <Pressable
            style={styles.menuRow}
            onPress={openAccount}
          >
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>
                アカウント
              </Text>

              <Text style={styles.rowDescription}>
                アカウント情報・アカウント削除
              </Text>
            </View>

            <Text style={styles.arrow}>
              →
            </Text>
          </Pressable>
        </View>

        {/* PRIVACY / SAFETY */}

        <Text style={styles.sectionLabel}>
          PRIVACY / SAFETY
        </Text>

        <View style={styles.card}>
          <Pressable
            style={styles.menuRow}
            onPress={openBlockedUsers}
          >
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>
                ブロックしたユーザー
              </Text>

              <Text style={styles.rowDescription}>
                ブロック中のユーザーを確認・解除
              </Text>
            </View>

            <Text style={styles.arrow}>
              →
            </Text>
          </Pressable>
        </View>

        {/* INFORMATION */}

        <Text style={styles.sectionLabel}>
          INFORMATION
        </Text>

        <View style={styles.card}>
          <Pressable
            style={styles.menuRow}
            onPress={openTerms}
          >
            <Text style={styles.rowTitle}>
              利用規約
            </Text>

            <Text style={styles.arrow}>
              →
            </Text>
          </Pressable>

          <View style={styles.line} />

          <Pressable
            style={styles.menuRow}
            onPress={openPrivacyPolicy}
          >
            <Text style={styles.rowTitle}>
              プライバシーポリシー
            </Text>

            <Text style={styles.arrow}>
              →
            </Text>
          </Pressable>

          <View style={styles.line} />

          <Pressable
            style={styles.menuRow}
            onPress={openSupport}
          >
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>
                お問い合わせ
              </Text>

              <Text style={styles.rowDescription}>
                不具合・ご要望・アカウントに関するお問い合わせ
              </Text>
            </View>

            <Text style={styles.arrow}>
              →
            </Text>
          </Pressable>

          <View style={styles.line} />

          <Pressable
            style={styles.menuRow}
            onPress={openAbout}
          >
            <Text style={styles.rowTitle}>
              POSEQについて
            </Text>

            <Text style={styles.arrow}>
              →
            </Text>
          </Pressable>
        </View>

        {/* LOGOUT */}

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            LOG OUT
          </Text>
        </Pressable>

        <Text style={styles.version}>
          POSEQ v1.0.0
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
    paddingTop: 20,
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 42,
  },

  backButton: {
    minWidth: 72,
    paddingVertical: 8,
  },

  backButtonText: {
    color: '#8A96A8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  headerBrand: {
    flex: 1,
    alignItems: 'flex-end',
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

  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 45,
    marginBottom: 35,
  },

  sectionLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 20,
    marginBottom: 30,
    overflow: 'hidden',
  },

  row: {
    minHeight: 76,
    paddingHorizontal: 18,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuRow: {
    minHeight: 65,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rowText: {
    flex: 1,
    paddingRight: 15,
  },

  rowTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  rowDescription: {
    color: '#687386',
    fontSize: 9,
    lineHeight: 15,
    marginTop: 5,
  },

  line: {
    height: 1,
    backgroundColor: '#202838',
    marginHorizontal: 18,
  },

  arrow: {
    color: '#687386',
    fontSize: 18,
  },

  logoutButton: {
    borderWidth: 1,
    borderColor: '#3A2B31',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 5,
  },

  logoutText: {
    color: '#D98282',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  version: {
    color: '#3F4A5B',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 22,
  },
});