import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    Linking,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const SUPPORT_EMAIL = 'app.toiawase.sp@gmail.com';

export default function SupportScreen() {
  const handleBack = () => {
    router.back();
  };

  const handleContact = async () => {
    if (!SUPPORT_EMAIL) {
      Alert.alert(
        '準備中です',
        'お問い合わせ窓口はリリース前に公開予定です。',
      );
      return;
    }

    const subject = encodeURIComponent(
      'Questory お問い合わせ',
    );

    const url =
      `mailto:${SUPPORT_EMAIL}?subject=${subject}`;

    const canOpen =
      await Linking.canOpenURL(url);

    if (!canOpen) {
      Alert.alert(
        'メールアプリを開けませんでした',
        `お問い合わせ先：${SUPPORT_EMAIL}`,
      );
      return;
    }

    await Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
              QUESTORY
            </Text>

            <Text style={styles.sub}>
              SUPPORT
            </Text>
          </View>
        </View>

        <Text style={styles.title}>
          お問い合わせ
        </Text>

        <Text style={styles.sectionLabel}>
          SUPPORT
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            お困りですか？
          </Text>

          <Text style={styles.description}>
            不具合、ご要望、アカウントに関する問題などはこちらからお問い合わせください。
          </Text>

          <Pressable
            style={styles.contactButton}
            onPress={handleContact}
          >
            <Text style={styles.contactButtonText}>
              CONTACT SUPPORT
            </Text>
          </Pressable>
        </View>

        <Text style={styles.note}>
          通常のお問い合わせはメールにて受け付けています。
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
    padding: 20,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  description: {
    color: '#687386',
    fontSize: 10,
    lineHeight: 18,
    marginTop: 10,
  },

  contactButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },

  contactButtonText: {
    color: '#080B12',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
  },

  note: {
    color: '#4F5B6E',
    fontSize: 9,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 18,
  },
});