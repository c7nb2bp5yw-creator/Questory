import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

import { supabase } from '../lib/supabase';

type Quest = {
  id: string;
  number: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_time: string;
  adventure_type: string;
};

export default function PostScreen() {
  const {
    questId,
    questMode,
    collaborationId,
  } =
    useLocalSearchParams<{
      questId?: string;
      questMode?: 'main' | 'other' | 'coop';
      collaborationId?: string;
    }>();

  const [quest, setQuest] = useState<Quest | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [posted, setPosted] = useState(false);
  const [posting, setPosting] = useState(false);
  const [loadingQuest, setLoadingQuest] = useState(true);

  /*
   * QUESTを読み込む
   */
  useEffect(() => {
    const loadQuest = async () => {
      if (!questId) {
        Alert.alert(
          'エラー',
          'Questの情報が見つかりませんでした。',
        );

        setLoadingQuest(false);
        return;
      }

      // まず固定QUESTを探す
      const {
        data: fixedQuest,
        error: fixedError,
      } = await supabase
        .from('quests')
        .select(
          'id, number, title, description, difficulty, estimated_time, adventure_type',
        )
        .eq('id', questId)
        .maybeSingle();

      if (fixedQuest) {
        console.log(
          'POST FIXED QUEST:',
          fixedQuest,
        );

        setQuest(fixedQuest);
        setLoadingQuest(false);
        return;
      }

      if (fixedError) {
        console.log(
          'POST FIXED QUEST ERROR:',
          fixedError,
        );
      }

      // 固定QUESTに無ければAI QUESTを探す
      const {
        data: generatedQuest,
        error: generatedError,
      } = await supabase
        .from('generated_quests')
        .select(
          'id, title, description, difficulty, estimated_time, category',
        )
        .eq('id', questId)
        .maybeSingle();

      console.log(
        'POST AI QUEST:',
        generatedQuest,
      );

      console.log(
        'POST AI QUEST ERROR:',
        generatedError,
      );

      if (generatedError || !generatedQuest) {
        Alert.alert(
          'エラー',
          'Questを読み込めませんでした。',
        );

        setLoadingQuest(false);
        return;
      }

      setQuest({
        id: generatedQuest.id,
        number: 'AI QUEST',
        title: generatedQuest.title,
        description: generatedQuest.description,
        difficulty: generatedQuest.difficulty,
        estimated_time:
          generatedQuest.estimated_time,
        adventure_type:
          generatedQuest.category,
      });
      setLoadingQuest(false);
    };

    loadQuest();
  }, [questId]);

  /*
   * 写真を選ぶ
   */
  const pickPhoto = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        '写真へのアクセスが必要です',
        'CLEAR写真を選ぶために、写真へのアクセスを許可してください。',
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.85,
      });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPosted(false);
    }
  };

  /*
   * CLEAR写真をSupabase Storageへアップロード
   */
  const uploadQuestPhoto = async (
    imageUri: string,
    userId: string,
  ) => {
    const response = await fetch(imageUri);

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
      `${userId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from('quest-photos')
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
        'QUEST PHOTO UPLOAD ERROR:',
        uploadError,
      );

      throw uploadError;
    }

    const { data } =
      supabase.storage
        .from('quest-photos')
        .getPublicUrl(filePath);

    return data.publicUrl;
  };

  /*
   * CLEARする
   */
  const handlePost = async () => {
    if (!image) {
      Alert.alert(
        '写真を選択してください',
        'CLEARした時の写真を1枚選んでください。',
      );

      return;
    }

    if (!quest) {
      Alert.alert(
        'Questが見つかりません',
        'もう一度Questからやり直してください。',
      );

      return;
    }

    if (posting) {
      return;
    }

    setPosting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        Alert.alert(
          'ログインが必要です',
          'CLEARを保存するにはログインしてください。',
        );

        return;
      }

      /*
       * ① 写真をStorageへ保存
       */
      const photoUrl =
        await uploadQuestPhoto(
          image,
          user.id,
        );

      /*
       * ② CLEAR記録をDBへ保存
       *
       * main
       * → CLEAR保存 + quest_actions + 進捗更新を
       *   Supabase側でまとめて処理
       *
       * other / coop
       * → 今まで通りCLEARのみ保存
       */
      if (
        questMode === 'main' &&
        quest.number === 'AI QUEST'
      ) {
        // AI QUESTのCLEAR
        const {
          error: generatedCompletionError,
        } = await supabase.rpc(
          'complete_generated_main_quest',
          {
            p_generated_quest_id: quest.id,
            p_caption:
              caption.trim() || null,
            p_photo_url: photoUrl,
          },
        );

        if (generatedCompletionError) {
          throw generatedCompletionError;
        }
      } else if (questMode === 'main') {
        // 固定NEXT QUESTのCLEAR
        const {
          error: mainCompletionError,
        } = await supabase.rpc(
          'complete_fixed_main_quest',
          {
            p_quest_id: quest.id,
            p_caption:
              caption.trim() || null,
            p_photo_url: photoUrl,
          },
        );

        if (mainCompletionError) {
          throw mainCompletionError;
        }
      } else if (questMode === 'coop') {
        if (!collaborationId) {
          throw new Error(
            'CO-OP QUESTの情報が見つかりません。',
          );
        }

        const {
          error: coopCompletionError,
        } = await supabase.rpc(
          'complete_coop_quest',
          {
            p_collaboration_id:
              collaborationId,
            p_caption:
              caption.trim() || null,
            p_photo_url: photoUrl,
          },
        );

        if (coopCompletionError) {
          throw coopCompletionError;
        }
      } else {
        const { error: completionError } =
          await supabase
            .from('quest_completions')
            .insert({
              user_id: user.id,
              quest_id: quest.id,
              caption:
                caption.trim() || null,
              photo_url: photoUrl,
            });

        if (completionError) {
          throw completionError;
        }
      }

      /*
       * 完了画面
       */
      setPosted(true);
    } catch (error: any) {
      console.log(
        'CLEAR SAVE ERROR:',
        error,
      );

      Alert.alert(
        '保存できませんでした',
        error?.message ??
          'CLEARの保存中にエラーが発生しました。',
      );
    } finally {
      setPosting(false);
    }
  };

  /*
   * Quest読み込み中
   */
  if (loadingQuest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            LOADING QUEST...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * Questがない
   */
  if (!quest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyTitle}>
            QUEST NOT FOUND
          </Text>

          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>
              BACK
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * CLEAR完了画面
   */
  if (posted) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={
            styles.completeScroll
          }
        >
          <View style={styles.complete}>

            <Text style={styles.completeIcon}>
              ✓
            </Text>

            <Text style={styles.completeLabel}>
              QUEST CLEAR
            </Text>

            <Text style={styles.completeTitle}>
              冒険を残しました。
            </Text>

            <Text style={styles.completeText}>
              {quest.number}
              {'\n'}
              {quest.title}
              {'\n\n'}
              あなたのCLEARがプロフィールに
              記録されました。
            </Text>

            {image && (
              <Image
                source={{ uri: image }}
                style={styles.completeImage}
              />
            )}

            <Pressable
              style={styles.homeButton}
              onPress={() =>
                router.replace('/(tabs)')
              }
            >
              <Text style={styles.homeButtonText}>
                BACK TO HOME
              </Text>
            </Pressable>

          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /*
   * POST画面
   */
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
      >

        <Text style={styles.logo}>
          POSEQ
        </Text>

        <Text style={styles.sub}>
          POST CLEAR
        </Text>

        <Text style={styles.title}>
          冒険を残そう。
        </Text>

        <View style={styles.questCard}>

          <Text style={styles.questLabel}>
            CLEARED QUEST
          </Text>

          <Text style={styles.questNumber}>
            {quest.number}
          </Text>

          <Text style={styles.questTitle}>
            {quest.title}
          </Text>

          <View style={styles.clearBadge}>
            <Text style={styles.clearBadgeText}>
              ✓ CLEAR
            </Text>
          </View>

        </View>

        <Text style={styles.sectionLabel}>
          CLEAR PHOTO
        </Text>

        <Pressable
          style={styles.photoArea}
          onPress={pickPhoto}
        >
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.selectedImage}
            />
          ) : (
            <>
              <Text style={styles.camera}>
                +
              </Text>

              <Text style={styles.photoTitle}>
                写真を選択
              </Text>

              <Text style={styles.photoDescription}>
                この冒険の思い出を1枚
              </Text>
            </>
          )}
        </Pressable>

        {image && (
          <Pressable
            style={styles.changeButton}
            onPress={pickPhoto}
          >
            <Text style={styles.changeText}>
              CHANGE PHOTO
            </Text>
          </Pressable>
        )}

        <Text style={styles.sectionLabel}>
          MEMORY
        </Text>

        <TextInput
          style={styles.caption}
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={120}
          placeholder="この冒険で感じたことを残そう。"
          placeholderTextColor="#4F5B6E"
          textAlignVertical="top"
        />

        <Text style={styles.count}>
          {caption.length}/120
        </Text>

        <Pressable
          style={[
            styles.postButton,
            (!image || posting) &&
              styles.disabledButton,
          ]}
          onPress={handlePost}
          disabled={posting}
        >
          <Text style={styles.postButtonText}>
            {posting
              ? 'SAVING...'
              : 'POST CLEAR'}
          </Text>
        </Pressable>

        <Text style={styles.note}>
          投稿したCLEARはプロフィールの
          QUEST HISTORYに表示されます。
          {'\n'}
          他人の個人情報や権利を侵害する写真、
          不適切な内容は投稿しないでください。
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

  completeScroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },

  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 17,
    paddingHorizontal: 60,
    marginTop: 25,
  },

  backButtonText: {
    color: '#080B12',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
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
    fontSize: 32,
    fontWeight: '900',
    marginTop: 42,
    marginBottom: 25,
  },

  questCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 22,
    padding: 19,
    marginBottom: 30,
  },

  questLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  questNumber: {
    color: '#8ECAFF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 13,
  },

  questTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '900',
    marginTop: 7,
  },

  clearBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#8ECAFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 15,
  },

  clearBadgeText: {
    color: '#080B12',
    fontSize: 8,
    fontWeight: '900',
  },

  sectionLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 12,
  },

  photoArea: {
    height: 330,
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },

  selectedImage: {
    width: '100%',
    height: '100%',
  },

  camera: {
    color: '#8ECAFF',
    fontSize: 38,
    fontWeight: '300',
  },

  photoTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 10,
  },

  photoDescription: {
    color: '#596579',
    fontSize: 9,
    marginTop: 6,
  },

  changeButton: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },

  changeText: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  caption: {
    height: 120,
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 17,
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 20,
    padding: 16,
  },

  count: {
    color: '#4F5B6E',
    fontSize: 8,
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 25,
  },

  postButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 17,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.4,
  },

  postButtonText: {
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

  complete: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 50,
  },

  completeIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#8ECAFF',
    color: '#080B12',
    textAlign: 'center',
    lineHeight: 70,
    fontSize: 30,
    fontWeight: '900',
  },

  completeLabel: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 25,
  },

  completeTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 10,
    textAlign: 'center',
  },

  completeText: {
    color: '#687386',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 10,
  },

  completeImage: {
    width: 250,
    height: 310,
    borderRadius: 20,
    marginTop: 30,
  },

  homeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 28,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 28,
  },

  homeButtonText: {
    color: '#080B12',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});