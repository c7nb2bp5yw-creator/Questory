import {
  router,
  useFocusEffect,
} from 'expo-router';

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
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
  completed_at: string;
  quest: Quest;
};

export default function HomeScreen() {
  const [recommendedQuest, setRecommendedQuest] =
    useState<Quest | null>(null);

  const [isLoadingQuest, setIsLoadingQuest] =
    useState(true);

  const [journey, setJourney] =
    useState<Completion[]>([]);

  const [isLoadingJourney, setIsLoadingJourney] =
    useState(true);

  /*
   * YOUR JOURNEY
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
          'JOURNEY USER ERROR:',
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
          'id, quest_id, completed_at',
        )
        .eq('user_id', user.id)
        .order('completed_at', {
          ascending: false,
        });

      if (completionError) {
        console.log(
          'JOURNEY COMPLETION ERROR:',
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
          'id, number, title, description, difficulty, estimated_time, adventure_type',
        )
        .in('id', questIds);

      if (questsError) {
        console.log(
          'JOURNEY QUEST ERROR:',
          questsError,
        );

        setJourney([]);
        return;
      }

      const questMap = new Map(
        (quests ?? []).map((quest) => [
          quest.id,
          quest,
        ]),
      );

      const result = completions
        .map((completion) => {
          const quest = questMap.get(
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
        'JOURNEY ERROR:',
        error,
      );

      setJourney([]);
    } finally {
      setIsLoadingJourney(false);
    }
  }, []);

  /*
   * Homeに戻るたびにJourneyを更新
   */
  useFocusEffect(
    useCallback(() => {
      loadJourney();
    }, [loadJourney]),
  );

  /*
   * FOR YOU
   */
  useEffect(() => {
    const loadRecommendedQuest =
      async () => {
        setIsLoadingQuest(true);

        try {
          const {
            data: { user },
            error: userError,
          } =
            await supabase.auth.getUser();

          if (userError || !user) {
            console.log(
              'HOME USER ERROR:',
              userError,
            );

            return;
          }

          const {
            data: profile,
            error: profileError,
          } =
            await supabase
              .from('profiles')
              .select('adventure_type')
              .eq('id', user.id)
              .single();

          if (
            profileError ||
            !profile
          ) {
            console.log(
              'HOME PROFILE ERROR:',
              profileError,
            );

            return;
          }

          const adventureType =
            profile.adventure_type
              ?.trim()
              .toUpperCase();

          const {
            data: quests,
            error: questError,
          } =
            await supabase
              .from('quests')
              .select(
                'id, number, title, description, difficulty, estimated_time, adventure_type',
              )
              .eq(
                'adventure_type',
                adventureType,
              )
              .order('number', {
                ascending: false,
              })
              .limit(1);

          if (questError) {
            console.log(
              'HOME QUEST ERROR:',
              questError,
            );

            return;
          }

          setRecommendedQuest(
            quests &&
              quests.length > 0
              ? quests[0]
              : null,
          );
        } catch (error) {
          console.log(
            'RECOMMENDED QUEST ERROR:',
            error,
          );
        } finally {
          setIsLoadingQuest(false);
        }
      };

    loadRecommendedQuest();
  }, []);

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >

        {/* HEADER */}

        <View style={styles.header}>

          <View>
            <Text style={styles.logo}>
              QUESTORY
            </Text>

            <Text style={styles.sub}>
              YOUR ADVENTURE
            </Text>
          </View>

          <View
            style={styles.headerRight}
          >

            <Pressable
              style={
                styles.notificationButton
              }
              onPress={() =>
                router.push(
                  '/notifications',
                )
              }
            >
              <Text
                style={
                  styles.notificationIcon
                }
              >
                ♢
              </Text>
            </Pressable>

            <View
              style={styles.levelBox}
            >
              <Text
                style={styles.levelLabel}
              >
                LV
              </Text>

              <Text
                style={styles.levelNumber}
              >
                07
              </Text>
            </View>

          </View>
        </View>

        {/* GREETING */}

        <View style={styles.greeting}>

          <Text
            style={styles.greetingSmall}
          >
            GOOD AFTERNOON.
          </Text>

          <Text
            style={styles.greetingTitle}
          >
            今日も、{'\n'}
            少しだけ冒険しよう。
          </Text>

        </View>

        {/* FOR YOU */}

        <View
          style={styles.myQuestSection}
        >

          <View
            style={styles.sectionHeader}
          >

            <View>
              <Text
                style={styles.smallLabel}
              >
                FOR YOU
              </Text>

              <Text
                style={styles.sectionTitle}
              >
                あなたへのQUEST
              </Text>
            </View>

            <Text
              style={styles.aiLabel}
            >
              AI
            </Text>

          </View>

          <View
            style={styles.aiQuestCard}
          >

            <Text
              style={styles.aiQuestLabel}
            >
              RECOMMENDED FOR YOU
            </Text>

            {isLoadingQuest ? (
              <Text
                style={
                  styles.aiQuestTitle
                }
              >
                Questを探しています...
              </Text>
            ) : recommendedQuest ? (
              <>
                <Text
                  style={
                    styles.aiQuestTitle
                  }
                >
                  {recommendedQuest.title}
                </Text>

                <Text
                  style={
                    styles.aiQuestText
                  }
                >
                  あなたの冒険スタイルに合わせたQUEST。
                </Text>

                <Pressable
                  style={
                    styles.outlineButton
                  }
                  onPress={() =>
                    router.push(
                      '/quests',
                    )
                  }
                >
                  <Text
                    style={
                      styles.outlineButtonText
                    }
                  >
                    VIEW QUEST →
                  </Text>
                </Pressable>
              </>
            ) : (
              <Text
                style={
                  styles.aiQuestTitle
                }
              >
                まだQuestがありません。
              </Text>
            )}

          </View>

        </View>

        {/* YOUR JOURNEY */}

        <View
          style={styles.journeySection}
        >

          <View
            style={styles.sectionHeader}
          >

            <Text
              style={styles.sectionTitle}
            >
              YOUR JOURNEY
            </Text>

            <Text
              style={styles.sectionCount}
            >
              {journey.length} QUESTS
            </Text>

          </View>

          {isLoadingJourney ? (
            <View
              style={styles.journeyCard}
            >
              <View
                style={styles.journeyInfo}
              >
                <Text
                  style={styles.journeyTitle}
                >
                  JOURNEYを読み込んでいます...
                </Text>
              </View>
            </View>
          ) : journey.length === 0 ? (
            <View
              style={styles.journeyCard}
            >
              <View
                style={styles.journeyInfo}
              >
                <Text
                  style={styles.journeyTitle}
                >
                  まだCLEARがありません。
                </Text>

                <Text
                  style={styles.journeyDate}
                >
                  START YOUR FIRST ADVENTURE
                </Text>
              </View>
            </View>
          ) : (
            journey.map((item) => (
              <Pressable
                key={item.id}
                style={styles.journeyCard}
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
                    styles.journeyNumber
                  }
                >
                  <Text
                    style={
                      styles.journeyNumberText
                    }
                  >
                    {item.quest.number.replace(
                      '#',
                      '',
                    )}
                  </Text>
                </View>

                <View
                  style={styles.journeyInfo}
                >

                  <Text
                    style={
                      styles.journeyTitle
                    }
                  >
                    {item.quest.title}
                  </Text>

                  <Text
                    style={
                      styles.journeyDate
                    }
                  >
                    {new Date(
                      item.completed_at,
                    ).toLocaleDateString(
                      'ja-JP',
                    )}
                  </Text>

                </View>

                <Text
                  style={styles.arrow}
                >
                  →
                </Text>

              </Pressable>
            ))
          )}

        </View>

        {/* STREAK */}

        <View
          style={styles.streakCard}
        >

          <View>

            <Text
              style={styles.streakLabel}
            >
              ADVENTURE STREAK
            </Text>

            <Text
              style={styles.streakNumber}
            >
              7 DAYS
            </Text>

            <Text
              style={styles.streakText}
            >
              7日連続でQUEST CLEAR中
            </Text>

          </View>

          <Text
            style={styles.streakIcon}
          >
            ✦
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
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#293345',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationIcon: {
    color: '#8ECAFF',
    fontSize: 19,
  },

  levelBox: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  levelLabel: {
    color: '#596579',
    fontSize: 7,
    fontWeight: '900',
  },

  levelNumber: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  greeting: {
    marginTop: 55,
    marginBottom: 30,
  },

  greetingSmall: {
    color: '#687386',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },

  greetingTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 43,
    fontWeight: '900',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },

  smallLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 5,
  },

  myQuestSection: {
    marginTop: 0,
  },

  aiLabel: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  aiQuestCard: {
    backgroundColor: '#0E141E',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 22,
    padding: 20,
  },

  aiQuestLabel: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  aiQuestTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '900',
    marginTop: 11,
  },

  aiQuestText: {
    color: '#697589',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 9,
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: '#344054',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 16,
  },

  outlineButtonText: {
    color: '#DCE1E8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  journeySection: {
    marginTop: 35,
  },

  sectionCount: {
    color: '#4F5B6E',
    fontSize: 8,
    fontWeight: '800',
  },

  journeyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1B2330',
  },

  journeyNumber: {
    width: 46,
  },

  journeyNumberText: {
    color: '#536075',
    fontSize: 10,
    fontWeight: '800',
  },

  journeyInfo: {
    flex: 1,
  },

  journeyTitle: {
    color: '#DCE1E8',
    fontSize: 11,
    fontWeight: '700',
  },

  journeyDate: {
    color: '#4F5B6E',
    fontSize: 8,
    marginTop: 5,
  },

  arrow: {
    color: '#8ECAFF',
    fontSize: 15,
  },

  streakCard: {
    marginTop: 28,
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  streakLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  streakNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 5,
  },

  streakText: {
    color: '#596579',
    fontSize: 9,
    marginTop: 5,
  },

  streakIcon: {
    color: '#8ECAFF',
    fontSize: 30,
  },

});