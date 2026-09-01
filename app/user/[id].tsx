import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
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

import { supabase } from '../../lib/supabase';

type Profile = {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  adventure_type: string | null;
  avatar_url: string | null;
};

type QuestInfo = {
  id: string;
  number: string;
  title: string;
  description: string;
  difficulty?: string | null;
  estimated_time?: string | null;
};

type Completion = {
  id: string;
  caption: string | null;
  photo_url: string | null;
  completed_at: string;
  quest: QuestInfo | QuestInfo[] | null;
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();

  const targetUserId =
    typeof id === 'string' ? id : null;

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [completions, setCompletions] =
    useState<Completion[]>([]);

  const [nextQuest, setNextQuest] =
    useState<QuestInfo | null>(null);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [isFollowing, setIsFollowing] =
    useState(false);

  const [followerCount, setFollowerCount] =
    useState(0);

  const [followingCount, setFollowingCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [followLoading, setFollowLoading] =
    useState(false);

  const [safetyLoading, setSafetyLoading] =
    useState(false);

  const [isBlocked, setIsBlocked] =
    useState(false);

  const [collaborationLoading, setCollaborationLoading] =
    useState(false);

  const [isCollaborating, setIsCollaborating] =
    useState(false);

  const loadProfile = useCallback(
    async () => {
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setIsBlocked(false);

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.log(
            'USER PROFILE AUTH ERROR:',
            authError,
          );
          return;
        }

        setCurrentUserId(user.id);

        /*
         * BLOCK状態を最初に確認
         *
         * 自分 → 相手
         * 相手 → 自分
         *
         * どちらか一方でも存在すれば
         * プロフィールを表示しない。
         */
        if (user.id !== targetUserId) {
          const {
            data: blockData,
            error: blockError,
          } = await supabase
            .from('blocks')
            .select(
              `
                id,
                blocker_id,
                blocked_id
              `,
            )
            .or(
              `and(blocker_id.eq.${user.id},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${user.id})`,
            )
            .limit(1);

          if (blockError) {
            console.log(
              'BLOCK STATUS ERROR:',
              blockError,
            );
          }

          if (
            !blockError &&
            blockData &&
            blockData.length > 0
          ) {
            setIsBlocked(true);
            setProfile(null);
            setCompletions([]);
            setNextQuest(null);
            return;
          }
        }

        /*
         * 相手プロフィール
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
              bio,
              adventure_type,
              avatar_url
            `,
          )
          .eq('id', targetUserId)
          .single();

        console.log(
          'OTHER PROFILE:',
          profileData,
        );

        console.log(
          'OTHER PROFILE ERROR:',
          profileError,
        );

        if (
          profileError ||
          !profileData
        ) {
          setProfile(null);
          return;
        }

        const loadedProfile =
          profileData as Profile;

        setProfile(loadedProfile);

        /*
         * 相手のNEXT QUEST
         */
        const adventureType =
          loadedProfile.adventure_type
            ?.trim()
            .toUpperCase();

        if (adventureType) {
          const {
            data: questData,
            error: questError,
          } = await supabase
            .from('quests')
            .select(
              `
                id,
                number,
                title,
                description,
                difficulty,
                estimated_time
              `,
            )
            .eq(
              'adventure_type',
              adventureType,
            )
            .order('number', {
              ascending: false,
            })
            .limit(1)
            .maybeSingle();

          if (questError) {
            console.log(
              'OTHER USER NEXT QUEST ERROR:',
              questError,
            );

            setNextQuest(null);
          } else {
            const loadedQuest =
              questData as QuestInfo | null;

            setNextQuest(loadedQuest);

            /*
             * このNEXT QUESTに
             * 自分がすでに協力しているか確認
             */
            if (
              loadedQuest &&
              user.id !== targetUserId
            ) {
              const {
                data: collaborationData,
                error: collaborationError,
              } = await supabase
                .from('quest_collaborations')
                .select('id')
                .eq('owner_id', targetUserId)
                .eq('collaborator_id', user.id)
                .eq('quest_id', loadedQuest.id)
                .maybeSingle();

              if (collaborationError) {
                console.log(
                  'COLLABORATION STATUS ERROR:',
                  collaborationError,
                );
              }

              setIsCollaborating(
                !!collaborationData,
              );
            } else {
              setIsCollaborating(false);
            }
          }
        } else {
          setNextQuest(null);
          setIsCollaborating(false);
        }

        /*
         * フォロワー数
         */
        const {
          count: followers,
          error: followerError,
        } = await supabase
          .from('follows')
          .select('id', {
            count: 'exact',
            head: true,
          })
          .eq(
            'following_id',
            targetUserId,
          );

        if (followerError) {
          console.log(
            'FOLLOWER COUNT ERROR:',
            followerError,
          );
        }

        setFollowerCount(
          followers ?? 0,
        );

        /*
         * フォロー数
         */
        const {
          count: following,
          error: followingError,
        } = await supabase
          .from('follows')
          .select('id', {
            count: 'exact',
            head: true,
          })
          .eq(
            'follower_id',
            targetUserId,
          );

        if (followingError) {
          console.log(
            'FOLLOWING COUNT ERROR:',
            followingError,
          );
        }

        setFollowingCount(
          following ?? 0,
        );

        /*
         * 自分がこの人を
         * フォローしているか
         */
        if (user.id !== targetUserId) {
          const {
            data: followData,
            error: followError,
          } = await supabase
            .from('follows')
            .select('id')
            .eq(
              'follower_id',
              user.id,
            )
            .eq(
              'following_id',
              targetUserId,
            )
            .maybeSingle();

          if (followError) {
            console.log(
              'FOLLOW STATUS ERROR:',
              followError,
            );
          }

          setIsFollowing(
            !!followData,
          );
        }

        /*
         * 相手のQuest履歴
         */
        const {
          data: completionData,
          error: completionError,
        } = await supabase
          .from('quest_completions')
          .select(
            `
              id,
              caption,
              photo_url,
              completed_at,
              quest:quests (
                id,
                number,
                title,
                description
              )
            `,
          )
          .eq(
            'user_id',
            targetUserId,
          )
          .order('completed_at', {
            ascending: false,
          });

        console.log(
          'OTHER USER COMPLETIONS:',
          completionData,
        );

        console.log(
          'OTHER USER COMPLETIONS ERROR:',
          completionError,
        );

        if (
          !completionError &&
          completionData
        ) {
          setCompletions(
            completionData as unknown as Completion[],
          );
        } else {
          setCompletions([]);
        }
      } catch (error) {
        console.log(
          'LOAD OTHER PROFILE ERROR:',
          error,
        );
      } finally {
        setLoading(false);
      }
    },
    [targetUserId],
  );

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  /*
   * FOLLOW / UNFOLLOW
   */
  const handleFollow = async () => {
    if (
      !currentUserId ||
      !targetUserId ||
      currentUserId === targetUserId ||
      followLoading ||
      safetyLoading
    ) {
      return;
    }

    setFollowLoading(true);

    try {
      /*
       * FOLLOW直前にもBLOCK状態を確認。
       */
      const {
        data: blockData,
        error: blockError,
      } = await supabase
        .from('blocks')
        .select('id')
        .or(
          `and(blocker_id.eq.${currentUserId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${currentUserId})`,
        )
        .limit(1);

      if (blockError) {
        console.log(
          'FOLLOW BLOCK CHECK ERROR:',
          blockError,
        );

        Alert.alert(
          'エラー',
          '処理に失敗しました。',
        );
        return;
      }

      if (
        blockData &&
        blockData.length > 0
      ) {
        Alert.alert(
          'フォローできません',
          'このユーザーとは現在やり取りできません。',
        );
        return;
      }

      if (isFollowing) {
        const { error } =
          await supabase
            .from('follows')
            .delete()
            .eq(
              'follower_id',
              currentUserId,
            )
            .eq(
              'following_id',
              targetUserId,
            );

        if (error) {
          console.log(
            'UNFOLLOW ERROR:',
            error,
          );

          Alert.alert(
            'エラー',
            'フォロー解除に失敗しました。',
          );

          return;
        }

        setIsFollowing(false);

        setFollowerCount((count) =>
          Math.max(0, count - 1),
        );
      } else {
        const { error } =
          await supabase
            .from('follows')
            .insert({
              follower_id:
                currentUserId,
              following_id:
                targetUserId,
            });

        if (error) {
          console.log(
            'FOLLOW ERROR:',
            error,
          );

          Alert.alert(
            'エラー',
            'フォローに失敗しました。',
          );

          return;
        }

        setIsFollowing(true);

        setFollowerCount(
          (count) => count + 1,
        );
      }
    } catch (error) {
      console.log(
        'FOLLOW ACTION ERROR:',
        error,
      );

      Alert.alert(
        'エラー',
        '処理に失敗しました。',
      );
    } finally {
      setFollowLoading(false);
    }
  };

  /*
   * REPORT
   */
  const submitReport = async (
    reason: string,
    details: string = '',
  ) => {
    if (
      !currentUserId ||
      !targetUserId ||
      currentUserId === targetUserId ||
      safetyLoading
    ) {
      return;
    }

    setSafetyLoading(true);

    try {
      const { error } =
        await supabase
          .from('reports')
          .insert({
            reporter_id:
              currentUserId,
            reported_user_id:
              targetUserId,
            reason,
            details:
              details.trim() || null,
          });

      if (error) {
        console.log(
          'REPORT ERROR:',
          error,
        );

        Alert.alert(
          'エラー',
          '報告を送信できませんでした。',
        );

        return;
      }

      Alert.alert(
        '報告しました',
        'ご報告ありがとうございます。内容を確認します。',
      );
    } catch (error) {
      console.log(
        'REPORT ACTION ERROR:',
        error,
      );

      Alert.alert(
        'エラー',
        '報告を送信できませんでした。',
      );
    } finally {
      setSafetyLoading(false);
    }
  };

  const requestReportDetails = (
    reason: string,
  ) => {
    Alert.prompt(
      '詳細を入力',
      '必要に応じて、報告したい内容を入力してください。\n例：QUEST #025の投稿写真について',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '送信',
          onPress: (details?: string) =>
            submitReport(
              reason,
              details ?? '',
            ),
        },
      ],
      'plain-text',
      '',
    );
  };

  const handleReport = () => {
    if (
      !currentUserId ||
      !targetUserId ||
      currentUserId === targetUserId ||
      safetyLoading
    ) {
      return;
    }

    Alert.alert(
      'ユーザーを報告',
      '報告する理由を選択してください。',
      [
        {
          text: '不適切なコンテンツ',
          onPress: () =>
            requestReportDetails(
              'inappropriate_content',
            ),
        },
        {
          text: '嫌がらせ',
          onPress: () =>
            requestReportDetails(
              'harassment',
            ),
        },
        {
          text: 'スパム',
          onPress: () =>
            requestReportDetails(
              'spam',
            ),
        },
        {
          text: 'その他',
          onPress: () =>
            requestReportDetails(
              'other',
            ),
        },
        {
          text: 'キャンセル',
          style: 'cancel',
        },
      ],
    );
  };

  /*
   * BLOCK
   */
  const executeBlock = async () => {
    if (
      !currentUserId ||
      !targetUserId ||
      currentUserId === targetUserId ||
      safetyLoading
    ) {
      return;
    }

    setSafetyLoading(true);

    try {
      const { error } =
        await supabase
          .from('blocks')
          .insert({
            blocker_id:
              currentUserId,
            blocked_id:
              targetUserId,
          });

      if (error) {
        console.log(
          'BLOCK ERROR:',
          error,
        );

        /*
         * 二重タップなどで既にBLOCK済みの場合も
         * 安全側に倒してプロフィールから戻す。
         */
        if (error.code === '23505') {
          setIsBlocked(true);
          router.back();
          return;
        }

        Alert.alert(
          'エラー',
          'ブロックできませんでした。',
        );

        return;
      }

      /*
       * DBトリガー側で
       * 双方向のFOLLOWが自動削除される。
       */
      setIsFollowing(false);
      setIsBlocked(true);

      router.back();
    } catch (error) {
      console.log(
        'BLOCK ACTION ERROR:',
        error,
      );

      Alert.alert(
        'エラー',
        'ブロックできませんでした。',
      );
    } finally {
      setSafetyLoading(false);
    }
  };

  const handleBlock = () => {
    if (
      !currentUserId ||
      !targetUserId ||
      currentUserId === targetUserId ||
      safetyLoading
    ) {
      return;
    }

    Alert.alert(
      'このユーザーをブロックしますか？',
      'お互いのフォローが解除され、このユーザーとのやり取りが制限されます。',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ブロック',
          style: 'destructive',
          onPress: executeBlock,
        },
      ],
    );
  };

  /*
   * CO-OP QUEST
   */
  const handleCollaboration = async () => {
    if (
      !currentUserId ||
      !targetUserId ||
      !nextQuest ||
      currentUserId === targetUserId ||
      collaborationLoading ||
      safetyLoading
    ) {
      return;
    }

    setCollaborationLoading(true);

    try {
      /*
       * 参加直前にもBLOCK状態を確認
       */
      const {
        data: blockData,
        error: blockError,
      } = await supabase
        .from('blocks')
        .select('id')
        .or(
          `and(blocker_id.eq.${currentUserId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${currentUserId})`,
        )
        .limit(1);

      if (blockError) {
        console.log(
          'CO-OP BLOCK CHECK ERROR:',
          blockError,
        );

        Alert.alert(
          'エラー',
          '処理に失敗しました。',
        );

        return;
      }

      if (
        blockData &&
        blockData.length > 0
      ) {
        Alert.alert(
          '協力できません',
          'このユーザーとは現在やり取りできません。',
        );

        return;
      }

      if (isCollaborating) {
        Alert.alert(
          'すでに協力中です',
          'このQUESTにはすでに協力しています。',
        );

        return;
      }

      const {
        data: collaborationData,
        error: collaborationError,
      } = await supabase
        .from('quest_collaborations')
        .insert({
          owner_id: targetUserId,
          collaborator_id: currentUserId,
          quest_id: nextQuest.id,
        })
        .select('id')
        .single();

      if (
        collaborationError ||
        !collaborationData
      ) {
        console.log(
          'CO-OP INSERT ERROR:',
          collaborationError,
        );

        if (
          collaborationError?.code ===
          '23505'
        ) {
          setIsCollaborating(true);

          Alert.alert(
            'すでに協力中です',
            'このQUESTにはすでに協力しています。',
          );

          return;
        }

        Alert.alert(
          'エラー',
          'QUESTに協力できませんでした。',
        );

        return;
      }

      setIsCollaborating(true);

      Alert.alert(
        'CO-OP QUEST',
        'このQUESTへの協力を開始しました。',
      );
    } catch (error) {
      console.log(
        'CO-OP ACTION ERROR:',
        error,
      );

      Alert.alert(
        'エラー',
        'QUESTに協力できませんでした。',
      );
    } finally {
      setCollaborationLoading(false);
    }
  };

  const getQuest = (
    completion: Completion,
  ) => {
    if (
      Array.isArray(completion.quest)
    ) {
      return (
        completion.quest[0] ?? null
      );
    }

    return completion.quest;
  };

  const formatDate = (
    value: string,
  ) => {
    const date = new Date(value);

    return date.toLocaleDateString(
      'ja-JP',
      {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      },
    );
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View style={styles.center}>
          <ActivityIndicator
            size="small"
            color="#8ECAFF"
          />

          <Text
            style={styles.loadingText}
          >
            LOADING PROFILE...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * BLOCKされている関係
   */
  if (isBlocked) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View style={styles.center}>
          <Text
            style={styles.notFoundTitle}
          >
            PROFILE UNAVAILABLE
          </Text>

          <Text
            style={styles.blockedMessage}
          >
            このプロフィールは表示できません。
          </Text>

          <Pressable
            style={styles.backHomeButton}
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.backHomeText
              }
            >
              ← BACK
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * Profileなし
   */
  if (!profile) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View style={styles.center}>
          <Text
            style={styles.notFoundTitle}
          >
            USER NOT FOUND
          </Text>

          <Pressable
            style={styles.backHomeButton}
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.backHomeText
              }
            >
              ← BACK
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnProfile =
    currentUserId === profile.id;

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
          onPress={() =>
            router.back()
          }
        >
          <Text style={styles.backText}>
            ← EXPLORE
          </Text>
        </Pressable>

        <Text style={styles.logo}>
          QUESTORY
        </Text>

        <Text style={styles.sub}>
          ADVENTURER
        </Text>

        {/* PROFILE */}

        <View
          style={styles.profileHeader}
        >
          {profile.avatar_url ? (
            <Image
              source={{
                uri: profile.avatar_url,
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
              styles.profileMain
            }
          >
            <Text
              style={styles.name}
            >
              {profile.name ||
                'ADVENTURER'}
            </Text>

            <Text
              style={styles.username}
            >
              @
              {profile.username ||
                'unknown'}
            </Text>
          </View>
        </View>

        {/* FOLLOW + SAFETY */}

        {!isOwnProfile && (
          <>
            <Pressable
              style={[
                styles.followButton,
                isFollowing &&
                  styles.followingButton,
              ]}
              onPress={handleFollow}
              disabled={
                followLoading ||
                safetyLoading
              }
            >
              {followLoading ? (
                <ActivityIndicator
                  size="small"
                  color={
                    isFollowing
                      ? '#FFFFFF'
                      : '#080B12'
                  }
                />
              ) : (
                <Text
                  style={[
                    styles.followButtonText,
                    isFollowing &&
                      styles.followingButtonText,
                  ]}
                >
                  {isFollowing
                    ? 'FOLLOWING'
                    : 'FOLLOW'}
                </Text>
              )}
            </Pressable>

            <View
              style={styles.safetyRow}
            >
              <Pressable
                style={
                  styles.safetyButton
                }
                onPress={handleReport}
                disabled={safetyLoading}
              >
                <Text
                  style={
                    styles.reportText
                  }
                >
                  REPORT
                </Text>
              </Pressable>

              <View
                style={
                  styles.safetyDivider
                }
              />

              <Pressable
                style={
                  styles.safetyButton
                }
                onPress={handleBlock}
                disabled={safetyLoading}
              >
                <Text
                  style={
                    styles.blockText
                  }
                >
                  BLOCK
                </Text>
              </Pressable>
            </View>

            {safetyLoading && (
              <View
                style={
                  styles.safetyLoading
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#687386"
                />
              </View>
            )}
          </>
        )}

        {/* COUNTS */}

        <View style={styles.stats}>
          <View
            style={styles.statItem}
          >
            <Text
              style={styles.statNumber}
            >
              {followerCount}
            </Text>

            <Text
              style={styles.statLabel}
            >
              FOLLOWERS
            </Text>
          </View>

          <View
            style={styles.statDivider}
          />

          <View
            style={styles.statItem}
          >
            <Text
              style={styles.statNumber}
            >
              {followingCount}
            </Text>

            <Text
              style={styles.statLabel}
            >
              FOLLOWING
            </Text>
          </View>

          <View
            style={styles.statDivider}
          />

          <View
            style={styles.statItem}
          >
            <Text
              style={styles.statNumber}
            >
              {completions.length}
            </Text>

            <Text
              style={styles.statLabel}
            >
              CLEARS
            </Text>
          </View>
        </View>

        {/* BIO */}

        <View style={styles.bioCard}>
          <Text
            style={styles.cardLabel}
          >
            PROFILE
          </Text>

          <Text style={styles.bio}>
            {profile.bio ||
              'まだプロフィールはありません。'}
          </Text>

          {profile.adventure_type && (
            <View
              style={styles.typeBadge}
            >
              <Text
                style={
                  styles.typeBadgeLabel
                }
              >
                ADVENTURE TYPE
              </Text>

              <Text
                style={
                  styles.typeBadgeValue
                }
              >
                {
                  profile.adventure_type
                }
              </Text>
            </View>
          )}
        </View>

        {/* NEXT QUEST */}

        <View
          style={
            styles.nextQuestSection
          }
        >
          <View
            style={
              styles.nextQuestHeader
            }
          >
            <View>
              <Text
                style={styles.cardLabel}
              >
                NEXT QUEST
              </Text>

              <Text
                style={
                  styles.nextQuestHeading
                }
              >
                次の冒険。
              </Text>
            </View>

            <Text
              style={
                styles.nextQuestStatus
              }
            >
              ACTIVE
            </Text>
          </View>

          {nextQuest ? (
            <View
              style={
                styles.nextQuestCard
              }
            >
              <View
                style={
                  styles.nextQuestTop
                }
              >
                <Text
                  style={
                    styles.nextQuestNumber
                  }
                >
                  {nextQuest.number}
                </Text>

                {nextQuest.estimated_time ? (
                  <Text
                    style={
                      styles.nextQuestTime
                    }
                  >
                    {
                      nextQuest.estimated_time
                    }
                  </Text>
                ) : null}
              </View>

              <Text
                style={
                  styles.nextQuestTitle
                }
              >
                {nextQuest.title}
              </Text>

              <Text
                style={
                  styles.nextQuestDescription
                }
              >
                {nextQuest.description}
              </Text>

              {!isOwnProfile && (
                <View
                  style={
                    styles.joinPreview
                  }
                >
                  <Text
                    style={
                      styles.joinPreviewText
                    }
                  >
                    CO-OP QUEST
                  </Text>

                  <Pressable
                    onPress={
                      handleCollaboration
                    }
                    disabled={
                      collaborationLoading ||
                      isCollaborating
                    }
                  >
                    {collaborationLoading ? (
                      <ActivityIndicator
                        size="small"
                        color="#8ECAFF"
                      />
                    ) : (
                      <Text
                        style={
                          styles.joinComingSoon
                        }
                      >
                        {isCollaborating
                          ? 'CO-OP中'
                          : '協力する'}
                      </Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            <View
              style={
                styles.nextQuestEmpty
              }
            >
              <Text
                style={
                  styles.nextQuestEmptyText
                }
              >
                NEXT QUESTは
                まだありません。
              </Text>
            </View>
          )}
        </View>

        {/* QUEST HISTORY */}

        <View
          style={styles.historyHeader}
        >
          <View>
            <Text
              style={styles.cardLabel}
            >
              QUEST HISTORY
            </Text>

            <Text
              style={
                styles.historyTitle
              }
            >
              この人の冒険。
            </Text>
          </View>

          <Text
            style={styles.historyCount}
          >
            {completions.length}
          </Text>
        </View>

        {completions.length === 0 ? (
          <View
            style={styles.emptyCard}
          >
            <Text
              style={styles.emptyTitle}
            >
              NO ADVENTURES YET
            </Text>

            <Text
              style={styles.emptyText}
            >
              まだ公開されたQuestの
              記録はありません。
            </Text>
          </View>
        ) : (
          completions.map(
            (completion) => {
              const quest =
                getQuest(completion);

              return (
                <Pressable
                  key={completion.id}
                  style={
                    styles.historyCard
                  }
                  onPress={() =>
                    router.push({
                      pathname:
                        '/clear',
                      params: {
                        completionId:
                          completion.id,
                      },
                    })
                  }
                >
                  {completion.photo_url ? (
                    <Image
                      source={{
                        uri:
                          completion.photo_url,
                      }}
                      style={
                        styles.historyPhoto
                      }
                    />
                  ) : (
                    <View
                      style={
                        styles.historyPhotoFallback
                      }
                    >
                      <Text
                        style={
                          styles.historyPhotoText
                        }
                      >
                        QUEST
                      </Text>
                    </View>
                  )}

                  <View
                    style={
                      styles.historyInfo
                    }
                  >
                    <Text
                      style={
                        styles.historyNumber
                      }
                    >
                      {quest?.number ||
                        'QUEST'}
                    </Text>

                    <Text
                      style={
                        styles.historyQuestTitle
                      }
                      numberOfLines={2}
                    >
                      {quest?.title ||
                        'Quest'}
                    </Text>

                    <Text
                      style={
                        styles.historyDate
                      }
                    >
                      {formatDate(
                        completion.completed_at,
                      )}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.historyArrow
                    }
                  >
                    →
                  </Text>
                </Pressable>
              );
            },
          )
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
    letterSpacing: 1.5,
    marginTop: 12,
  },

  notFoundTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  blockedMessage: {
    color: '#687386',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 12,
  },

  backHomeButton: {
    marginTop: 25,
  },

  backHomeText: {
    color: '#8ECAFF',
    fontSize: 10,
    fontWeight: '900',
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

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 42,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#192130',
  },

  avatarFallback: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#192130',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarLetter: {
    color: '#8ECAFF',
    fontSize: 27,
    fontWeight: '900',
  },

  profileMain: {
    flex: 1,
    marginLeft: 18,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
  },

  username: {
    color: '#687386',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 7,
  },

  followButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },

  followingButton: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#354156',
  },

  followButtonText: {
    color: '#080B12',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  followingButtonText: {
    color: '#FFFFFF',
  },

  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  safetyButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },

  safetyDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#293345',
  },

  reportText: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  blockText: {
    color: '#A66B72',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  safetyLoading: {
    alignItems: 'center',
    marginTop: 5,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E131D',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 20,
    paddingVertical: 18,
    marginTop: 18,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  statLabel: {
    color: '#596579',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 6,
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#202838',
  },

  bioCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 22,
    padding: 19,
    marginTop: 18,
  },

  cardLabel: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  bio: {
    color: '#DCE1E8',
    fontSize: 12,
    lineHeight: 21,
    marginTop: 13,
  },

  typeBadge: {
    backgroundColor: '#0C111A',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 15,
    padding: 14,
    marginTop: 17,
  },

  typeBadgeLabel: {
    color: '#536075',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  typeBadgeValue: {
    color: '#8ECAFF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 7,
  },

  nextQuestSection: {
    marginTop: 38,
  },

  nextQuestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  nextQuestHeading: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 8,
  },

  nextQuestStatus: {
    color: '#8ECAFF',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  nextQuestCard: {
    backgroundColor: '#0E141E',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 22,
    padding: 19,
  },

  nextQuestTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  nextQuestNumber: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  nextQuestTime: {
    color: '#536075',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  nextQuestTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '900',
    marginTop: 12,
  },

  nextQuestDescription: {
    color: '#687386',
    fontSize: 10,
    lineHeight: 17,
    marginTop: 9,
  },

  joinPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#202838',
    marginTop: 17,
    paddingTop: 15,
  },

  joinPreviewText: {
    color: '#536075',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },

  joinComingSoon: {
    color: '#8ECAFF',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },

  nextQuestEmpty: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 22,
    padding: 22,
  },

  nextQuestEmptyText: {
    color: '#687386',
    fontSize: 10,
    textAlign: 'center',
  },

  historyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 38,
    marginBottom: 17,
  },

  historyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 8,
  },

  historyCount: {
    color: '#8ECAFF',
    fontSize: 11,
    fontWeight: '900',
  },

  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 20,
    padding: 12,
    marginBottom: 11,
  },

  historyPhoto: {
    width: 67,
    height: 67,
    borderRadius: 15,
    backgroundColor: '#192130',
  },

  historyPhotoFallback: {
    width: 67,
    height: 67,
    borderRadius: 15,
    backgroundColor: '#192130',
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyPhotoText: {
    color: '#4F5B6E',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },

  historyInfo: {
    flex: 1,
    marginLeft: 13,
  },

  historyNumber: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  historyQuestTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '900',
    marginTop: 5,
  },

  historyDate: {
    color: '#536075',
    fontSize: 8,
    marginTop: 6,
  },

  historyArrow: {
    color: '#8ECAFF',
    fontSize: 18,
    marginLeft: 8,
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
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  emptyText: {
    color: '#687386',
    fontSize: 10,
    lineHeight: 17,
    marginTop: 9,
    textAlign: 'center',
  },
});