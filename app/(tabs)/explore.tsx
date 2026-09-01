import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  difficulty: string | null;
  estimated_time: string | null;
  adventure_type: string | null;
};

export default function ExploreScreen() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedQuest, setSelectedQuest] =
    useState<Quest | null>(null);

  const [loading, setLoading] = useState(true);

  /*
   * Quest一覧をSupabaseから取得
   */
  useEffect(() => {
    const loadQuests = async () => {
      const {
        data,
        error,
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
        .order('number', {
          ascending: true,
        });

      console.log(
        'EXPLORE QUESTS:',
        data,
      );

      console.log(
        'EXPLORE QUEST ERROR:',
        error,
      );

      if (!error && data) {
        setQuests(data as Quest[]);
      }

      setLoading(false);
    };

    loadQuests();
  }, []);

  /*
   * Quest詳細
   */
  if (selectedQuest) {
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
              setSelectedQuest(null)
            }
          >
            <Text style={styles.backText}>
              ← BACK
            </Text>
          </Pressable>

          <Text style={styles.logo}>
            QUESTORY
          </Text>

          <Text style={styles.sub}>
            QUEST DETAIL
          </Text>

          <View style={styles.detailHeader}>
            <Text
              style={
                styles.detailNumber
              }
            >
              {selectedQuest.number}
            </Text>

            <Text
              style={
                styles.detailTitle
              }
            >
              {selectedQuest.title}
            </Text>

            <Text
              style={
                styles.detailDescription
              }
            >
              {selectedQuest.description}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                DIFFICULTY
              </Text>

              <Text style={styles.infoValue}>
                {selectedQuest.difficulty ||
                  '—'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                TIME
              </Text>

              <Text style={styles.infoValue}>
                {selectedQuest.estimated_time ||
                  '—'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                TYPE
              </Text>

              <Text style={styles.infoValue}>
                {selectedQuest.adventure_type ||
                  '—'}
              </Text>
            </View>
          </View>

          <View style={styles.noticeCard}>
            <Text style={styles.noticeLabel}>
              QUEST
            </Text>

            <Text style={styles.noticeText}>
              このQuestに挑戦して、
              あなたの冒険を残そう。
            </Text>
          </View>

          <Pressable
            style={styles.homeButton}
            onPress={() => {
              setSelectedQuest(null);
              router.push({
                pathname: '/quest',
                params: {
                  questId:
                    selectedQuest.id,
                },
              });
            }}
          >
            <Text
              style={
                styles.homeButtonText
              }
            >
              CHALLENGE THIS QUEST
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            LOADING QUESTS...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * Quest一覧
   */
  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Text style={styles.logo}>
          QUESTORY
        </Text>

        <Text style={styles.sub}>
          EXPLORE
        </Text>

        <Text style={styles.title}>
          今日の冒険を
          {'\n'}
          探そう。
        </Text>

        <View style={styles.countBadge}>
          <Text
            style={
              styles.countBadgeText
            }
          >
            {quests.length} QUESTS
          </Text>
        </View>

        {quests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text
              style={styles.emptyTitle}
            >
              NO QUESTS
            </Text>

            <Text
              style={styles.emptyText}
            >
              現在表示できるQuestが
              ありません。
            </Text>
          </View>
        ) : (
          quests.map((quest) => (
            <Pressable
              key={quest.id}
              style={styles.questCard}
              onPress={() =>
                setSelectedQuest(quest)
              }
            >
              <View
                style={
                  styles.questTop
                }
              >
                <Text
                  style={
                    styles.questNumber
                  }
                >
                  {quest.number}
                </Text>

                {quest.difficulty && (
                  <Text
                    style={
                      styles.difficulty
                    }
                  >
                    {quest.difficulty}
                  </Text>
                )}
              </View>

              <Text
                style={
                  styles.questTitle
                }
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

              <View
                style={
                  styles.questBottom
                }
              >
                <Text
                  style={
                    styles.questMeta
                  }
                >
                  {quest.estimated_time ||
                    'TIME —'}
                </Text>

                <Text
                  style={
                    styles.arrow
                  }
                >
                  →
                </Text>
              </View>
            </Pressable>
          ))
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
  },

  loadingText: {
    color: '#687386',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 12,
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
    fontSize: 31,
    lineHeight: 41,
    fontWeight: '900',
    marginTop: 40,
  },

  countBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#2B3444',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 22,
    marginBottom: 20,
  },

  countBadgeText: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  questCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 22,
    padding: 19,
    marginBottom: 14,
  },

  questTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  questNumber: {
    color: '#8ECAFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  difficulty: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  questTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '900',
    marginTop: 12,
  },

  questDescription: {
    color: '#687386',
    fontSize: 10,
    lineHeight: 17,
    marginTop: 9,
  },

  questBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  questMeta: {
    color: '#4F5B6E',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  arrow: {
    color: '#8ECAFF',
    fontSize: 18,
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
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  emptyText: {
    color: '#687386',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },

  backButton: {
    marginBottom: 28,
  },

  backText: {
    color: '#8ECAFF',
    fontSize: 10,
    fontWeight: '900',
  },

  detailHeader: {
    marginTop: 45,
    marginBottom: 25,
  },

  detailNumber: {
    color: '#8ECAFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  detailTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '900',
    marginTop: 10,
  },

  detailDescription: {
    color: '#687386',
    fontSize: 12,
    lineHeight: 20,
    marginTop: 14,
  },

  infoCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 20,
    paddingHorizontal: 18,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 17,
  },

  infoLabel: {
    color: '#536075',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  infoValue: {
    color: '#DCE1E8',
    fontSize: 10,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#202838',
  },

  noticeCard: {
    backgroundColor: '#0C111A',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
  },

  noticeLabel: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  noticeText: {
    color: '#DCE1E8',
    fontSize: 12,
    lineHeight: 20,
    marginTop: 9,
  },

  homeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 24,
  },

  homeButtonText: {
    color: '#080B12',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});