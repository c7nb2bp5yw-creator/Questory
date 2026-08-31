import { router } from 'expo-router';
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

export default function QuestsScreen() {
  const [questList, setQuestList] = useState<Quest[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuests = async () => {
      setIsLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert(
          'エラー',
          'ログイン情報を確認できませんでした。'
        );
        setIsLoading(false);
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from('profiles')
          .select('adventure_type')
          .eq('id', user.id)
          .single();

      if (profileError || !profile) {
        console.log('PROFILE LOAD ERROR:', profileError);

        Alert.alert(
          'エラー',
          'プロフィールを読み込めませんでした。'
        );
        setIsLoading(false);
        return;
      }

      const adventureType =
        profile.adventure_type?.trim().toUpperCase();

      const { data: quests, error: questError } =
        await supabase
          .from('quests')
          .select(
            'id, number, title, description, difficulty, estimated_time, adventure_type'
          )
          .eq('adventure_type', adventureType)
          .order('number', { ascending: false });

      if (questError) {
        console.log('QUEST LOAD ERROR:', questError);

        Alert.alert(
          'エラー',
          'Questを読み込めませんでした。'
        );
        setIsLoading(false);
        return;
      }

      setQuestList(quests ?? []);
      setIsLoading(false);
    };

    loadQuests();
  }, []);

  const currentQuest = questList[currentIndex];
  const remaining = 2 - skipCount;

  const handleSkip = () => {
    if (skipCount >= 2 || questList.length === 0) {
      return;
    }

    setSkipCount((prev) => prev + 1);

    setCurrentIndex((prev) => {
      if (prev >= questList.length - 1) {
        return 0;
      }

      return prev + 1;
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            FINDING YOUR QUEST...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.logo}>
            QUESTORY
          </Text>

          <Text style={styles.sub}>
            DAILY QUEST
          </Text>

          <Text style={styles.emptyTitle}>
            まだQuestがありません。
          </Text>

          <Text style={styles.emptyText}>
            あなたのAdventure Typeに合うQuestを
            {'\n'}
            これから追加していこう。
          </Text>

          <Pressable
            style={styles.backToHomeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backToHomeText}>
              BACK
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ← BACK
          </Text>
        </Pressable>

        <Text style={styles.logo}>
          QUESTORY
        </Text>

        <Text style={styles.sub}>
          DAILY QUEST
        </Text>

        <View style={styles.header}>
          <View>
            <Text style={styles.smallLabel}>
              TODAY'S QUEST
            </Text>

            <Text style={styles.title}>
              今日の冒険を{'\n'}
              選ぼう。
            </Text>
          </View>

          <View style={styles.skipCounter}>
            <Text style={styles.skipLabel}>
              SKIP
            </Text>

            <Text style={styles.skipNumber}>
              {remaining}/2
            </Text>
          </View>
        </View>

        <View style={styles.questCard}>

          <View style={styles.questTop}>
            <Text style={styles.questNumber}>
              {currentQuest.number}
            </Text>

            <Text style={styles.aiLabel}>
              AI SELECTED
            </Text>
          </View>

          <Text style={styles.questTitle}>
            {currentQuest.title}
          </Text>

          <Text style={styles.description}>
            {currentQuest.description}
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>

            <View>
              <Text style={styles.infoLabel}>
                DIFFICULTY
              </Text>

              <Text style={styles.infoValue}>
                {currentQuest.difficulty}
              </Text>
            </View>

            <View>
              <Text style={styles.infoLabel}>
                ESTIMATED TIME
              </Text>

              <Text style={styles.infoValue}>
                {currentQuest.estimated_time}
              </Text>
            </View>

          </View>

        </View>

        <Pressable
          style={styles.startButton}
          onPress={() =>
            router.push({
              pathname: '/quest',
              params: {
                id: currentQuest.id,
              },
            })
          }
        >
          <Text style={styles.startText}>
            VIEW QUEST
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.skipButton,
            skipCount >= 2 && styles.skipDisabled,
          ]}
          onPress={handleSkip}
          disabled={skipCount >= 2}
        >
          <Text style={styles.skipButtonText}>
            {skipCount >= 2
              ? 'TODAY’S SKIP USED'
              : 'SKIP THIS QUEST'}
          </Text>
        </Pressable>

        <Text style={styles.skipDescription}>
          QUESTは1日2回までスキップできます。
        </Text>

        <View style={styles.tipCard}>

          <Text style={styles.tipLabel}>
            QUESTORY TIP
          </Text>

          <Text style={styles.tipTitle}>
            完璧な冒険じゃなくていい。
          </Text>

          <Text style={styles.tipText}>
            少しだけいつもと違うことをする。
            それだけで今日の物語が始まります。
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
    paddingTop: 20,
    paddingBottom: 100,
  },

  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 25,
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 45,
    marginBottom: 25,
  },

  smallLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 31,
    lineHeight: 41,
    fontWeight: '900',
    marginTop: 7,
  },

  skipCounter: {
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },

  skipLabel: {
    color: '#687386',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },

  skipNumber: {
    color: '#8ECAFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 3,
  },

  questCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 25,
    padding: 22,
  },

  questTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  questNumber: {
    color: '#8ECAFF',
    fontSize: 10,
    fontWeight: '900',
  },

  aiLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  questTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 38,
    fontWeight: '900',
    marginTop: 30,
  },

  description: {
    color: '#7E899A',
    fontSize: 12,
    lineHeight: 20,
    marginTop: 16,
  },

  divider: {
    height: 1,
    backgroundColor: '#293345',
    marginVertical: 23,
  },

  infoRow: {
    flexDirection: 'row',
    gap: 45,
  },

  infoLabel: {
    color: '#536075',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },

  infoValue: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 6,
  },

  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 18,
  },

  startText: {
    color: '#080B12',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  skipButton: {
    borderWidth: 1,
    borderColor: '#344054',
    borderRadius: 17,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },

  skipDisabled: {
    opacity: 0.45,
  },

  skipButtonText: {
    color: '#8A95A6',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  skipDescription: {
    color: '#4F5B6E',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 10,
  },

  tipCard: {
    backgroundColor: '#0E141E',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 20,
    padding: 19,
    marginTop: 35,
  },

  tipLabel: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  tipTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 9,
  },

  tipText: {
    color: '#687386',
    fontSize: 10,
    lineHeight: 17,
    marginTop: 7,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  emptyContainer: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 30,
    alignItems: 'center',
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 80,
  },

  emptyText: {
    color: '#687386',
    fontSize: 11,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 15,
  },

  backToHomeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 17,
    paddingHorizontal: 70,
    marginTop: 35,
  },

  backToHomeText: {
    color: '#080B12',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});