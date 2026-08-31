import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getHasJoinedQuest,
  joinedQuest,
  subscribeQuest,
} from '../questStore';

export default function HomeScreen() {
  const [hasQuest, setHasQuest] = useState(getHasJoinedQuest());
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeQuest(() => {
      setHasQuest(getHasJoinedQuest());
      setStarted(false);
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

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

          <View style={styles.headerRight}>

            <Pressable
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <Text style={styles.notificationIcon}>
                ♢
              </Text>
            </Pressable>

            <View style={styles.levelBox}>
              <Text style={styles.levelLabel}>
                LV
              </Text>

              <Text style={styles.levelNumber}>
                07
              </Text>
            </View>

          </View>
        </View>

        {/* GREETING */}
        <View style={styles.greeting}>

          <Text style={styles.greetingSmall}>
            GOOD AFTERNOON.
          </Text>

          <Text style={styles.greetingTitle}>
            今日も、{'\n'}
            少しだけ冒険しよう。
          </Text>

        </View>

        {/* CO-OP QUEST */}
        {hasQuest ? (
          <>
            <View style={styles.sectionHeader}>

              <View>
                <Text style={styles.smallLabel}>
                  COOPERATING QUEST
                </Text>

                <Text style={styles.sectionTitle}>
                  誰かの冒険に乗っかる。
                </Text>
              </View>

              <Text style={styles.questNumber}>
                #032
              </Text>

            </View>

            <View style={styles.questCard}>

              <View style={styles.questTop}>

                <Text style={styles.category}>
                  FROM {joinedQuest.creator}
                </Text>

                <Text style={styles.rare}>
                  CO-OP
                </Text>

              </View>

              <Text style={styles.questTitle}>
                {joinedQuest.title}
              </Text>

              <Text style={styles.questDescription}>
                {joinedQuest.description}
              </Text>

              <View style={styles.divider} />

              <View style={styles.infoRow}>

                <View>
                  <Text style={styles.infoLabel}>
                    QUEST TYPE
                  </Text>

                  <Text style={styles.infoValue}>
                    COOPERATE
                  </Text>
                </View>

                <View>
                  <Text style={styles.infoLabel}>
                    STATUS
                  </Text>

                  <Text style={styles.infoValue}>
                    {started
                      ? 'IN PROGRESS'
                      : 'READY'}
                  </Text>
                </View>

              </View>

            </View>

            {!started ? (
              <Pressable
                style={styles.primaryButton}
                onPress={() => setStarted(true)}
              >
                <Text style={styles.primaryButtonText}>
                  START QUEST
                </Text>
              </Pressable>
            ) : (
              <>
                <View style={styles.startedCard}>

                  <View style={styles.startedDot} />

                  <View>
                    <Text style={styles.startedTitle}>
                      QUEST IN PROGRESS
                    </Text>

                    <Text style={styles.startedText}>
                      冒険が始まりました。
                    </Text>
                  </View>

                </View>

                <Pressable
                  style={styles.primaryButton}
                  onPress={() => router.push('/post')}
                >
                  <Text style={styles.primaryButtonText}>
                    CLEAR QUEST
                  </Text>
                </Pressable>
              </>
            )}
          </>
        ) : (
          <View style={styles.emptyCard}>

            <Text style={styles.emptyIcon}>
              ✦
            </Text>

            <Text style={styles.emptyTitle}>
              NO COOPERATING QUEST
            </Text>

            <Text style={styles.emptyText}>
              Exploreで誰かのNEXT QUESTに
              「協力する」と、ここに表示されます。
            </Text>

          </View>
        )}

        {/* FOR YOU */}
        <View style={styles.myQuestSection}>

          <View style={styles.sectionHeader}>

            <View>
              <Text style={styles.smallLabel}>
                FOR YOU
              </Text>

              <Text style={styles.sectionTitle}>
                あなたへのQUEST
              </Text>
            </View>

            <Text style={styles.aiLabel}>
              AI
            </Text>

          </View>

          <View style={styles.aiQuestCard}>

            <Text style={styles.aiQuestLabel}>
              RECOMMENDED FOR YOU
            </Text>

            <Text style={styles.aiQuestTitle}>
              知らない駅で{'\n'}
              降りてみろ。
            </Text>

            <Text style={styles.aiQuestText}>
              あなたの冒険スタイルに合わせたQUEST。
            </Text>

            <Pressable
              style={styles.outlineButton}
              onPress={() => router.push('/quests')}
            >
              <Text style={styles.outlineButtonText}>
                VIEW QUEST →
              </Text>
            </Pressable>

          </View>
        </View>

        {/* JOURNEY */}
        <View style={styles.journeySection}>

          <View style={styles.sectionHeader}>

            <Text style={styles.sectionTitle}>
              YOUR JOURNEY
            </Text>

            <Text style={styles.sectionCount}>
              27 QUESTS
            </Text>

          </View>

          <View style={styles.journeyCard}>

            <View style={styles.journeyNumber}>
              <Text style={styles.journeyNumberText}>
                027
              </Text>
            </View>

            <View style={styles.journeyInfo}>

              <Text style={styles.journeyTitle}>
                知らない駅で降りてみろ。
              </Text>

              <Text style={styles.journeyDate}>
                CLEARED TODAY
              </Text>

            </View>

            <Text style={styles.arrow}>
              →
            </Text>

          </View>

          <View style={styles.journeyCard}>

            <View style={styles.journeyNumber}>
              <Text style={styles.journeyNumberText}>
                026
              </Text>
            </View>

            <View style={styles.journeyInfo}>

              <Text style={styles.journeyTitle}>
                朝5時に起きて日の出を見ろ。
              </Text>

              <Text style={styles.journeyDate}>
                CLEARED 2 DAYS AGO
              </Text>

            </View>

            <Text style={styles.arrow}>
              →
            </Text>

          </View>

        </View>

        {/* STREAK */}
        <View style={styles.streakCard}>

          <View>

            <Text style={styles.streakLabel}>
              ADVENTURE STREAK
            </Text>

            <Text style={styles.streakNumber}>
              7 DAYS
            </Text>

            <Text style={styles.streakText}>
              7日連続でQUEST CLEAR中
            </Text>

          </View>

          <Text style={styles.streakIcon}>
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

  questNumber: {
    color: '#4F5B6E',
    fontSize: 10,
    fontWeight: '900',
  },

  questCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 26,
    padding: 22,
  },

  questTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  category: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  rare: {
    color: '#687386',
    fontSize: 9,
    fontWeight: '900',
  },

  questTitle: {
    color: '#FFFFFF',
    fontSize: 29,
    lineHeight: 38,
    fontWeight: '900',
  },

  questDescription: {
    color: '#8A95A6',
    fontSize: 12,
    lineHeight: 20,
    marginTop: 15,
  },

  divider: {
    height: 1,
    backgroundColor: '#252D3A',
    marginVertical: 22,
  },

  infoRow: {
    flexDirection: 'row',
    gap: 35,
  },

  infoLabel: {
    color: '#536075',
    fontSize: 8,
    fontWeight: '900',
    marginBottom: 6,
  },

  infoValue: {
    color: '#D8DEE7',
    fontSize: 9,
    fontWeight: '800',
  },

  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 18,
  },

  primaryButtonText: {
    color: '#080B12',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  startedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101925',
    borderWidth: 1,
    borderColor: '#344054',
    borderRadius: 17,
    padding: 17,
    marginTop: 18,
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

  emptyCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
  },

  emptyIcon: {
    color: '#8ECAFF',
    fontSize: 30,
    marginBottom: 12,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.3,
  },

  emptyText: {
    color: '#778397',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 9,
  },

  myQuestSection: {
    marginTop: 38,
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