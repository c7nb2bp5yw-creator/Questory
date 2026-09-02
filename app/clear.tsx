import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import React, {
  useEffect,
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
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

type QuestInfo = {
  number: string;
  title: string;
  description: string;
};

type Completion = {
  id: string;
  user_id: string;
  quest_id: string | null;
  generated_quest_id: string | null;
  caption: string | null;
  photo_url: string | null;
  completed_at: string;
  quest: QuestInfo | QuestInfo[] | null;
};

export default function ClearScreen() {
  const { completionId } =
    useLocalSearchParams<{
      completionId?: string;
    }>();

  const [completion, setCompletion] =
    useState<Completion | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  useEffect(() => {
    const loadCompletion = async () => {
      if (!completionId) {
        setLoading(false);
        return;
      }

      /*
       * ログイン確認
       */
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log(
          'CLEAR AUTH ERROR:',
          authError,
        );

        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      /*
       * CLEAR詳細取得
       *
       * 自分のCLEARだけではなく、
       * 他ユーザーの公開CLEARも
       * completionIdから取得する。
       *
       * user_idも取得して、
       * 本人のCLEARだけDELETEを表示する。
       */
      const { data, error } =
        await supabase
          .from('quest_completions')
          .select(
            `
              id,
              user_id,
              quest_id,
              generated_quest_id,
              caption,
              photo_url,
              completed_at,
              quest:quests (
                number,
                title,
                description
              )
            `,
          )
          .eq('id', completionId)
          .single();

      if (
        !error &&
        data &&
        !data.quest &&
        data.generated_quest_id
      ) {
        const {
          data: generatedQuest,
          error: generatedQuestError,
        } = await supabase
          .from('generated_quests')
          .select(
            'title, description',
          )
          .eq(
            'id',
            data.generated_quest_id,
          )
          .maybeSingle();

        if (generatedQuestError) {
          console.log(
            'CLEAR GENERATED QUEST ERROR:',
            generatedQuestError,
          );
        }

        if (generatedQuest) {
          data.quest = [
            {
              number: 'AI QUEST',
              title: generatedQuest.title,
              description:
                generatedQuest.description,
            },
          ];
        }
      }

      console.log(
        'CLEAR DETAIL:',
        data,
      );

      console.log(
        'CLEAR DETAIL ERROR:',
        error,
      );

      if (!error && data) {
        setCompletion(
          data as unknown as Completion,
        );
      }

      setLoading(false);
    };

    loadCompletion();
  }, [completionId]);

  const getQuest = () => {
    if (!completion) {
      return null;
    }

    if (Array.isArray(completion.quest)) {
      return completion.quest[0] ?? null;
    }

    return completion.quest;
  };

  /*
   * CLEAR RECORD DELETE
   *
   * 削除するのはquest_completionsだけ。
   * QUEST本体やfixed_quest_progressは変更しない。
   */
  const deleteCompletion = () => {
    if (
      !completion ||
      !currentUserId ||
      completion.user_id !== currentUserId ||
      isDeleting
    ) {
      return;
    }

    Alert.alert(
      'QUESTの記録を削除しますか？',
      '写真やMEMORYを含むこのCLEAR記録が削除されます。この操作は元に戻せません。',
      [
        {
          text: '戻る',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);

            try {
              const { error } =
                await supabase
                  .from('quest_completions')
                  .delete()
                  .eq('id', completion.id)
                  .eq(
                    'user_id',
                    currentUserId,
                  );

              if (error) {
                console.log(
                  'DELETE CLEAR ERROR:',
                  error,
                );

                Alert.alert(
                  '削除できませんでした',
                  '時間をおいてもう一度お試しください。',
                );

                return;
              }

              router.back();
            } catch (error) {
              console.log(
                'DELETE CLEAR ACTION ERROR:',
                error,
              );

              Alert.alert(
                'エラー',
                '削除できませんでした。',
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View style={styles.center}>
          <Text
            style={styles.loadingText}
          >
            LOADING...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!completion) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View style={styles.center}>
          <Text
            style={styles.errorTitle}
          >
            CLEAR NOT FOUND
          </Text>

          <Pressable
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.backButtonText
              }
            >
              BACK
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const quest = getQuest();

  if (!quest) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View style={styles.center}>
          <Text
            style={styles.errorTitle}
          >
            QUEST NOT FOUND
          </Text>

          <Pressable
            style={styles.backButton}
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.backButtonText
              }
            >
              BACK
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(
    completion.completed_at,
  ).toLocaleDateString('ja-JP');

  const isOwnCompletion =
    currentUserId === completion.user_id;

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
          style={styles.backTop}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={styles.backTopText}
          >
            ← BACK
          </Text>
        </Pressable>

        <Text style={styles.logo}>
          QUESTORY
        </Text>

        <Text style={styles.sub}>
          CLEAR RECORD
        </Text>

        <View style={styles.hero}>
          <Text
            style={styles.clearIcon}
          >
            ✓
          </Text>

          <Text
            style={styles.clearLabel}
          >
            QUEST CLEAR
          </Text>

          <Text style={styles.title}>
            冒険の記録。
          </Text>
        </View>

        <View
          style={styles.questCard}
        >
          <Text
            style={styles.questNumber}
          >
            {quest.number}
          </Text>

          <Text
            style={styles.questTitle}
          >
            {quest.title}
          </Text>

          <Text
            style={
              styles.questDescription
            }
          >
            {quest.description}
          </Text>
        </View>

        {completion.photo_url && (
          <View
            style={styles.photoCard}
          >
            <Text
              style={styles.sectionLabel}
            >
              CLEAR PHOTO
            </Text>

            <Image
              source={{
                uri: completion.photo_url,
              }}
              style={styles.photo}
            />
          </View>
        )}

        <View
          style={styles.memoryCard}
        >
          <Text
            style={styles.sectionLabel}
          >
            MEMORY
          </Text>

          <Text
            style={
              completion.caption
                ? styles.memoryText
                : styles.emptyMemory
            }
          >
            {completion.caption ||
              'MEMORYは残されていません。'}
          </Text>
        </View>

        <View style={styles.dateCard}>
          <Text
            style={styles.dateLabel}
          >
            CLEARED ON
          </Text>

          <Text
            style={styles.dateText}
          >
            {date}
          </Text>
        </View>

        {isOwnCompletion && (
          <Pressable
            style={[
              styles.deleteButton,
              isDeleting && {
                opacity: 0.4,
              },
            ]}
            onPress={deleteCompletion}
            disabled={isDeleting}
          >
            <Text
              style={
                styles.deleteButtonText
              }
            >
              {isDeleting
                ? 'DELETING...'
                : 'DELETE QUEST'}
            </Text>
          </Pressable>
        )}

        <View style={styles.footer}>
          <Text
            style={styles.footerText}
          >
            YOUR ADVENTURE. YOUR STORY.
          </Text>
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
    paddingTop: 18,
    paddingBottom: 100,
  },

  center: {
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

  errorTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 45,
    paddingVertical: 16,
    marginTop: 22,
  },

  backButtonText: {
    color: '#080B12',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  backTop: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },

  backTopText: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
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

  hero: {
    alignItems: 'center',
    marginTop: 45,
    marginBottom: 30,
  },

  clearIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#8ECAFF',
    color: '#080B12',
    textAlign: 'center',
    lineHeight: 64,
    fontSize: 28,
    fontWeight: '900',
  },

  clearLabel: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 20,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 9,
    textAlign: 'center',
  },

  questCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
  },

  questNumber: {
    color: '#8ECAFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  questTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    lineHeight: 29,
    fontWeight: '900',
    marginTop: 9,
  },

  questDescription: {
    color: '#687386',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 12,
  },

  photoCard: {
    marginBottom: 24,
  },

  sectionLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 12,
  },

  photo: {
    width: '100%',
    height: 390,
    borderRadius: 22,
  },

  memoryCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 20,
    padding: 19,
    marginBottom: 18,
  },

  memoryText: {
    color: '#DCE1E8',
    fontSize: 12,
    lineHeight: 20,
  },

  emptyMemory: {
    color: '#596579',
    fontSize: 11,
  },

  dateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1B2330',
    paddingVertical: 16,
  },

  dateLabel: {
    color: '#536075',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  dateText: {
    color: '#DCE1E8',
    fontSize: 10,
    fontWeight: '800',
  },

  deleteButton: {
    alignSelf: 'center',
    marginTop: 30,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#5A3038',
    borderRadius: 12,
  },

  deleteButtonText: {
    color: '#A95C68',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
  },

  footer: {
    alignItems: 'center',
    marginTop: 35,
  },

  footerText: {
    color: '#354052',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});