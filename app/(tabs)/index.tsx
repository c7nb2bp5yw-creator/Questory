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
  Alert,
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

type CoOpQuest = {
  collaborationId: string;
  ownerId: string;
  ownerName: string;
  ownerUsername: string | null;
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

  const [coOpQuests, setCoOpQuests] =
    useState<CoOpQuest[]>([]);

  const [isLoadingCoOp, setIsLoadingCoOp] =
    useState(true);

  const [hasUnreadNotifications, setHasUnreadNotifications] =
    useState(false);

  const [skipRemaining, setSkipRemaining] =
    useState(2);

  const [isSkipping, setIsSkipping] =
    useState(false);

  /*
   * SKIP COUNT
   */
  const loadTodaySkipCount = useCallback(async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setSkipRemaining(2);
        return;
      }

      const now = new Date();

      const jstNow = new Date(
        now.getTime() + 9 * 60 * 60 * 1000,
      );

      const year = jstNow.getUTCFullYear();
      const month = String(
        jstNow.getUTCMonth() + 1,
      ).padStart(2, '0');
      const day = String(
        jstNow.getUTCDate(),
      ).padStart(2, '0');

      const startJst = new Date(
        `${year}-${month}-${day}T00:00:00+09:00`,
      );

      const endJst = new Date(
        startJst.getTime() +
          24 * 60 * 60 * 1000,
      );

      const {
        count,
        error,
      } = await supabase
        .from('quest_actions')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('user_id', user.id)
        .eq('action', 'skip')
        .gte(
          'created_at',
          startJst.toISOString(),
        )
        .lt(
          'created_at',
          endJst.toISOString(),
        );

      if (error) {
        console.log(
          'SKIP COUNT ERROR:',
          error,
        );
        return;
      }

      setSkipRemaining(
        Math.max(2 - (count ?? 0), 0),
      );
    } catch (error) {
      console.log(
        'LOAD SKIP COUNT ERROR:',
        error,
      );
    }
  }, []);

  /*
   * NOTIFICATIONS
   */
  const loadUnreadNotifications = useCallback(async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setHasUnreadNotifications(false);
        return;
      }

      const {
        count,
        error,
      } = await supabase
        .from('notifications')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.log(
          'UNREAD NOTIFICATIONS ERROR:',
          error,
        );

        setHasUnreadNotifications(false);
        return;
      }

      setHasUnreadNotifications(
        (count ?? 0) > 0,
      );
    } catch (error) {
      console.log(
        'LOAD UNREAD NOTIFICATIONS ERROR:',
        error,
      );

      setHasUnreadNotifications(false);
    }
  }, []);

  /*
   * CO-OP QUESTS
   */
  const loadCoOpQuests = useCallback(async () => {
    setIsLoadingCoOp(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log(
          'CO-OP USER ERROR:',
          userError,
        );

        setCoOpQuests([]);
        return;
      }

      const {
        data: collaborations,
        error: collaborationError,
      } = await supabase
        .from('quest_collaborations')
        .select(
          'id, owner_id, quest_id',
        )
        .eq('collaborator_id', user.id)
        .not('quest_id', 'is', null)
        .order('created_at', {
          ascending: false,
        });

      if (collaborationError) {
        console.log(
          'HOME CO-OP ERROR:',
          collaborationError,
        );

        setCoOpQuests([]);
        return;
      }

      if (
        !collaborations ||
        collaborations.length === 0
      ) {
        setCoOpQuests([]);
        return;
      }

      const ownerIds = [
        ...new Set(
          collaborations.map(
            (item) => item.owner_id,
          ),
        ),
      ];

      const questIds = [
        ...new Set(
          collaborations
            .map((item) => item.quest_id)
            .filter(
              (questId): questId is string =>
                !!questId,
            ),
        ),
      ];

      const [
        profileResult,
        questResult,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, name, username')
          .in('id', ownerIds),

        supabase
          .from('quests')
          .select(
            'id, number, title, description, difficulty, estimated_time, adventure_type',
          )
          .in('id', questIds),
      ]);

      if (profileResult.error) {
        console.log(
          'CO-OP PROFILE ERROR:',
          profileResult.error,
        );
      }

      if (questResult.error) {
        console.log(
          'CO-OP QUEST ERROR:',
          questResult.error,
        );
      }

      if (
        profileResult.error ||
        questResult.error
      ) {
        setCoOpQuests([]);
        return;
      }

      const profileMap = new Map(
        (profileResult.data ?? []).map(
          (profile) => [
            profile.id,
            profile,
          ],
        ),
      );

      const questMap = new Map(
        (questResult.data ?? []).map(
          (quest) => [
            quest.id,
            quest as Quest,
          ],
        ),
      );

      const result = collaborations
        .map((item) => {
          if (!item.quest_id) {
            return null;
          }

          const owner = profileMap.get(
            item.owner_id,
          );

          const quest = questMap.get(
            item.quest_id,
          );

          if (!owner || !quest) {
            return null;
          }

          return {
            collaborationId: item.id,
            ownerId: item.owner_id,
            ownerName:
              owner.name ||
              owner.username ||
              'ADVENTURER',
            ownerUsername:
              owner.username,
            quest,
          };
        })
        .filter(
          (
            item,
          ): item is CoOpQuest =>
            item !== null,
        );

      setCoOpQuests(result);
    } catch (error) {
      console.log(
        'LOAD CO-OP ERROR:',
        error,
      );

      setCoOpQuests([]);
    } finally {
      setIsLoadingCoOp(false);
    }
  }, []);

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
          'id, quest_id, generated_quest_id, completed_at',
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
                'id, number, title, description, difficulty, estimated_time, adventure_type',
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
                'id, title, description, difficulty, estimated_time, category',
              )
              .in('id', generatedQuestIds)
          : Promise.resolve({
              data: [],
              error: null,
            }),
      ]);

      if (fixedQuestsResult.error) {
        console.log(
          'JOURNEY FIXED QUEST ERROR:',
          fixedQuestsResult.error,
        );
      }

      if (generatedQuestsResult.error) {
        console.log(
          'JOURNEY GENERATED QUEST ERROR:',
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
        'JOURNEY ERROR:',
        error,
      );

      setJourney([]);
    } finally {
      setIsLoadingJourney(false);
    }
  }, []);

  /*
   * NEXT QUEST + OTHER QUESTS
   *
   * NEXT QUEST
   * → 自分のadventure_typeに合うQuestを1件
   *
   * OTHER QUESTS
   * → NEXT QUEST以外のQuestから3件
   *
   * CLEAR後の自動切替と
   * SKIP 1日2回制限は後で実装。
   */
  const loadRecommendedQuests =
    useCallback(async () => {
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

          /*
           * ユーザーのadventure_type取得
           */
          const {
            data: profile,
            error: profileError,
          } =
            await supabase
              .from('profiles')
              .select('adventure_type, fixed_quest_progress')
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

          /*
           * NEXT QUEST
           *
           * 固定20QUESTまではquestsから取得。
           * 20QUEST終了後はAI QUESTを取得 / 生成する。
           */
          let mainQuest: Quest | null = null;

          if (
            (profile.fixed_quest_progress ?? 0) >= 20
          ) {
            const {
              data: generatedResult,
              error: generatedError,
            } = await supabase.functions.invoke(
              'generate-quest',
            );

            if (generatedError) {
              console.log(
                'AI QUEST GENERATE ERROR:',
                generatedError,
              );

              setRecommendedQuest(null);
            } else {
              const generatedQuest =
                generatedResult?.quest;

              if (generatedQuest) {
                mainQuest = {
                  id: generatedQuest.id,
                  number: 'AI QUEST',
                  title: generatedQuest.title,
                  description:
                    generatedQuest.description,
                  difficulty:
                    generatedQuest.difficulty,
                  estimated_time:
                    generatedQuest.estimated_time,
                  adventure_type:
                    generatedQuest.category ??
                    adventureType,
                };
              }

              setRecommendedQuest(mainQuest);
            }
          } else {
            const {
              data: recommendedData,
              error: recommendedError,
            } = await supabase
              .from('quests')
              .select(
                'id, number, title, description, difficulty, estimated_time, adventure_type',
              )
              .eq(
                'adventure_type',
                adventureType,
              )
              .eq(
                'sequence',
                (profile.fixed_quest_progress ?? 0) + 1,
              )
              .maybeSingle();

            if (recommendedError) {
              console.log(
                'HOME RECOMMENDED QUEST ERROR:',
                recommendedError,
              );

              setRecommendedQuest(null);
              setOtherQuests([]);
              return;
            }

            mainQuest =
              recommendedData as Quest | null;

            setRecommendedQuest(mainQuest);
          }

          /*
           * NEXT QUEST以外から
           * OTHER QUESTSを3件取得
           */
          const {
            data: otherQuestCandidates,
            error: otherQuestError,
          } = await supabase
            .from('quests')
            .select(
              'id, number, title, description, difficulty, estimated_time, adventure_type, sequence',
            )
            .order('number', {
              ascending: false,
            });

          const otherQuestData =
            (otherQuestCandidates ?? [])
              .filter((quest) => {
                if (
                  mainQuest &&
                  quest.id === mainQuest.id
                ) {
                  return false;
                }

                const questAdventureType =
                  quest.adventure_type
                    ?.trim()
                    .toUpperCase();

                const isOwnFixedQuest =
                  questAdventureType === adventureType &&
                  quest.sequence !== null;

                return !isOwnFixedQuest;
              })
              .slice(0, 3);

          if (otherQuestError) {
            console.log(
              'HOME OTHER QUEST ERROR:',
              otherQuestError,
            );

            setOtherQuests([]);
            return;
          }

          setOtherQuests(
            (otherQuestData ?? []) as Quest[],
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
    }, []);

  /*
   * Homeに戻るたびに最新データを更新
   */
  useFocusEffect(
    useCallback(() => {
      loadJourney();
      loadCoOpQuests();
      loadUnreadNotifications();
      loadRecommendedQuests();
      loadTodaySkipCount();
    }, [
      loadJourney,
      loadCoOpQuests,
      loadUnreadNotifications,
      loadRecommendedQuests,
      loadTodaySkipCount,
    ]),
  );

  const openQuest = (
    quest: Quest,
    questMode: 'main' | 'other' | 'coop',
    collaborationId?: string,
  ) => {
    router.push({
      pathname: '/quest',
      params: {
        questId: quest.id,
        questMode,
        ...(collaborationId
          ? { collaborationId }
          : {}),
      },
    });
  };

  /*
   * MAIN QUEST SKIP
   */
  const skipMainQuest = () => {
    if (
      !recommendedQuest ||
      isSkipping
    ) {
      return;
    }

    if (skipRemaining <= 0) {
      Alert.alert(
        '本日のSKIPは終了です',
        'SKIPは1日2回までです。',
      );
      return;
    }

    Alert.alert(
      'このQUESTをSKIPしますか？',
      `今日あと${skipRemaining}回SKIPできます。`,
      [
        {
          text: '戻る',
          style: 'cancel',
        },
        {
          text: 'SKIP',
          onPress: async () => {
            setIsSkipping(true);

            try {
              const {
                data,
                error,
              } = await supabase.rpc(
                'skip_fixed_main_quest',
                {
                  p_quest_id:
                    recommendedQuest.id,
                },
              );

              if (error) {
                console.log(
                  'SKIP QUEST ERROR:',
                  error,
                );

                Alert.alert(
                  'SKIPできませんでした',
                  error.message ||
                    '時間をおいてもう一度お試しください。',
                );

                await loadTodaySkipCount();
                await loadRecommendedQuests();
                return;
              }

              const result =
                data as {
                  skips_remaining_today?: number;
                } | null;

              if (
                typeof result?.skips_remaining_today ===
                'number'
              ) {
                setSkipRemaining(
                  result.skips_remaining_today,
                );
              }

              await Promise.all([
                loadRecommendedQuests(),
                loadTodaySkipCount(),
              ]);
            } catch (error) {
              console.log(
                'SKIP ACTION ERROR:',
                error,
              );

              Alert.alert(
                'エラー',
                'SKIPできませんでした。',
              );
            } finally {
              setIsSkipping(false);
            }
          },
        },
      ],
    );
  };

  /*
   * CO-OP CANCEL
   */
  const cancelCoOp = (
    collaborationId: string,
  ) => {
    Alert.alert(
      'CO-OPをキャンセルしますか？',
      'このQUESTへの協力を終了します。',
      [
        {
          text: '戻る',
          style: 'cancel',
        },
        {
          text: 'CANCEL',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } =
                await supabase
                  .from(
                    'quest_collaborations',
                  )
                  .delete()
                  .eq(
                    'id',
                    collaborationId,
                  );

              if (error) {
                console.log(
                  'CO-OP CANCEL ERROR:',
                  error,
                );

                Alert.alert(
                  'エラー',
                  'CO-OPをキャンセルできませんでした。',
                );

                return;
              }

              setCoOpQuests(
                (current) =>
                  current.filter(
                    (item) =>
                      item.collaborationId !==
                      collaborationId,
                  ),
              );
            } catch (error) {
              console.log(
                'CO-OP CANCEL ACTION ERROR:',
                error,
              );

              Alert.alert(
                'エラー',
                'CO-OPをキャンセルできませんでした。',
              );
            }
          },
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
              <View
                style={
                  styles.notificationBell
                }
              >
                <View
                  style={
                    styles.notificationBellBody
                  }
                />

                <View
                  style={
                    styles.notificationBellClapper
                  }
                />

                {hasUnreadNotifications && (
                  <View
                    style={
                      styles.notificationUnreadDot
                    }
                  />
                )}
              </View>
            </Pressable>

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
                      'main',
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

                <Pressable
                  style={[
                    styles.skipPreview,
                    (skipRemaining <= 0 ||
                      isSkipping) && {
                      opacity: 0.35,
                    },
                  ]}
                  onPress={skipMainQuest}
                  disabled={isSkipping}
                >
                  <Text
                    style={
                      styles.skipPreviewText
                    }
                  >
                    {isSkipping
                      ? 'SKIPPING...'
                      : 'SKIP'}
                  </Text>

                  <Text
                    style={
                      styles.skipCount
                    }
                  >
                    {skipRemaining} / DAY
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

        {/* CO-OP QUESTS */}

        {!isLoadingCoOp &&
          coOpQuests.length > 0 && (
            <View
              style={styles.coOpSection}
            >
              <View
                style={styles.sectionHeader}
              >
                <View>
                  <Text
                    style={styles.smallLabel}
                  >
                    TOGETHER
                  </Text>

                  <Text
                    style={styles.sectionTitle}
                  >
                    CO-OP QUESTS
                  </Text>
                </View>

                <Text
                  style={styles.sectionCount}
                >
                  {coOpQuests.length} QUESTS
                </Text>
              </View>

              {coOpQuests.map((item) => (
                <View
                  key={item.collaborationId}
                  style={styles.coOpCard}
                >
                  <Text
                    style={styles.coOpPartner}
                  >
                    {item.ownerName}とのQUEST
                  </Text>

                  <Text
                    style={styles.coOpNumber}
                  >
                    {item.quest.number}
                  </Text>

                  <Text
                    style={styles.coOpTitle}
                  >
                    {item.quest.title}
                  </Text>

                  <Text
                    style={styles.coOpDescription}
                    numberOfLines={2}
                  >
                    {item.quest.description}
                  </Text>

                  <View
                    style={styles.coOpActions}
                  >
                    <Pressable
                      style={styles.coOpStartButton}
                      onPress={() =>
                        openQuest(
                          item.quest,
                          'coop',
                          item.collaborationId,
                        )
                      }
                    >
                      <Text
                        style={
                          styles.coOpStartButtonText
                        }
                      >
                        START →
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        cancelCoOp(
                          item.collaborationId,
                        )
                      }
                    >
                      <Text
                        style={
                          styles.coOpCancelPreview
                        }
                      >
                        CANCEL
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

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
                      openQuest(
                        quest,
                        'other',
                      )
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
    color: '#FFFFFF',
    fontSize: 19,
  },

  notificationBell: {
    width: 22,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationBellBody: {
    width: 14,
    height: 15,
    borderWidth: 1.8,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },

  notificationBellClapper: {
    width: 4,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },

  notificationUnreadDot: {
    position: 'absolute',
    top: 1,
    right: 0,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#8ECAFF',
    borderWidth: 1,
    borderColor: '#080B12',
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
    alignSelf: 'center',
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 12,
  },

  skipPreviewText: {
    color: '#7C899D',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  skipCount: {
    color: '#596579',
    fontSize: 9,
    fontWeight: '800',
  },

  coOpSection: {
    marginTop: 32,
  },

  coOpCard: {
    backgroundColor: '#0E141E',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 20,
    padding: 18,
    marginBottom: 10,
  },

  coOpPartner: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  coOpNumber: {
    color: '#596579',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 14,
  },

  coOpTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
    marginTop: 6,
  },

  coOpDescription: {
    color: '#697589',
    fontSize: 10,
    lineHeight: 17,
    marginTop: 7,
  },

  coOpActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },

  coOpStartButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingVertical: 12,
    alignItems: 'center',
  },

  coOpStartButtonText: {
    color: '#080B12',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  coOpCancelPreview: {
    color: '#596579',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    paddingVertical: 12,
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

});