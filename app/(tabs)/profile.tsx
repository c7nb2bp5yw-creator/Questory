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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert(
        'エラー',
        'ログイン情報を確認できませんでした。',
      );

      setIsLoading(false);
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

      setIsLoading(false);
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

    setIsLoading(false);
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

      const questIds = [
        ...new Set(
          completions.map(
            (completion) =>
              completion.quest_id,
          ),
        ),
      ];

      const {
        data: quests,
        error: questsError,
      } = await supabase
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
        .in('id', questIds);

      if (questsError) {
        console.log(
          'PROFILE QUEST ERROR:',
          questsError,
        );

        setJourney([]);
        return;
      }

      const questMap = new Map(
        (quests ?? []).map(
          (quest) => [
            quest.id,
            quest,
          ],
        ),
      );

      const result = completions
        .map((completion) => {
          const quest =
            questMap.get(
              completion.quest_id,
            );

          if (!quest) {
            return null;
          }

          return {
            ...completion,
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
    }, [
      loadProfile,
      loadJourney,
    ]),
  );

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
    userId: string,
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
        `${userId}/avatar-${Date.now()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from('avatars')
          .upload(
            filePath,
            arrayBuffer,
            {
              contentType: mimeType,
              upsert: true,
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

      /*
       * 新しく選択した端末写真なら
       * Storageへアップロード
       */
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

              <View
                style={styles.stat}
              >
                <Text
                  style={styles.statNumber}
                >
                  128
                </Text>

                <Text
                  style={styles.statLabel}
                >
                  FOLLOWERS
                </Text>
              </View>

              <View
                style={styles.divider}
              />

              <View
                style={styles.stat}
              >
                <Text
                  style={styles.statNumber}
                >
                  64
                </Text>

                <Text
                  style={styles.statLabel}
                >
                  FOLLOWING
                </Text>
              </View>

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