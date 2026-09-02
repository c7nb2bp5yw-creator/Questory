import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import React, {
  useCallback,
  useState,
} from 'react';

import {
  Alert,
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

type Quest = {
  id: string;
  number: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_time: string;
  adventure_type: string;
};

type Completion = {
  id: string;
  quest_id: string;
  caption: string | null;
  photo_url: string | null;
  completed_at: string;
  quest: Quest;
};

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [bio, setBio] = useState('');
  const [adventureType, setAdventureType] =
    useState('');

  const [profileImage, setProfileImage] =
    useState<string | null>(null);

  const [journey, setJourney] =
    useState<Completion[]>([]);

  const [followersCount, setFollowersCount] =
    useState(0);

  const [followingCount, setFollowingCount] =
    useState(0);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isLoadingJourney, setIsLoadingJourney] =
    useState(true);

  const [saved, setSaved] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  /*
   * PROFILE
   */
  const loadProfile = useCallback(async () => {
    setIsLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(
          'エラー',
          'ログイン情報を確認できませんでした。',
        );

        return;
      }

      const { data, error } =
        await supabase
          .from('profiles')
          .select(
            'name, username, bio, avatar_url, adventure_type',
          )
          .eq('id', user.id)
          .single();

      if (error) {
        console.log(
          'PROFILE LOAD ERROR:',
          error,
        );

        Alert.alert(
          'エラー',
          'プロフィールを読み込めませんでした。',
        );

        return;
      }

      setName(data.name ?? '');

      setUserId(
        data.username
          ? `@${data.username}`
          : '',
      );

      setBio(data.bio ?? '');

      setAdventureType(
        data.adventure_type ?? '',
      );

      setProfileImage(
        data.avatar_url ?? null,
      );
    } catch (error) {
      console.log(
        'PROFILE LOAD CATCH ERROR:',
        error,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /*
   * FOLLOWERS / FOLLOWING
   */
  const loadFollowStats =
    useCallback(async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.log(
            'FOLLOW STATS USER ERROR:',
            userError,
          );

          setFollowersCount(0);
          setFollowingCount(0);
          return;
        }

        const [
          followersResult,
          followingResult,
        ] = await Promise.all([
          supabase
            .from('follows')
            .select('*', {
              count: 'exact',
              head: true,
            })
            .eq(
              'following_id',
              user.id,
            ),

          supabase
            .from('follows')
            .select('*', {
              count: 'exact',
              head: true,
            })
            .eq(
              'follower_id',
              user.id,
            ),
        ]);

        if (followersResult.error) {
          console.log(
            'FOLLOWERS COUNT ERROR:',
            followersResult.error,
          );
        }

        if (followingResult.error) {
          console.log(
            'FOLLOWING COUNT ERROR:',
            followingResult.error,
          );
        }

        setFollowersCount(
          followersResult.count ?? 0,
        );

        setFollowingCount(
          followingResult.count ?? 0,
        );
      } catch (error) {
        console.log(
          'FOLLOW STATS CATCH ERROR:',
          error,
        );

        setFollowersCount(0);
        setFollowingCount(0);
      }
    }, []);

  /*
   * QUEST HISTORY
   */
  const loadJourney = useCallback(async () => {
    setIsLoadingJourney(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log(
          'PROFILE JOURNEY USER ERROR:',
          userError,
        );

        setJourney([]);
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
            quest_id,
            generated_quest_id,
            caption,
            photo_url,
            completed_at
          `,
        )
        .eq('user_id', user.id)
        .order('completed_at', {
          ascending: false,
        });

      if (completionError) {
        console.log(
          'PROFILE JOURNEY ERROR:',
          completionError,
        );

        setJourney([]);
        return;
      }

      if (
        !completions ||
        completions.length === 0
      ) {
        setJourney([]);
        return;
      }

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
        fixedQuestsResult,
        generatedQuestsResult,
      ] = await Promise.all([
        fixedQuestIds.length > 0
          ? supabase
              .from('quests')
              .select(
                `
                  id,
                  number,
                  title,
                  description,
                  difficulty,
                  estimated_time,
                  adventure_type
                `,
              )
              .in('id', fixedQuestIds)
          : Promise.resolve({
              data: [],
              error: null,
            }),

        generatedQuestIds.length > 0
          ? supabase
              .from('generated_quests')
              .select(
                `
                  id,
                  title,
                  description,
                  difficulty,
                  estimated_time,
                  category
                `,
              )
              .in('id', generatedQuestIds)
          : Promise.resolve({
              data: [],
              error: null,
            }),
      ]);

      if (fixedQuestsResult.error) {
        console.log(
          'PROFILE FIXED QUEST ERROR:',
          fixedQuestsResult.error,
        );
      }

      if (generatedQuestsResult.error) {
        console.log(
          'PROFILE GENERATED QUEST ERROR:',
          generatedQuestsResult.error,
        );
      }

      const fixedQuestMap = new Map(
        (fixedQuestsResult.data ?? []).map(
          (quest) => [
            quest.id,
            quest,
          ],
        ),
      );

      const generatedQuestMap = new Map(
        (generatedQuestsResult.data ?? []).map(
          (quest) => [
            quest.id,
            {
              id: quest.id,
              number: 'AI QUEST',
              title: quest.title,
              description: quest.description,
              difficulty: quest.difficulty,
              estimated_time:
                quest.estimated_time,
              adventure_type:
                quest.category ?? '',
            },
          ],
        ),
      );

      const result = completions
        .map((completion) => {
          const quest =
            completion.quest_id
              ? fixedQuestMap.get(
                  completion.quest_id,
                )
              : completion.generated_quest_id
              ? generatedQuestMap.get(
                  completion.generated_quest_id,
                )
              : null;

          if (!quest) {
            return null;
          }

          return {
            id: completion.id,
            quest_id:
              completion.quest_id ??
              completion.generated_quest_id ??
              '',
            caption: completion.caption,
            photo_url: completion.photo_url,
            completed_at:
              completion.completed_at,
            quest,
          };
        })
        .filter(
          (
            item,
          ): item is Completion =>
            item !== null,
        );

      setJourney(result);
    } catch (error) {
      console.log(
        'PROFILE JOURNEY CATCH ERROR:',
        error,
      );

      setJourney([]);
    } finally {
      setIsLoadingJourney(false);
    }
  }, []);

  /*
   * Profileを開くたびに更新
   */
  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadJourney();
      loadFollowStats();
    }, [
      loadProfile,
      loadJourney,
      loadFollowStats,
    ]),
  );

  /*
   * FOLLOWERS LIST
   */
  const openFollowers = () => {
    router.push({
      pathname: '/follows',
      params: {
        mode: 'followers',
      },
    });
  };

  /*
   * FOLLOWING LIST
   */
  const openFollowing = () => {
    router.push({
      pathname: '/follows',
      params: {
        mode: 'following',
      },
    });
  };

  /*
   * PROFILE PHOTO
   */
  const changePhoto = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        '写真へのアクセスが必要です',
        'プロフィール写真を選ぶために、写真へのアクセスを許可してください。',
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (!result.canceled) {
      setProfileImage(
        result.assets[0].uri,
      );

      setSaved(false);
    }
  };

  /*
   * PROFILE PHOTO → SUPABASE STORAGE
   */
  const uploadProfileImage = async (
    imageUri: string,
    currentUserId: string,
  ) => {
    try {
      const response =
        await fetch(imageUri);

      const arrayBuffer =
        await response.arrayBuffer();

      const extension =
        imageUri
          .split('.')
          .pop()
          ?.split('?')[0]
          ?.toLowerCase() || 'jpg';

      const mimeType =
        extension === 'png'
          ? 'image/png'
          : extension === 'webp'
          ? 'image/webp'
          : 'image/jpeg';

      const filePath =
        `${currentUserId}/avatar-${Date.now()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from('avatars')
          .upload(
            filePath,
            arrayBuffer,
            {
              contentType: mimeType,
              upsert: false,
            },
          );

      if (uploadError) {
        console.log(
          'AVATAR UPLOAD ERROR:',
          uploadError,
        );

        throw uploadError;
      }

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.log(
        'AVATAR UPLOAD CATCH ERROR:',
        error,
      );

      throw error;
    }
  };

  /*
   * SAVE PROFILE
   */
  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setSaved(false);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(
          'エラー',
          'ログイン情報を確認できませんでした。',
        );

        return;
      }

      const cleanUsername =
        userId
          .trim()
          .replace(/^@/, '');

      let avatarUrl =
        profileImage;

      if (
        profileImage &&
        !profileImage.startsWith(
          'http',
        )
      ) {
        avatarUrl =
          await uploadProfileImage(
            profileImage,
            user.id,
          );

        setProfileImage(
          avatarUrl,
        );
      }

      const { error } =
        await supabase
          .from('profiles')
          .update({
            name: name.trim(),
            username: cleanUsername,
            bio: bio.trim(),
            avatar_url: avatarUrl,
          })
          .eq('id', user.id);

      if (error) {
        console.log(
          'PROFILE SAVE ERROR:',
          error,
        );

        throw error;
      }

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error: any) {
      console.log(
        'PROFILE SAVE CATCH ERROR:',
        error,
      );

      Alert.alert(
        '保存エラー',
        error?.message ||
          'プロフィールの保存に失敗しました。',
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * DATE
   */
  const formatDate = (
    dateString: string,
  ) => {
    const date = new Date(
      dateString,
    );

    return date.toLocaleDateString(
      'ja-JP',
      {
        year: 'numeric',
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

        <View style={styles.topBar}>
          <View>
            <Text style={styles.logo}>
              QUESTORY
            </Text>

            <Text style={styles.sub}>
              PROFILE
            </Text>
          </View>

          <Pressable
            style={
              styles.settingsButton
            }
            onPress={() =>
              router.push('/settings')
            }
          >
            <Text
              style={
                styles.settingsButtonText
              }
            >
              ⚙ SETTINGS
            </Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View
            style={
              styles.loadingContainer
            }
          >
            <Text
              style={styles.loadingText}
            >
              LOADING PROFILE...
            </Text>
          </View>
        ) : (
          <>
            {/* PROFILE */}

            <View
              style={styles.profileHeader}
            >
              <View
                style={styles.avatar}
              >
                {profileImage ? (
                  <Image
                    source={{
                      uri: profileImage,
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
                    {name
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                )}
              </View>

              <Pressable
                style={
                  styles.photoButton
                }
                onPress={changePhoto}
              >
                <Text
                  style={
                    styles.photoButtonText
                  }
                >
                  CHANGE PHOTO
                </Text>
              </Pressable>
            </View>

            {/* PROFILE INFORMATION */}

            <Text
              style={styles.sectionLabel}
            >
              PROFILE INFORMATION
            </Text>

            <View
              style={styles.inputGroup}
            >
              <Text
                style={styles.label}
              >
                NAME
              </Text>

              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setSaved(false);
                }}
                placeholder="名前を入力"
                placeholderTextColor="#4F5B6E"
              />
            </View>

            <View
              style={styles.inputGroup}
            >
              <Text
                style={styles.label}
              >
                USER ID
              </Text>

              <TextInput
                style={styles.input}
                value={userId}
                onChangeText={(text) => {
                  setUserId(text);
                  setSaved(false);
                }}
                autoCapitalize="none"
                placeholder="@username"
                placeholderTextColor="#4F5B6E"
              />
            </View>

            <View
              style={styles.inputGroup}
            >
              <Text
                style={styles.label}
              >
                BIO
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.bioInput,
                ]}
                value={bio}
                onChangeText={(text) => {
                  setBio(text);
                  setSaved(false);
                }}
                multiline
                maxLength={80}
                placeholder="自己紹介を書こう"
                placeholderTextColor="#4F5B6E"
              />

              <Text
                style={
                  styles.characterCount
                }
              >
                {bio.length}/80
              </Text>
            </View>

            {/* ADVENTURE TYPE */}

            <Text
              style={styles.sectionLabel}
            >
              ADVENTURE TYPE
            </Text>

            <View
              style={styles.typeBox}
            >
              <Text
                style={styles.typeText}
              >
                {adventureType ||
                  'NOT SET'}
              </Text>
            </View>

            {/* STATS */}

            <Text
              style={styles.sectionLabel}
            >
              YOUR STATS
            </Text>

            <View
              style={styles.stats}
            >
              <View
                style={styles.stat}
              >
                <Text
                  style={styles.statNumber}
                >
                  {journey.length}
                </Text>

                <Text
                  style={styles.statLabel}
                >
                  QUESTS CLEARED
                </Text>
              </View>

              <View
                style={styles.divider}
              />

              <Pressable
                style={styles.stat}
                onPress={openFollowers}
              >
                <Text
                  style={styles.statNumber}
                >
                  {followersCount}
                </Text>

                <Text
                  style={
                    styles.statLabelActive
                  }
                >
                  FOLLOWERS
                </Text>
              </Pressable>

              <View
                style={styles.divider}
              />

              <Pressable
                style={styles.stat}
                onPress={openFollowing}
              >
                <Text
                  style={styles.statNumber}
                >
                  {followingCount}
                </Text>

                <Text
                  style={
                    styles.statLabelActive
                  }
                >
                  FOLLOWING
                </Text>
              </Pressable>
            </View>

            {/* QUEST HISTORY */}

            <View
              style={styles.historyHeader}
            >
              <View>
                <Text
                  style={styles.sectionLabel}
                >
                  YOUR JOURNEY
                </Text>

                <Text
                  style={styles.historyTitle}
                >
                  QUEST HISTORY
                </Text>
              </View>

              <Text
                style={styles.historyCount}
              >
                {journey.length} CLEARED
              </Text>
            </View>

            {isLoadingJourney ? (
              <View
                style={
                  styles.historyEmpty
                }
              >
                <Text
                  style={
                    styles.historyEmptyText
                  }
                >
                  LOADING QUEST HISTORY...
                </Text>
              </View>
            ) : journey.length === 0 ? (
              <View
                style={
                  styles.historyEmpty
                }
              >
                <Text
                  style={
                    styles.historyEmptyIcon
                  }
                >
                  ✦
                </Text>

                <Text
                  style={
                    styles.historyEmptyTitle
                  }
                >
                  NO QUESTS CLEARED
                </Text>

                <Text
                  style={
                    styles.historyEmptyText
                  }
                >
                  CLEARしたQUESTがここに表示されます。
                </Text>
              </View>
            ) : (
              journey.map((item) => (
                <Pressable
                  key={item.id}
                  style={
                    styles.historyCard
                  }
                  onPress={() =>
                    router.push({
                      pathname: '/clear',
                      params: {
                        completionId:
                          item.id,
                      },
                    })
                  }
                >
                  <View
                    style={
                      styles.historyNumberBox
                    }
                  >
                    <Text
                      style={
                        styles.historyNumber
                      }
                    >
                      {item.quest.number.replace(
                        '#',
                        '',
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.historyInfo
                    }
                  >
                    <Text
                      style={
                        styles.historyQuest
                      }
                    >
                      {item.quest.title}
                    </Text>

                    <Text
                      style={
                        styles.historyDate
                      }
                    >
                      CLEARED{' '}
                      {formatDate(
                        item.completed_at,
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
              ))
            )}

            {/* SAVE */}

            <Pressable
              style={[
                styles.saveButton,
                saved &&
                  styles.savedButton,
                isSaving &&
                  styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text
                style={styles.saveText}
              >
                {isSaving
                  ? 'SAVING...'
                  : saved
                  ? '✓ SAVED'
                  : 'SAVE PROFILE'}
              </Text>
            </Pressable>

            <Text
              style={styles.note}
            >
              プロフィール情報はSupabaseに保存されます。
            </Text>
          </>
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

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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

  settingsButton: {
    borderWidth: 1,
    borderColor: '#344054',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  settingsButtonText: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  loadingContainer: {
    alignItems: 'center',
    marginTop: 100,
  },

  loadingText: {
    color: '#687386',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  profileHeader: {
    alignItems: 'center',
    marginTop: 42,
    marginBottom: 38,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
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
    fontSize: 34,
    fontWeight: '900',
  },

  photoButton: {
    borderWidth: 1,
    borderColor: '#344054',
    borderRadius: 14,
    paddingHorizontal: 17,
    paddingVertical: 11,
    marginTop: 15,
  },

  photoButtonText: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  sectionLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 14,
  },

  inputGroup: {
    marginBottom: 22,
  },

  label: {
    color: '#536075',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 15,
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  characterCount: {
    color: '#4F5B6E',
    fontSize: 8,
    textAlign: 'right',
    marginTop: 6,
  },

  typeBox: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#8ECAFF',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 28,
  },

  typeText: {
    color: '#8ECAFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  stats: {
    flexDirection: 'row',
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 20,
    paddingVertical: 20,
    marginBottom: 35,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statNumber: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
  },

  statLabel: {
    color: '#596579',
    fontSize: 7,
    fontWeight: '900',
    marginTop: 5,
  },

  statLabelActive: {
    color: '#8ECAFF',
    fontSize: 7,
    fontWeight: '900',
    marginTop: 5,
  },

  divider: {
    width: 1,
    backgroundColor: '#293345',
  },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },

  historyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginTop: -8,
  },

  historyCount: {
    color: '#536075',
    fontSize: 8,
    fontWeight: '900',
  },

  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 17,
    padding: 14,
    marginBottom: 9,
  },

  historyNumberBox: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#192130',
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyNumber: {
    color: '#8ECAFF',
    fontSize: 11,
    fontWeight: '900',
  },

  historyInfo: {
    flex: 1,
    marginLeft: 13,
  },

  historyQuest: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },

  historyDate: {
    color: '#566175',
    fontSize: 8,
    marginTop: 5,
  },

  historyArrow: {
    color: '#687386',
    fontSize: 18,
    marginLeft: 8,
  },

  historyEmpty: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 17,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 9,
  },

  historyEmptyIcon: {
    color: '#8ECAFF',
    fontSize: 28,
    marginBottom: 10,
  },

  historyEmptyTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  historyEmptyText: {
    color: '#596579',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 7,
  },

  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 28,
  },

  savedButton: {
    backgroundColor: '#8ECAFF',
  },

  disabledButton: {
    opacity: 0.35,
  },

  saveText: {
    color: '#080B12',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  note: {
    color: '#4F5B6E',
    fontSize: 9,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 15,
  },
});