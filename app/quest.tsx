import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
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

export default function QuestScreen() {
  const {
    id,
    questId,
    questMode,
    collaborationId,
  } =
    useLocalSearchParams<{
      id?: string;
      questId?: string;
      questMode?: 'main' | 'other' | 'coop';
      collaborationId?: string;
    }>();

  const targetQuestId = questId ?? id;

  const [quest, setQuest] =
    useState<Quest | null>(null);

  const [started, setStarted] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const loadQuest = async () => {
      if (!targetQuestId) {
        Alert.alert(
          'エラー',
          'Questの情報が見つかりませんでした。',
        );

        setIsLoading(false);
        return;
      }

      /*
       * AI CO-OP QUEST
       *
       * 他人のgenerated_questsは直接SELECTせず、
       * collaborationIdを使って専用RPCから取得する。
       */
      if (questMode === 'coop') {
        if (!collaborationId) {
          Alert.alert(
            'エラー',
            'CO-OP QUESTの情報が見つかりませんでした。',
          );

          setIsLoading(false);
          return;
        }

        const {
          data: coopQuestData,
          error: coopQuestError,
        } = await supabase.rpc(
          'get_my_generated_coop_quest',
          {
            p_collaboration_id:
              collaborationId,
          },
        );

        if (coopQuestError) {
          console.log(
            'DETAIL AI CO-OP QUEST ERROR:',
            coopQuestError,
          );
        }

        const coopQuest =
          Array.isArray(coopQuestData) &&
          coopQuestData.length > 0
            ? coopQuestData[0]
            : null;

        if (
          coopQuestError ||
          !coopQuest ||
          coopQuest.generated_quest_id !==
            targetQuestId
        ) {
          Alert.alert(
            'エラー',
            'CO-OP QUESTを読み込めませんでした。',
          );

          setIsLoading(false);
          return;
        }

        setQuest({
          id: coopQuest.generated_quest_id,
          number: 'AI QUEST',
          title: coopQuest.title,
          description: coopQuest.description,
          difficulty:
            coopQuest.difficulty ?? '',
          estimated_time:
            coopQuest.estimated_time ?? '',
          adventure_type:
            coopQuest.category ?? '',
        });

        setIsLoading(false);
        return;
      }

      /*
       * 通常の固定QUEST
       */
      const {
        data: fixedQuest,
        error: fixedError,
      } = await supabase
        .from('quests')
        .select(
          'id, number, title, description, difficulty, estimated_time, adventure_type',
        )
        .eq('id', targetQuestId)
        .maybeSingle();

      if (fixedQuest) {
        console.log(
          'DETAIL FIXED QUEST:',
          fixedQuest,
        );

        setQuest(fixedQuest);
        setIsLoading(false);
        return;
      }

      if (fixedError) {
        console.log(
          'DETAIL FIXED QUEST ERROR:',
          fixedError,
        );
      }

      /*
       * 自分のAI QUEST
       */
      const {
        data: generatedQuest,
        error: generatedError,
      } = await supabase
        .from('generated_quests')
        .select(
          'id, title, description, difficulty, estimated_time, category',
        )
        .eq('id', targetQuestId)
        .maybeSingle();

      console.log(
        'DETAIL AI QUEST:',
        generatedQuest,
      );

      console.log(
        'DETAIL AI QUEST ERROR:',
        generatedError,
      );

      if (
        generatedError ||
        !generatedQuest
      ) {
        Alert.alert(
          'エラー',
          'Questを読み込めませんでした。',
        );

        setIsLoading(false);
        return;
      }

      setQuest({
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
          generatedQuest.category,
      });

      setIsLoading(false);
    };

    loadQuest();
  }, [
    targetQuestId,
    questMode,
    collaborationId,
  ]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <Text
            style={styles.loadingText}
          >
            LOADING QUEST...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!quest) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <Text
            style={styles.emptyTitle}
          >
            QUEST NOT FOUND
          </Text>

          <Pressable
            style={
              styles.backHomeButton
            }
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={styles.backHomeText}
            >
              BACK
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
          onPress={() => router.back()}
        >
          <Text
            style={styles.backText}
          >
            ← BACK
          </Text>
        </Pressable>

        <Text style={styles.logo}>
          POSEQ
        </Text>

        <Text style={styles.sub}>
          QUEST DETAIL
        </Text>

        <View style={styles.hero}>

          <Text
            style={styles.questNumber}
          >
            {quest.number}
          </Text>

          <Text style={styles.title}>
            {quest.title}
          </Text>

          <Text
            style={styles.description}
          >
            {quest.description}
          </Text>

        </View>

        <View
          style={styles.metaCard}
        >

          <View
            style={styles.metaItem}
          >
            <Text
              style={styles.metaLabel}
            >
              DIFFICULTY
            </Text>

            <Text
              style={styles.metaValue}
            >
              {quest.difficulty}
            </Text>
          </View>

          <View
            style={styles.verticalLine}
          />

          <View
            style={styles.metaItem}
          >
            <Text
              style={styles.metaLabel}
            >
              TIME
            </Text>

            <Text
              style={styles.metaValue}
            >
              {quest.estimated_time}
            </Text>
          </View>

          <View
            style={styles.verticalLine}
          />

          <View
            style={styles.metaItem}
          >
            <Text
              style={styles.metaLabel}
            >
              TYPE
            </Text>

            <Text
              style={styles.metaValue}
            >
              {quest.adventure_type}
            </Text>
          </View>

        </View>

        <Text
          style={styles.sectionLabel}
        >
          HOW TO CLEAR
        </Text>

        <View
          style={styles.stepCard}
        >

          <View style={styles.step}>

            <View
              style={styles.stepNumber}
            >
              <Text
                style={
                  styles.stepNumberText
                }
              >
                01
              </Text>
            </View>

            <View
              style={styles.stepContent}
            >
              <Text
                style={styles.stepTitle}
              >
                QUESTに挑戦する
              </Text>

              <Text
                style={styles.stepText}
              >
                今日のQuestを実際にやってみよう。
                自分のペースで楽しんでください。
              </Text>
            </View>

          </View>

          <View
            style={styles.stepLine}
          />

          <View style={styles.step}>

            <View
              style={styles.stepNumber}
            >
              <Text
                style={
                  styles.stepNumberText
                }
              >
                02
              </Text>
            </View>

            <View
              style={styles.stepContent}
            >
              <Text
                style={styles.stepTitle}
              >
                冒険を楽しむ
              </Text>

              <Text
                style={styles.stepText}
              >
                普段とは少し違うことをしてみよう。
                何をするかはあなた次第。
              </Text>
            </View>

          </View>

          <View
            style={styles.stepLine}
          />

          <View style={styles.step}>

            <View
              style={styles.stepNumber}
            >
              <Text
                style={
                  styles.stepNumberText
                }
              >
                03
              </Text>
            </View>

            <View
              style={styles.stepContent}
            >
              <Text
                style={styles.stepTitle}
              >
                写真を撮る
              </Text>

              <Text
                style={styles.stepText}
              >
                冒険の証として、思い出の写真を
                1枚残してください。
              </Text>
            </View>

          </View>

        </View>

        <View
          style={styles.warningCard}
        >

          <Text
            style={styles.warningIcon}
          >
            !
          </Text>

          <View
            style={styles.warningContent}
          >

            <Text
              style={styles.warningTitle}
            >
              SAFETY FIRST
            </Text>

            <Text
              style={styles.warningText}
            >
              危険な場所には行かず、
              自分の安全を最優先してください。
            </Text>

          </View>

        </View>

        {!started ? (

          <Pressable
            style={styles.startButton}
            onPress={() =>
              setStarted(true)
            }
          >
            <Text
              style={
                styles.startButtonText
              }
            >
              START QUEST
            </Text>
          </Pressable>

        ) : (

          <View
            style={styles.startedArea}
          >

            <View
              style={styles.startedCard}
            >

              <View
                style={styles.startedDot}
              />

              <View>

                <Text
                  style={
                    styles.startedTitle
                  }
                >
                  QUEST IN PROGRESS
                </Text>

                <Text
                  style={
                    styles.startedText
                  }
                >
                  あなたの冒険が始まりました。
                </Text>

              </View>

            </View>

            <Pressable
              style={styles.clearButton}
              onPress={() =>
                router.push({
                  pathname: '/post',
                  params: {
                    questId: quest.id,
                    ...(questMode
                      ? { questMode }
                      : {}),
                    ...(collaborationId
                      ? { collaborationId }
                      : {}),
                  },
                })
              }
            >
              <Text
                style={
                  styles.clearButtonText
                }
              >
                CLEAR QUEST
              </Text>
            </Pressable>

          </View>

        )}

        <Text
          style={styles.footer}
        >
          YOUR ADVENTURE. YOUR STORY.
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
    paddingTop: 18,
    paddingBottom: 100,
  },

  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },

  backText: {
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
    marginTop: 50,
  },

  questNumber: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 31,
    lineHeight: 41,
    fontWeight: '900',
    marginTop: 12,
  },

  description: {
    color: '#7B8799',
    fontSize: 12,
    lineHeight: 20,
    marginTop: 17,
  },

  metaCard: {
    flexDirection: 'row',
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 20,
    paddingVertical: 19,
    marginTop: 28,
    marginBottom: 35,
  },

  metaItem: {
    flex: 1,
    alignItems: 'center',
  },

  metaLabel: {
    color: '#536075',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },

  metaValue: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 7,
  },

  verticalLine: {
    width: 1,
    backgroundColor: '#293345',
  },

  sectionLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 12,
  },

  stepCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 21,
    padding: 18,
    marginBottom: 18,
  },

  step: {
    flexDirection: 'row',
  },

  stepNumber: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#192130',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepNumberText: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
  },

  stepContent: {
    flex: 1,
    marginLeft: 13,
  },

  stepTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  stepText: {
    color: '#687386',
    fontSize: 10,
    lineHeight: 17,
    marginTop: 5,
  },

  stepLine: {
    height: 1,
    backgroundColor: '#202838',
    marginVertical: 16,
    marginLeft: 19,
  },

  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#10151E',
    borderWidth: 1,
    borderColor: '#2C3441',
    borderRadius: 17,
    padding: 16,
    marginBottom: 22,
  },

  warningIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#293345',
    color: '#8ECAFF',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '900',
  },

  warningContent: {
    flex: 1,
    marginLeft: 11,
  },

  warningTitle: {
    color: '#DCE1E8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  warningText: {
    color: '#687386',
    fontSize: 9,
    lineHeight: 15,
    marginTop: 4,
  },

  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 18,
    alignItems: 'center',
  },

  startButtonText: {
    color: '#080B12',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  startedArea: {
    marginTop: 0,
  },

  startedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101925',
    borderWidth: 1,
    borderColor: '#344054',
    borderRadius: 17,
    padding: 17,
  },

  startedDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#8ECAFF',
    marginRight: 13,
  },

  startedTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  startedText: {
    color: '#697589',
    fontSize: 10,
    marginTop: 4,
  },

  clearButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
  },

  clearButtonText: {
    color: '#080B12',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  footer: {
    color: '#354052',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 35,
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

  backHomeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 17,
    paddingHorizontal: 60,
    marginTop: 25,
  },

  backHomeText: {
    color: '#080B12',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});