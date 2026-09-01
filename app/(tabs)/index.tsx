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

  const [otherQuests, setOtherQuests] =
    useState<Quest[]>([]);

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
   * NEXT QUEST + OTHER QUESTS
   *
   * 今は同じadventure_typeから4件取得。
   * 1件目 = メイン
   * 2〜4件目 = OTHER QUESTS
   *
   * CLEAR後の自動切替と
   * SKIP 1日2回制限は後で実装。
   */
  useEffect(() => {
    const loadRecommendedQuests =
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

            setRecommendedQuest(null);
            setOtherQuests([]);
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

            setRecommendedQuest(null);
            setOtherQuests([]);
            return;
          }

          const adventureType =
            profile.adventure_type
              ?.trim()
              .toUpperCase();

          if (!adventureType) {
            setRecommendedQuest(null);
            setOtherQuests([]);
            return;
          }

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
              .limit(4);

          if (questError) {
            console.log(
              'HOME QUEST ERROR:',
              questError,
            );

            setRecommendedQuest(null);
            setOtherQuests([]);
            return;
          }

          const loadedQuests =
            (quests ?? []) as Quest[];

          setRecommendedQuest(
            loadedQuests.length > 0
              ? loadedQuests[0]
              : null,
          );

          setOtherQuests(
            loadedQuests.slice(1, 4),
          );
        } catch (error) {
          console.log(
            'RECOMMENDED QUEST ERROR:',
            error,
          );

          setRecommendedQuest(null);
          setOtherQuests([]);
        } finally {
          setIsLoadingQuest(false);
        }
      };

    loadRecommendedQuests();
  }, []);

  const openQuest = (quest: Quest) => {
    router.push({
      pathname: '/quest',
      params: {
        questId: quest.id,
      },
    });
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

        {/* YOUR NEXT QUEST */}

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
                YOUR NEXT QUEST
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
                    styles.questNumber
                  }
                >
                  {recommendedQuest.number}
                </Text>

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
                  {
                    recommendedQuest.description
                  }
                </Text>

                <View
                  style={
                    styles.questMetaRow
                  }
                >
                  <Text
                    style={
                      styles.questMeta
                    }
                  >
                    {recommendedQuest.difficulty ||
                      'QUEST'}
                  </Text>

                  <Text
                    style={
                      styles.questMeta
                    }
                  >
                    {recommendedQuest.estimated_time ||
                      'TIME —'}
                  </Text>
                </View>

                <Pressable
                  style={
                    styles.mainQuestButton
                  }
                  onPress={() =>
                    openQuest(
                      recommendedQuest,
                    )
                  }
                >
                  <Text
                    style={
                      styles.mainQuestButtonText
                    }
                  >
                    START QUEST →
                  </Text>
                </Pressable>

                <View
                  style={
                    styles.skipPreview
                  }
                >
                  <Text
                    style={
                      styles.skipPreviewText
                    }
                  >
                    SKIP
                  </Text>

                  <Text
                    style={
                      styles.skipCount
                    }
                  >
                    2 / DAY
                  </Text>
                </View>
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

        {/* OTHER QUESTS */}

        {!isLoadingQuest &&
          otherQuests.length > 0 && (
            <View
              style={
                styles.otherQuestSection
              }
            >
              <View
                style={
                  styles.sectionHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.smallLabel
                    }
                  >
                    MORE FOR YOU
                  </Text>

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    OTHER QUESTS
                  </Text>
                </View>

                <Text
                  style={
                    styles.sectionCount
                  }
                >
                  {otherQuests.length} QUESTS
                </Text>
              </View>

              {otherQuests.map(
                (quest) => (
                  <Pressable
                    key={quest.id}
                    style={
                      styles.otherQuestCard
                    }
                    onPress={() =>
                      openQuest(quest)
                    }
                  >
                    <View
                      style={
                        styles.otherQuestInfo
                      }
                    >
                      <View
                        style={
                          styles.otherQuestTop
                        }
                      >
                        <Text
                          style={
                            styles.otherQuestNumber
                          }
                        >
                          {quest.number}
                        </Text>

                        <Text
                          style={
                            styles.otherQuestTime
                          }
                        >
                          {quest.estimated_time ||
                            'TIME —'}
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.otherQuestTitle
                        }
                      >
                        {quest.title}
                      </Text>

                      <Text
                        style={
                          styles.otherQuestDescription
                        }
                        numberOfLines={2}
                      >
                        {quest.description}
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.otherQuestArrow
                      }
                    >
                      →
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
          )}

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

  sectionCount: {
    color: '#4F5B6E',
    fontSize: 8,
    fontWeight: '800',
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

  questNumber: {
    color: '#596579',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 15,
  },

  aiQuestTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '900',
    marginTop: 8,
  },

  aiQuestText: {
    color: '#697589',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 9,
  },

  questMetaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 15,
  },

  questMeta: {
    color: '#536075',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  mainQuestButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },

  mainQuestButtonText: {
    color: '#080B12',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  skipPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 15,
  },

  skipPreviewText: {
    color: '#596579',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  skipCount: {
    color: '#394456',
    fontSize: 7,
    fontWeight: '800',
  },

  otherQuestSection: {
    marginTop: 32,
  },

  otherQuestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  },

  otherQuestInfo: {
    flex: 1,
  },

  otherQuestTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  otherQuestNumber: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  otherQuestTime: {
    color: '#4F5B6E',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  otherQuestTitle: {
    color: '#DCE1E8',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: 8,
  },

  otherQuestDescription: {
    color: '#596579',
    fontSize: 9,
    lineHeight: 15,
    marginTop: 5,
  },

  otherQuestArrow: {
    color: '#8ECAFF',
    fontSize: 17,
    marginLeft: 13,
  },

  journeySection: {
    marginTop: 35,
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