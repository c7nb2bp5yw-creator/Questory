import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

type FollowMode =
  | 'followers'
  | 'following';

type UserProfile = {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  adventure_type: string | null;
};

type BlockRow = {
  blocker_id: string;
  blocked_id: string;
};

export default function FollowsScreen() {
  const params =
    useLocalSearchParams<{
      mode?: string;
    }>();

  const mode: FollowMode =
    params.mode === 'following'
      ? 'following'
      : 'followers';

  const [users, setUsers] =
    useState<UserProfile[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');

  /*
   * 自分とブロック関係にある
   * ユーザーIDを全部取得
   *
   * ・自分がブロックした相手
   * ・自分をブロックした相手
   */
  const getBlockedUserIds =
    useCallback(
      async (
        myUserId: string,
      ): Promise<string[]> => {
        const {
          data,
          error,
        } = await supabase
          .from('blocks')
          .select(
            `
              blocker_id,
              blocked_id
            `,
          )
          .or(
            `blocker_id.eq.${myUserId},blocked_id.eq.${myUserId}`,
          );

        if (error) {
          console.log(
            'FOLLOWS BLOCK ERROR:',
            error,
          );

          throw error;
        }

        const rows =
          (data ?? []) as BlockRow[];

        const blockedIds = rows
          .map((row) => {
            if (
              row.blocker_id ===
              myUserId
            ) {
              return row.blocked_id;
            }

            return row.blocker_id;
          })
          .filter(
            (id) =>
              Boolean(id) &&
              id !== myUserId,
          );

        return [
          ...new Set(blockedIds),
        ];
      },
      [],
    );

  /*
   * FOLLOWERS / FOLLOWING LOAD
   */
  const loadUsers =
    useCallback(async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const {
          data: { user },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError || !user) {
          console.log(
            'FOLLOWS USER ERROR:',
            userError,
          );

          setUsers([]);

          setErrorMessage(
            'ログイン情報を確認できませんでした。',
          );

          return;
        }

        /*
         * ブロック関係にある相手を取得
         */
        const blockedUserIds =
          await getBlockedUserIds(
            user.id,
          );

        const blockedSet =
          new Set(
            blockedUserIds,
          );

        /*
         * FOLLOWERS
         *
         * 自分をフォローしている人
         *
         * following_id = 自分
         * ↓
         * follower_id を取得
         */
        if (
          mode === 'followers'
        ) {
          const {
            data: followRows,
            error: followError,
          } = await supabase
            .from('follows')
            .select('follower_id')
            .eq(
              'following_id',
              user.id,
            )
            .order(
              'created_at',
              {
                ascending: false,
              },
            );

          if (followError) {
            console.log(
              'FOLLOWERS LOAD ERROR:',
              followError,
            );

            setUsers([]);

            setErrorMessage(
              'フォロワーを読み込めませんでした。',
            );

            return;
          }

          /*
           * ブロック関係ユーザーを
           * FOLLOWERSから除外
           */
          const userIds = (
            followRows ?? []
          )
            .map(
              (row) =>
                row.follower_id,
            )
            .filter(
              (id) =>
                !blockedSet.has(
                  id,
                ),
            );

          if (
            userIds.length === 0
          ) {
            setUsers([]);
            return;
          }

          const {
            data: profiles,
            error: profilesError,
          } = await supabase
            .from('profiles')
            .select(
              `
                id,
                name,
                username,
                avatar_url,
                adventure_type
              `,
            )
            .in(
              'id',
              userIds,
            );

          if (profilesError) {
            console.log(
              'FOLLOWERS PROFILE ERROR:',
              profilesError,
            );

            setUsers([]);

            setErrorMessage(
              'プロフィールを読み込めませんでした。',
            );

            return;
          }

          /*
           * follows の新しい順を維持
           */
          const profileMap =
            new Map(
              (
                profiles ?? []
              ).map(
                (profile) => [
                  profile.id,
                  profile,
                ],
              ),
            );

          const sortedUsers =
            userIds
              .map((id) =>
                profileMap.get(
                  id,
                ),
              )
              .filter(
                (
                  profile,
                ): profile is UserProfile =>
                  profile !==
                  undefined,
              );

          setUsers(
            sortedUsers,
          );

          return;
        }

        /*
         * FOLLOWING
         *
         * 自分がフォローしている人
         *
         * follower_id = 自分
         * ↓
         * following_id を取得
         */
        const {
          data: followRows,
          error: followError,
        } = await supabase
          .from('follows')
          .select('following_id')
          .eq(
            'follower_id',
            user.id,
          )
          .order(
            'created_at',
            {
              ascending: false,
            },
          );

        if (followError) {
          console.log(
            'FOLLOWING LOAD ERROR:',
            followError,
          );

          setUsers([]);

          setErrorMessage(
            'フォロー中のユーザーを読み込めませんでした。',
          );

          return;
        }

        /*
         * ブロック関係ユーザーを
         * FOLLOWINGから除外
         */
        const userIds = (
          followRows ?? []
        )
          .map(
            (row) =>
              row.following_id,
          )
          .filter(
            (id) =>
              !blockedSet.has(
                id,
              ),
          );

        if (
          userIds.length === 0
        ) {
          setUsers([]);
          return;
        }

        const {
          data: profiles,
          error: profilesError,
        } = await supabase
          .from('profiles')
          .select(
            `
              id,
              name,
              username,
              avatar_url,
              adventure_type
            `,
          )
          .in(
            'id',
            userIds,
          );

        if (profilesError) {
          console.log(
            'FOLLOWING PROFILE ERROR:',
            profilesError,
          );

          setUsers([]);

          setErrorMessage(
            'プロフィールを読み込めませんでした。',
          );

          return;
        }

        /*
         * follows の新しい順を維持
         */
        const profileMap =
          new Map(
            (
              profiles ?? []
            ).map(
              (profile) => [
                profile.id,
                profile,
              ],
            ),
          );

        const sortedUsers =
          userIds
            .map((id) =>
              profileMap.get(id),
            )
            .filter(
              (
                profile,
              ): profile is UserProfile =>
                profile !==
                undefined,
            );

        setUsers(
          sortedUsers,
        );
      } catch (error) {
        console.log(
          'FOLLOWS CATCH ERROR:',
          error,
        );

        setUsers([]);

        setErrorMessage(
          'ユーザー一覧の読み込みに失敗しました。',
        );
      } finally {
        setIsLoading(false);
      }
    }, [
      mode,
      getBlockedUserIds,
    ]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const title =
    mode === 'followers'
      ? 'FOLLOWERS'
      : 'FOLLOWING';

  const emptyTitle =
    mode === 'followers'
      ? 'NO FOLLOWERS YET'
      : 'NOT FOLLOWING YET';

  const emptyText =
    mode === 'followers'
      ? 'フォロワーができるとここに表示されます。'
      : 'フォローしたユーザーがここに表示されます。';

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={styles.backText}
          >
            ←
          </Text>
        </Pressable>

        <View
          style={styles.headerCenter}
        >
          <Text
            style={styles.logo}
          >
            POSEQ
          </Text>

          <Text
            style={styles.title}
          >
            {title}
          </Text>
        </View>

        <View
          style={styles.headerSpacer}
        />
      </View>

      {isLoading ? (
        <View
          style={styles.center}
        >
          <ActivityIndicator />

          <Text
            style={styles.loadingText}
          >
            LOADING {title}...
          </Text>
        </View>
      ) : errorMessage ? (
        <View
          style={styles.center}
        >
          <Text
            style={styles.errorIcon}
          >
            !
          </Text>

          <Text
            style={styles.errorTitle}
          >
            LOAD ERROR
          </Text>

          <Text
            style={styles.errorText}
          >
            {errorMessage}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={loadUsers}
          >
            <Text
              style={styles.retryText}
            >
              RETRY
            </Text>
          </Pressable>
        </View>
      ) : users.length === 0 ? (
        <View
          style={styles.center}
        >
          <Text
            style={styles.emptyIcon}
          >
            ◇
          </Text>

          <Text
            style={styles.emptyTitle}
          >
            {emptyTitle}
          </Text>

          <Text
            style={styles.emptyText}
          >
            {emptyText}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={styles.countRow}
          >
            <Text
              style={styles.countLabel}
            >
              {title}
            </Text>

            <Text
              style={styles.count}
            >
              {users.length}
            </Text>
          </View>

          {users.map(
            (profile) => {
              const displayName =
                profile.name?.trim() ||
                'QUESTER';

              const username =
                profile.username?.trim();

              return (
                <Pressable
                  key={profile.id}
                  style={
                    styles.userCard
                  }
                  onPress={() =>
                    router.push({
                      pathname:
                        '/user/[id]',
                      params: {
                        id:
                          profile.id,
                      },
                    })
                  }
                >
                  <View
                    style={
                      styles.avatar
                    }
                  >
                    {profile.avatar_url ? (
                      <Image
                        source={{
                          uri:
                            profile.avatar_url,
                        }}
                        style={
                          styles.avatarImage
                        }
                      />
                    ) : (
                      <Text
                        style={
                          styles.avatarText
                        }
                      >
                        {displayName
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    )}
                  </View>

                  <View
                    style={
                      styles.userInfo
                    }
                  >
                    <Text
                      style={
                        styles.userName
                      }
                      numberOfLines={
                        1
                      }
                    >
                      {displayName}
                    </Text>

                    <Text
                      style={
                        styles.userId
                      }
                      numberOfLines={
                        1
                      }
                    >
                      {username
                        ? `@${username}`
                        : '@quester'}
                    </Text>

                    {profile.adventure_type ? (
                      <Text
                        style={
                          styles.adventureType
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {
                          profile.adventure_type
                        }
                      </Text>
                    ) : null}
                  </View>

                  <View
                    style={
                      styles.arrowBox
                    }
                  >
                    <Text
                      style={
                        styles.arrow
                      }
                    >
                      →
                    </Text>
                  </View>
                </Pressable>
              );
            },
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#080B12',
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 18,
      borderBottomWidth: 1,
      borderBottomColor: '#171E2A',
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#293345',
      backgroundColor: '#111722',
      alignItems: 'center',
      justifyContent: 'center',
    },

    backText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '800',
    },

    headerCenter: {
      flex: 1,
      alignItems: 'center',
    },

    headerSpacer: {
      width: 44,
    },

    logo: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '900',
      letterSpacing: 2.5,
    },

    title: {
      color: '#8ECAFF',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.5,
      marginTop: 5,
    },

    content: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 80,
    },

    countRow: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 14,
      paddingHorizontal: 2,
    },

    countLabel: {
      color: '#687386',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.5,
    },

    count: {
      color: '#8ECAFF',
      fontSize: 10,
      fontWeight: '900',
    },

    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#111722',
      borderWidth: 1,
      borderColor: '#202838',
      borderRadius: 18,
      padding: 14,
      marginBottom: 10,
    },

    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#1B2432',
      borderWidth: 1,
      borderColor: '#344054',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },

    avatarImage: {
      width: '100%',
      height: '100%',
    },

    avatarText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '900',
    },

    userInfo: {
      flex: 1,
      marginLeft: 14,
    },

    userName: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '900',
    },

    userId: {
      color: '#687386',
      fontSize: 9,
      fontWeight: '700',
      marginTop: 4,
    },

    adventureType: {
      color: '#8ECAFF',
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 0.8,
      marginTop: 6,
    },

    arrowBox: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor: '#192130',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 10,
    },

    arrow: {
      color: '#8ECAFF',
      fontSize: 16,
      fontWeight: '900',
    },

    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
    },

    loadingText: {
      color: '#687386',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.2,
      marginTop: 14,
    },

    emptyIcon: {
      color: '#8ECAFF',
      fontSize: 34,
      marginBottom: 14,
    },

    emptyTitle: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1,
    },

    emptyText: {
      color: '#596579',
      fontSize: 10,
      lineHeight: 18,
      textAlign: 'center',
      marginTop: 9,
    },

    errorIcon: {
      color: '#8ECAFF',
      fontSize: 30,
      fontWeight: '900',
      marginBottom: 12,
    },

    errorTitle: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1,
    },

    errorText: {
      color: '#596579',
      fontSize: 10,
      lineHeight: 18,
      textAlign: 'center',
      marginTop: 9,
    },

    retryButton: {
      borderWidth: 1,
      borderColor: '#8ECAFF',
      borderRadius: 14,
      paddingHorizontal: 20,
      paddingVertical: 11,
      marginTop: 20,
    },

    retryText: {
      color: '#8ECAFF',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1,
    },
  });