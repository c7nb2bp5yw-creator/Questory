import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';

export default function AccountScreen() {
  const { signOut } = useAuth();

  const [isDeleting, setIsDeleting] =
    useState(false);

  const handleBack = () => {
    router.back();
  };

  const deleteAccount = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (
        sessionError ||
        !session?.access_token
      ) {
        throw new Error(
          'ログイン情報を確認できませんでした。',
        );
      }

      const {
        data,
        error,
      } = await supabase.functions.invoke(
        'delete-account',
        {
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        },
      );

      if (error) {
        console.log(
          'DELETE ACCOUNT FUNCTION ERROR:',
          error,
        );

        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      try {
        await signOut();
      } catch (error) {
        console.log(
          'SIGN OUT AFTER DELETE ERROR:',
          error,
        );
      }

      router.replace('/login');
    } catch (error: any) {
      console.log(
        'DELETE ACCOUNT ERROR:',
        error,
      );

      Alert.alert(
        '削除できませんでした',
        error?.message ??
          '時間をおいてもう一度お試しください。',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'アカウントを削除しますか？',
      'プロフィール、QUEST履歴、フォローなどのアカウントデータが削除されます。この操作は取り消せません。',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除する',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '本当に削除しますか？',
              '削除したアカウントは元に戻せません。',
              [
                {
                  text: 'キャンセル',
                  style: 'cancel',
                },
                {
                  text: '完全に削除する',
                  style: 'destructive',
                  onPress:
                    deleteAccount,
                },
              ],
            );
          },
        },
      ],
    );
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
              POSEQ
            </Text>

            <Text style={styles.sub}>
              ACCOUNT
            </Text>
          </View>
        </View>

        <Text style={styles.title}>
          アカウント
        </Text>

        <Text style={styles.sectionLabel}>
          ACCOUNT MANAGEMENT
        </Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.rowTitle}>
              アカウント情報
            </Text>

            <Text style={styles.rowDescription}>
              名前・ユーザーID・プロフィール写真などはプロフィール画面から変更できます。
            </Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          DANGER ZONE
        </Text>

        <View style={styles.dangerCard}>
          <View style={styles.dangerInfo}>
            <Text style={styles.dangerTitle}>
              アカウントを削除
            </Text>

            <Text
              style={
                styles.dangerDescription
              }
            >
              アカウントと関連するデータを削除します。削除後に元へ戻すことはできません。
            </Text>
          </View>

          <Pressable
            style={[
              styles.deleteButton,
              isDeleting &&
                styles.disabledButton,
            ]}
            onPress={confirmDeleteAccount}
            disabled={isDeleting}
          >
            <Text style={styles.deleteText}>
              {isDeleting
                ? 'DELETING...'
                : 'DELETE ACCOUNT'}
            </Text>
          </Pressable>
        </View>
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

  infoRow: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  rowTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  rowDescription: {
    color: '#687386',
    fontSize: 9,
    lineHeight: 16,
    marginTop: 7,
  },

  dangerCard: {
    backgroundColor: '#121015',
    borderWidth: 1,
    borderColor: '#3A2B31',
    borderRadius: 20,
    padding: 18,
  },

  dangerInfo: {
    marginBottom: 18,
  },

  dangerTitle: {
    color: '#E28B8B',
    fontSize: 14,
    fontWeight: '900',
  },

  dangerDescription: {
    color: '#8B7178',
    fontSize: 9,
    lineHeight: 16,
    marginTop: 8,
  },

  deleteButton: {
    borderWidth: 1,
    borderColor: '#6B3A43',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },

  deleteText: {
    color: '#E28B8B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
  },

  disabledButton: {
    opacity: 0.4,
  },
});