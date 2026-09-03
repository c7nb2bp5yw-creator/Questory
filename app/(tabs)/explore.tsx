import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, {
  useCallback,
  useMemo,
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
  TextInput,
  View,
} from 'react-native';

import { supabase } from '../../lib/supabase';

type Profile = {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  adventure_type: string | null;
  avatar_url: string | null;
};

type Quest = {
  id: string;
  number: string;
  title: string;
  description: string;
};

type FriendCompletion = {
  id: string;
  user_id: string;
  quest_id: string | null;
  generated_quest_id: string | null;
  caption: string | null;
  photo_url: string | null;
  completed_at: string;
  profile: Profile;
  quest: Quest;
};

type BlockRow = {
  blocker_id: string;
  blocked_id: string;
};

type ExploreMode = 'friends' | 'users';

export default function ExploreScreen() {
  const [mode, setMode] =
    useState<ExploreMode>('friends');

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [friendCompletions, setFriendCompletions] =
    useState<FriendCompletion[]>([]);

  const [loadingFriends, setLoadingFriends] =
    useState(true);

  const [users, setUsers] =
    useState<Profile[]>([]);

  const [loadingUsers, setLoadingUsers] =
    useState(false);

  const [searchText, setSearchText] =
    useState('');

  /*
   * 自分とブロック関係にある
   * 全ユーザーIDを取得する。
   *
   * ・自分がブロックした相手
   * ・自分をブロックした相手
   *
   * 両方を除外対象にする。
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
            'EXPLORE BLOCK ERROR:',
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
   * FRIENDS FEED
   *
   * 1. ログイン中ユーザー取得
   * 2. ブロック関係ユーザー取得
   * 3. followsからフォロー中ユーザー取得
   * 4. ブロック関係ユーザーを除外
   * 5. その人たちのCLEAR取得
   * 6. profile / quest情報を合体
   */
  const loadFriendsFeed =
    useCallback(async () => {
      setLoadingFriends(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.log(
            'EXPLORE USER ERROR:',
            userError,
          );

          setCurrentUserId(null);
          setFriendCompletions([]);
          return;
        }

        setCurrentUserId(user.id);

        const blockedUserIds =
          await getBlockedUserIds(
            user.id,
          );

        const blockedSet =
          new Set(blockedUserIds);

        const {
          data: follows,
          error: followError,
        } = await supabase
          .from('follows')
          .select('following_id')
          .eq(
            'follower_id',
            user.id,
          );

        if (followError) {
          console.log(
            'EXPLORE FOLLOW ERROR:',
            followError,
          );

          setFriendCompletions([]);
          return;
        }

        const followingIds = (
          follows ?? []
        )
          .map(
            (follow) =>
              follow.following_id,
          )
          .filter(
            (id) =>
              !blockedSet.has(id),
          );

        if (
          followingIds.length === 0
        ) {
          setFriendCompletions([]);
          return;
        }

        const {
          data: completions,
          error: completionError,
        } = await supabase
          .from('quest_completions')
          .select(
            `
              id,
              user_id,
              quest_id,
              generated_quest_id,
              caption,
              photo_url,
              completed_at
            `,
          )
          .in(
            'user_id',
            followingIds,
          )
          .order(
            'completed_at',
            {
              ascending: false,
            },
          );

        if (completionError) {
          console.log(
            'EXPLORE COMPLETION ERROR:',
            completionError,
          );

          setFriendCompletions([]);
          return;
        }

        if (
          !completions ||
          completions.length === 0
        ) {
          setFriendCompletions([]);
          return;
        }

        const completionUserIds = [
          ...new Set(
            completions.map(
              (completion) =>
                completion.user_id,
            ),
          ),
        ];

        const fixedQuestIds = [
          ...new Set(
            completions
              .map(
                (completion) =>
                  completion.quest_id,
              )
              .filter(
                (id): id is string =>
                  Boolean(id),
              ),
          ),
        ];

        const generatedQuestIds = [
          ...new Set(
            completions
              .map(
                (completion) =>
                  completion.generated_quest_id,
              )
              .filter(
                (id): id is string =>
                  Boolean(id),
              ),
          ),
        ];

        const [
          profileResult,
          fixedQuestResult,
          generatedQuestResult,
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select(
              `
                id,
                name,
                username,
                bio,
                adventure_type,
                avatar_url
              `,
            )
            .in(
              'id',
              completionUserIds,
            ),

          fixedQuestIds.length > 0
            ? supabase
                .from('quests')
                .select(
                  `
                    id,
                    number,
                    title,
                    description
                  `,
                )
                .in(
                  'id',
                  fixedQuestIds,
                )
            : Promise.resolve({
                data: [],
                error: null,
              }),

          generatedQuestIds.length > 0
            ? supabase
                .from(
                  'generated_quests',
                )
                .select(
                  `
                    id,
                    title,
                    description
                  `,
                )
                .in(
                  'id',
                  generatedQuestIds,
                )
            : Promise.resolve({
                data: [],
                error: null,
              }),
        ]);

        if (profileResult.error) {
          console.log(
            'EXPLORE PROFILE ERROR:',
            profileResult.error,
          );

          setFriendCompletions([]);
          return;
        }

        if (fixedQuestResult.error) {
          console.log(
            'EXPLORE FIXED QUEST ERROR:',
            fixedQuestResult.error,
          );
        }

        if (
          generatedQuestResult.error
        ) {
          console.log(
            'EXPLORE GENERATED QUEST ERROR:',
            generatedQuestResult.error,
          );
        }

        const profileMap = new Map(
          (
            profileResult.data ?? []
          ).map((profile) => [
            profile.id,
            profile as Profile,
          ]),
        );

        const fixedQuestMap = new Map(
          (
            fixedQuestResult.data ?? []
          ).map((quest) => [
            quest.id,
            quest as Quest,
          ]),
        );

        const generatedQuestMap =
          new Map(
            (
              generatedQuestResult.data ??
              []
            ).map((quest) => [
              quest.id,
              {
                id: quest.id,
                number: 'AI QUEST',
                title: quest.title,
                description:
                  quest.description,
              } as Quest,
            ]),
          );

        const result =
          completions
            .map((completion) => {
              if (
                blockedSet.has(
                  completion.user_id,
                )
              ) {
                return null;
              }

              const profile =
                profileMap.get(
                  completion.user_id,
                );

              const quest =
                completion.quest_id
                  ? fixedQuestMap.get(
                      completion.quest_id,
                    )
                  : completion
                      .generated_quest_id
                  ? generatedQuestMap.get(
                      completion
                        .generated_quest_id,
                    )
                  : null;

              if (
                !profile ||
                !quest
              ) {
                return null;
              }

              return {
                ...completion,
                profile,
                quest,
              };
            })
            .filter(
              (
                item,
              ): item is FriendCompletion =>
                item !== null,
            );

        setFriendCompletions(
          result,
        );
      } catch (error) {
        console.log(
          'EXPLORE FRIENDS ERROR:',
          error,
        );

        setFriendCompletions([]);
      } finally {
        setLoadingFriends(false);
      }
    }, [getBlockedUserIds]);

  /*
   * Exploreに戻るたび更新。
   *
   * BLOCK / UNBLOCKした後も
   * FRIENDSへ反映される。
   */
  useFocusEffect(
    useCallback(() => {
      loadFriendsFeed();
    }, [loadFriendsFeed]),
  );

  /*
   * USERS
   *
   * 全プロフィール取得後、
   *
   * ・自分
   * ・自分がブロックした相手
   * ・自分をブロックした相手
   *
   * を除外する。
   */
  const loadUsers =
    useCallback(async () => {
      setLoadingUsers(true);

      try {
        let myUserId =
          currentUserId;

        if (!myUserId) {
          const {
            data: { user },
            error: userError,
          } =
            await supabase.auth.getUser();

          if (
            userError ||
            !user
          ) {
            console.log(
              'EXPLORE USERS AUTH ERROR:',
              userError,
            );

            setUsers([]);
            return;
          }

          myUserId = user.id;

          setCurrentUserId(
            myUserId,
          );
        }

        const blockedUserIds =
          await getBlockedUserIds(
            myUserId,
          );

        const blockedSet =
          new Set(
            blockedUserIds,
          );

        const {
          data,
          error,
        } = await supabase
          .from('profiles')
          .select(
            `
              id,
              name,
              username,
              bio,
              adventure_type,
              avatar_url
            `,
          )
          .order('username', {
            ascending: true,
          });

        if (error) {
          console.log(
            'EXPLORE USERS ERROR:',
            error,
          );

          setUsers([]);
          return;
        }

        const profiles =
          (data ??
            []) as Profile[];

        setUsers(
          profiles.filter(
            (profile) =>
              profile.id !==
                myUserId &&
              !blockedSet.has(
                profile.id,
              ),
          ),
        );
      } catch (error) {
        console.log(
          'EXPLORE USERS ERROR:',
          error,
        );

        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    }, [
      currentUserId,
      getBlockedUserIds,
    ]);

  /*
   * USERSタブを開いた時に取得。
   */
  React.useEffect(() => {
    if (mode === 'users') {
      loadUsers();
    }
  }, [mode, loadUsers]);

  /*
   * USER ID / 名前検索
   */
  const filteredUsers =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .replace(/^@/, '')
          .toLowerCase();

      if (!keyword) {
        return [];
      }

      return users.filter(
        (profile) => {
          const username =
            profile.username
              ?.toLowerCase() ??
            '';

          const name =
            profile.name
              ?.toLowerCase() ??
            '';

          return (
            username.includes(
              keyword,
            ) ||
            name.includes(
              keyword,
            )
          );
        },
      );
    }, [users, searchText]);

  const formatDate = (
    value: string,
  ) => {
    return new Date(
      value,
    ).toLocaleDateString(
      'ja-JP',
      {
        month: 'numeric',
        day: 'numeric',
      },
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
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}

        <Text style={styles.logo}>
          POSEQ
        </Text>

        <Text style={styles.sub}>
          EXPLORE
        </Text>

        <Text style={styles.title}>
          誰かの冒険が、
          {'\n'}
          次のきっかけになる。
        </Text>

        {/* FRIENDS / USERS */}

        <View
          style={styles.modeSwitch}
        >
          <Pressable
            style={[
              styles.modeButton,
              mode === 'friends' &&
                styles.modeButtonActive,
            ]}
            onPress={() =>
              setMode('friends')
            }
          >
            <Text
              style={[
                styles.modeText,
                mode === 'friends' &&
                  styles.modeTextActive,
              ]}
            >
              FRIENDS
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.modeButton,
              mode === 'users' &&
                styles.modeButtonActive,
            ]}
            onPress={() =>
              setMode('users')
            }
          >
            <Text
              style={[
                styles.modeText,
                mode === 'users' &&
                  styles.modeTextActive,
              ]}
            >
              USERS
            </Text>
          </Pressable>
        </View>

        {/* FRIENDS */}

        {mode === 'friends' && (
          <>
            <View
              style={
                styles.sectionHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.sectionLabel
                  }
                >
                  FRIENDS' ADVENTURES
                </Text>

                <Text
                  style={
                    styles.sectionDescription
                  }
                >
                  フォローしている人の
                  最近の冒険。
                </Text>
              </View>

              {!loadingFriends && (
                <View
                  style={
                    styles.countBadge
                  }
                >
                  <Text
                    style={
                      styles.countBadgeText
                    }
                  >
                    {
                      friendCompletions.length
                    }{' '}
                    POSTS
                  </Text>
                </View>
              )}
            </View>

            {loadingFriends ? (
              <View
                style={
                  styles.loadingArea
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#8ECAFF"
                />

                <Text
                  style={
                    styles.loadingText
                  }
                >
                  LOADING ADVENTURES...
                </Text>
              </View>
            ) : friendCompletions.length ===
              0 ? (
              <View
                style={
                  styles.emptyCard
                }
              >
                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  FIND YOUR FRIENDS
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  まだ友達の冒険が
                  ありません。
                  {'\n'}
                  USERSから冒険仲間を
                  探してみよう。
                </Text>

                <Pressable
                  style={
                    styles.findUsersButton
                  }
                  onPress={() =>
                    setMode('users')
                  }
                >
                  <Text
                    style={
                      styles.findUsersButtonText
                    }
                  >
                    FIND USERS →
                  </Text>
                </Pressable>
              </View>
            ) : (
              friendCompletions.map(
                (item) => (
                  <Pressable
                    key={item.id}
                    style={
                      styles.feedCard
                    }
                    onPress={() =>
                      router.push({
                        pathname:
                          '/clear',
                        params: {
                          completionId:
                            item.id,
                        },
                      })
                    }
                  >
                    {/* USER */}

                    <Pressable
                      style={
                        styles.feedUserRow
                      }
                      onPress={() =>
                        router.push({
                          pathname:
                            '/user/[id]',
                          params: {
                            id: item
                              .profile
                              .id,
                          },
                        })
                      }
                    >
                      {item.profile
                        .avatar_url ? (
                        <Image
                          source={{
                            uri: item
                              .profile
                              .avatar_url,
                          }}
                          style={
                            styles.feedAvatar
                          }
                        />
                      ) : (
                        <View
                          style={
                            styles.feedAvatarFallback
                          }
                        >
                          <Text
                            style={
                              styles.feedAvatarLetter
                            }
                          >
                            {(
                              item
                                .profile
                                .name ||
                              item
                                .profile
                                .username ||
                              '?'
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </Text>
                        </View>
                      )}

                      <View
                        style={
                          styles.feedUserInfo
                        }
                      >
                        <Text
                          style={
                            styles.feedUserName
                          }
                        >
                          {item.profile
                            .name ||
                            'ADVENTURER'}
                        </Text>

                        <Text
                          style={
                            styles.feedUsername
                          }
                        >
                          @
                          {item.profile
                            .username ||
                            'unknown'}
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.feedDate
                        }
                      >
                        {formatDate(
                          item.completed_at,
                        )}
                      </Text>
                    </Pressable>

                    {/* PHOTO */}

                    {item.photo_url ? (
                      <Image
                        source={{
                          uri:
                            item.photo_url,
                        }}
                        style={
                          styles.feedPhoto
                        }
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={
                          styles.noPhoto
                        }
                      >
                        <Text
                          style={
                            styles.noPhotoMark
                          }
                        >
                          ✦
                        </Text>

                        <Text
                          style={
                            styles.noPhotoText
                          }
                        >
                          ADVENTURE
                          COMPLETED
                        </Text>
                      </View>
                    )}

                    {/* QUEST */}

                    <View
                      style={
                        styles.feedBody
                      }
                    >
                      <Text
                        style={
                          styles.feedQuestNumber
                        }
                      >
                        {
                          item.quest
                            .number
                        }
                      </Text>

                      <Text
                        style={
                          styles.feedQuestTitle
                        }
                      >
                        {
                          item.quest
                            .title
                        }
                      </Text>

                      {item.caption ? (
                        <Text
                          style={
                            styles.feedCaption
                          }
                          numberOfLines={
                            3
                          }
                        >
                          {
                            item.caption
                          }
                        </Text>
                      ) : null}

                      <View
                        style={
                          styles.feedBottom
                        }
                      >
                        <Text
                          style={
                            styles.feedViewText
                          }
                        >
                          VIEW ADVENTURE
                        </Text>

                        <Text
                          style={
                            styles.feedArrow
                          }
                        >
                          →
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ),
              )
            )}
          </>
        )}

        {/* USERS */}

        {mode === 'users' && (
          <>
            <View
              style={
                styles.userHeader
              }
            >
              <Text
                style={
                  styles.sectionLabel
                }
              >
                FIND ADVENTURERS
              </Text>

              <Text
                style={
                  styles.sectionDescription
                }
              >
                ユーザーIDから
                冒険仲間を探そう。
              </Text>
            </View>

            <View
              style={
                styles.searchBox
              }
            >
              <Text
                style={
                  styles.atMark
                }
              >
                @
              </Text>

              <TextInput
                style={
                  styles.searchInput
                }
                value={searchText}
                onChangeText={
                  setSearchText
                }
                placeholder="USER ID"
                placeholderTextColor="#4F5B6E"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />

              {searchText.length >
                0 && (
                <Pressable
                  onPress={() =>
                    setSearchText('')
                  }
                >
                  <Text
                    style={
                      styles.clearSearch
                    }
                  >
                    ×
                  </Text>
                </Pressable>
              )}
            </View>

            <Text
              style={
                styles.searchHint
              }
            >
              IDの一部からでも
              検索できます。
            </Text>

            {loadingUsers ? (
              <View
                style={
                  styles.loadingArea
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#8ECAFF"
                />

                <Text
                  style={
                    styles.loadingText
                  }
                >
                  SEARCHING USERS...
                </Text>
              </View>
            ) : filteredUsers.length ===
              0 ? (
              <View
                style={
                  styles.emptyCard
                }
              >
                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  USER NOT FOUND
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  該当するユーザーが
                  見つかりませんでした。
                </Text>
              </View>
            ) : (
              <>
                <View
                  style={
                    styles.resultHeader
                  }
                >
                  <Text
                    style={
                      styles.resultLabel
                    }
                  >
                    {searchText.trim()
                      ? 'SEARCH RESULT'
                      : 'ADVENTURERS'}
                  </Text>

                  <Text
                    style={
                      styles.resultCount
                    }
                  >
                    {
                      filteredUsers.length
                    }
                  </Text>
                </View>

                {filteredUsers.map(
                  (profile) => (
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
                      {profile.avatar_url ? (
                        <Image
                          source={{
                            uri:
                              profile.avatar_url,
                          }}
                          style={
                            styles.avatar
                          }
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
                              profile.name ||
                              profile.username ||
                              '?'
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </Text>
                        </View>
                      )}

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
                          {profile.name ||
                            'ADVENTURER'}
                        </Text>

                        <Text
                          style={
                            styles.username
                          }
                          numberOfLines={
                            1
                          }
                        >
                          @
                          {profile.username ||
                            'unknown'}
                        </Text>

                        {profile.adventure_type && (
                          <Text
                            style={
                              styles.userType
                            }
                            numberOfLines={
                              1
                            }
                          >
                            {
                              profile.adventure_type
                            }
                          </Text>
                        )}
                      </View>

                      <Text
                        style={
                          styles.userArrow
                        }
                      >
                        →
                      </Text>
                    </Pressable>
                  ),
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#080B12',
    },

    content: {
      paddingHorizontal: 22,
      paddingTop: 20,
      paddingBottom: 120,
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
      fontSize: 30,
      lineHeight: 40,
      fontWeight: '900',
      marginTop: 40,
    },

    modeSwitch: {
      flexDirection: 'row',
      backgroundColor: '#0E131D',
      borderWidth: 1,
      borderColor: '#202838',
      borderRadius: 17,
      padding: 4,
      marginTop: 28,
      marginBottom: 30,
    },

    modeButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 13,
    },

    modeButtonActive: {
      backgroundColor: '#FFFFFF',
    },

    modeText: {
      color: '#596579',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.3,
    },

    modeTextActive: {
      color: '#080B12',
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent:
        'space-between',
      marginBottom: 18,
    },

    userHeader: {
      marginBottom: 18,
    },

    sectionLabel: {
      color: '#8ECAFF',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.6,
    },

    sectionDescription: {
      color: '#687386',
      fontSize: 10,
      lineHeight: 16,
      marginTop: 7,
    },

    countBadge: {
      borderWidth: 1,
      borderColor: '#2B3444',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    countBadgeText: {
      color: '#8ECAFF',
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 1,
    },

    loadingArea: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },

    loadingText: {
      color: '#687386',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.5,
      marginTop: 12,
    },

    emptyCard: {
      backgroundColor: '#111722',
      borderWidth: 1,
      borderColor: '#202838',
      borderRadius: 22,
      padding: 25,
      alignItems: 'center',
    },

    emptyTitle: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.5,
    },

    emptyText: {
      color: '#687386',
      fontSize: 10,
      lineHeight: 18,
      marginTop: 9,
      textAlign: 'center',
    },

    findUsersButton: {
      borderWidth: 1,
      borderColor: '#344054',
      borderRadius: 14,
      paddingHorizontal: 22,
      paddingVertical: 12,
      marginTop: 20,
    },

    findUsersButtonText: {
      color: '#8ECAFF',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1,
    },

    feedCard: {
      backgroundColor: '#111722',
      borderWidth: 1,
      borderColor: '#202838',
      borderRadius: 22,
      overflow: 'hidden',
      marginBottom: 18,
    },

    feedUserRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
    },

    feedAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#192130',
    },

    feedAvatarFallback: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#192130',
      alignItems: 'center',
      justifyContent: 'center',
    },

    feedAvatarLetter: {
      color: '#8ECAFF',
      fontSize: 14,
      fontWeight: '900',
    },

    feedUserInfo: {
      flex: 1,
      marginLeft: 11,
    },

    feedUserName: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '900',
    },

    feedUsername: {
      color: '#596579',
      fontSize: 8,
      fontWeight: '700',
      marginTop: 3,
    },

    feedDate: {
      color: '#4F5B6E',
      fontSize: 8,
      fontWeight: '700',
    },

    feedPhoto: {
      width: '100%',
      height: 280,
      backgroundColor: '#0D121B',
    },

    noPhoto: {
      height: 190,
      backgroundColor: '#0D121B',
      alignItems: 'center',
      justifyContent: 'center',
    },

    noPhotoMark: {
      color: '#8ECAFF',
      fontSize: 28,
    },

    noPhotoText: {
      color: '#4F5B6E',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.4,
      marginTop: 10,
    },

    feedBody: {
      padding: 17,
    },

    feedQuestNumber: {
      color: '#8ECAFF',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1,
    },

    feedQuestTitle: {
      color: '#FFFFFF',
      fontSize: 18,
      lineHeight: 26,
      fontWeight: '900',
      marginTop: 7,
    },

    feedCaption: {
      color: '#687386',
      fontSize: 10,
      lineHeight: 17,
      marginTop: 9,
    },

    feedBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginTop: 16,
      paddingTop: 13,
      borderTopWidth: 1,
      borderTopColor: '#202838',
    },

    feedViewText: {
      color: '#536075',
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 1.1,
    },

    feedArrow: {
      color: '#8ECAFF',
      fontSize: 16,
    },

    searchBox: {
      height: 58,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#111722',
      borderWidth: 1,
      borderColor: '#293345',
      borderRadius: 18,
      paddingHorizontal: 17,
    },

    atMark: {
      color: '#8ECAFF',
      fontSize: 17,
      fontWeight: '900',
      marginRight: 7,
    },

    searchInput: {
      flex: 1,
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
      paddingVertical: 0,
    },

    clearSearch: {
      color: '#687386',
      fontSize: 23,
      fontWeight: '400',
      paddingLeft: 12,
    },

    searchHint: {
      color: '#4F5B6E',
      fontSize: 8,
      marginTop: 9,
      marginBottom: 23,
    },

    resultHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 11,
    },

    resultLabel: {
      color: '#536075',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.3,
    },

    resultCount: {
      color: '#8ECAFF',
      fontSize: 9,
      fontWeight: '900',
    },

    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#111722',
      borderWidth: 1,
      borderColor: '#202838',
      borderRadius: 20,
      padding: 14,
      marginBottom: 11,
    },

    avatar: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: '#192130',
    },

    avatarFallback: {
      width: 54,
      height: 54,
      borderRadius: 27,
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
    },

    userName: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '900',
    },

    username: {
      color: '#687386',
      fontSize: 10,
      fontWeight: '700',
      marginTop: 4,
    },

    userType: {
      color: '#8ECAFF',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 0.8,
      marginTop: 6,
    },

    userArrow: {
      color: '#8ECAFF',
      fontSize: 18,
      marginLeft: 10,
    },
  });