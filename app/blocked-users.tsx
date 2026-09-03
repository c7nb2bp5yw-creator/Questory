import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { supabase } from '../lib/supabase';

type BlockedProfile = {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
};

type BlockRow = {
  id: string;
  blocked_id: string;
  created_at: string;
};

type BlockedUser = {
  blockId: string;
  profile: BlockedProfile;
};

export default function BlockedUsersScreen() {
  const [blockedUsers, setBlockedUsers] =
    useState<BlockedUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [unblockingId, setUnblockingId] =
    useState<string | null>(null);

  const loadBlockedUsers = useCallback(
    async () => {
      setLoading(true);

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.log(
            'BLOCKED USERS AUTH ERROR:',
            authError,
          );

          setBlockedUsers([]);
          return;
        }

        /*
         * 自分がブロックしたユーザーを取得
         */
        const {
          data: blockData,
          error: blockError,
        } = await supabase
          .from('blocks')
          .select(
            `
              id,
              blocked_id,
              created_at
            `,
          )
          .eq('blocker_id', user.id)
          .order('created_at', {
            ascending: false,
          });

        if (blockError) {
          console.log(
            'LOAD BLOCKS ERROR:',
            blockError,
          );

          setBlockedUsers([]);
          return;
        }

        const blocks =
          (blockData ?? []) as BlockRow[];

        if (blocks.length === 0) {
          setBlockedUsers([]);
          return;
        }

        const blockedIds = blocks.map(
          (block) => block.blocked_id,
        );

        /*
         * ブロックした相手のプロフィール取得
         */
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from('profiles')
          .select(
            `
              id,
              name,
              username,
              avatar_url
            `,
          )
          .in('id', blockedIds);

        if (profileError) {
          console.log(
            'LOAD BLOCKED PROFILES ERROR:',
            profileError,
          );

          setBlockedUsers([]);
          return;
        }

        const profiles =
          (profileData ??
            []) as BlockedProfile[];

        /*
         * blocksとprofilesを合体
         */
        const users = blocks
          .map((block) => {
            const profile =
              profiles.find(
                (item) =>
                  item.id ===
                  block.blocked_id,
              );

            if (!profile) {
              return null;
            }

            return {
              blockId: block.id,
              profile,
            };
          })
          .filter(
            (
              item,
            ): item is BlockedUser =>
              item !== null,
          );

        setBlockedUsers(users);
      } catch (error) {
        console.log(
          'BLOCKED USERS ERROR:',
          error,
        );

        setBlockedUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      loadBlockedUsers();
    }, [loadBlockedUsers]),
  );

  /*
   * UNBLOCK実行
   */
  const executeUnblock = async (
    item: BlockedUser,
  ) => {
    if (unblockingId) {
      return;
    }

    setUnblockingId(item.blockId);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        Alert.alert(
          'エラー',
          'ログイン情報を確認できませんでした。',
        );
        return;
      }

      const { error } =
        await supabase
          .from('blocks')
          .delete()
          .eq('id', item.blockId)
          .eq('blocker_id', user.id);

      if (error) {
        console.log(
          'UNBLOCK ERROR:',
          error,
        );

        Alert.alert(
          'エラー',
          'ブロックを解除できませんでした。',
        );

        return;
      }

      /*
       * FOLLOWは復元しない。
       * blocksの行だけ削除する。
       */
      setBlockedUsers((current) =>
        current.filter(
          (blockedUser) =>
            blockedUser.blockId !==
            item.blockId,
        ),
      );
    } catch (error) {
      console.log(
        'UNBLOCK ACTION ERROR:',
        error,
      );

      Alert.alert(
        'エラー',
        'ブロックを解除できませんでした。',
      );
    } finally {
      setUnblockingId(null);
    }
  };

  /*
   * UNBLOCK確認
   */
  const handleUnblock = (
    item: BlockedUser,
  ) => {
    const displayName =
      item.profile.name ||
      item.profile.username ||
      'このユーザー';

    Alert.alert(
      'ブロックを解除しますか？',
      `${displayName}さんのブロックを解除します。以前のフォロー関係は復元されません。`,
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '解除',
          onPress: () =>
            executeUnblock(item),
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ← BACK
          </Text>
        </Pressable>

        <Text style={styles.logo}>
          POSEQ
        </Text>

        <Text style={styles.sub}>
          PRIVACY / SAFETY
        </Text>

        <View style={styles.header}>
          <Text style={styles.label}>
            BLOCKED USERS
          </Text>

          <Text style={styles.title}>
            ブロックしたユーザー
          </Text>

          <Text
            style={styles.description}
          >
            ブロックを解除しても、
            以前のフォロー関係は復元されません。
          </Text>
        </View>

        {loading ? (
          <View
            style={styles.loadingArea}
          >
            <ActivityIndicator
              size="small"
              color="#8ECAFF"
            />

            <Text
              style={styles.loadingText}
            >
              LOADING...
            </Text>
          </View>
        ) : blockedUsers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text
              style={styles.emptyTitle}
            >
              NO BLOCKED USERS
            </Text>

            <Text
              style={styles.emptyText}
            >
              現在ブロックしている
              ユーザーはいません。
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {blockedUsers.map((item) => {
              const isUnblocking =
                unblockingId ===
                item.blockId;

              return (
                <View
                  key={item.blockId}
                  style={styles.userCard}
                >
                  {item.profile
                    .avatar_url ? (
                    <Image
                      source={{
                        uri:
                          item.profile
                            .avatar_url,
                      }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View
                      style={
                        styles.avatarFallback
                      }
                    >
                      <Text
                        style={
                          styles.avatarLetter
                        }
                      >
                        {(
                          item.profile.name ||
                          item.profile
                            .username ||
                          '?'
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View
                    style={styles.userInfo}
                  >
                    <Text
                      style={styles.name}
                      numberOfLines={1}
                    >
                      {item.profile.name ||
                        'ADVENTURER'}
                    </Text>

                    <Text
                      style={
                        styles.username
                      }
                      numberOfLines={1}
                    >
                      @
                      {item.profile
                        .username ||
                        'unknown'}
                    </Text>
                  </View>

                  <Pressable
                    style={[
                      styles.unblockButton,
                      isUnblocking &&
                        styles.unblockButtonDisabled,
                    ]}
                    onPress={() =>
                      handleUnblock(item)
                    }
                    disabled={
                      unblockingId !== null
                    }
                  >
                    {isUnblocking ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text
                        style={
                          styles.unblockText
                        }
                      >
                        UNBLOCK
                      </Text>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
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

  backButton: {
    marginBottom: 28,
  },

  backText: {
    color: '#8ECAFF',
    fontSize: 10,
    fontWeight: '900',
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

  header: {
    marginTop: 42,
  },

  label: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 10,
  },

  description: {
    color: '#687386',
    fontSize: 10,
    lineHeight: 18,
    marginTop: 12,
  },

  loadingArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },

  loadingText: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 12,
  },

  emptyCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    marginTop: 30,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  emptyText: {
    color: '#687386',
    fontSize: 10,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 10,
  },

  list: {
    marginTop: 30,
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 20,
    padding: 13,
    marginBottom: 11,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#192130',
  },

  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#192130',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarLetter: {
    color: '#8ECAFF',
    fontSize: 18,
    fontWeight: '900',
  },

  userInfo: {
    flex: 1,
    marginLeft: 13,
    marginRight: 10,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  username: {
    color: '#687386',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 5,
  },

  unblockButton: {
    minWidth: 82,
    minHeight: 38,
    borderWidth: 1,
    borderColor: '#354156',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  unblockButtonDisabled: {
    opacity: 0.55,
  },

  unblockText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
});