import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

type AdventureType =
  | 'EXPLORER'
  | 'NATURE'
  | 'SOCIAL'
  | 'CHALLENGER';

type ResultData = {
  title: string;
  description: string;
  typeText: string;
  traits: {
    title: string;
    text: string;
  }[];
  questNumber: string;
  questTitle: string;
  questDescription: string;
  meta: string;
};

const resultData: Record<AdventureType, ResultData> = {
  EXPLORER: {
    title: '冒険することが、\n好きな人。',
    description:
      'あなたは、いつもの日常から少し離れて\n新しい景色や体験に出会うことで、\n毎日をもっと楽しめるタイプです。',
    typeText:
      '知らない場所へ行くことを恐れず、\n自分だけの発見を楽しむ冒険者。',
    traits: [
      {
        title: '好奇心',
        text: '新しい場所に惹かれる',
      },
      {
        title: '行動力',
        text: '思い立ったら動ける',
      },
      {
        title: '発見',
        text: '日常の中に面白さを見つける',
      },
      {
        title: '挑戦',
        text: '少しの勇気を楽しめる',
      },
    ],
    questNumber: 'QUEST #027',
    questTitle: '知らない駅で\n降りてみろ。',
    questDescription:
      '今日は、いつもの駅をひとつ飛び越えて。\n降りたことのない駅で、新しい景色を探そう。',
    meta: '★★☆☆☆　　1 HOUR　　SOLO',
  },

  NATURE: {
    title: '自然の中で、\n輝く人。',
    description:
      'あなたは、自然や美しい景色に触れることで\n心をリセットし、日常では味わえない\n特別な時間を楽しめるタイプです。',
    typeText:
      '海や山、夕日や星空。\n自然の中にある特別な瞬間を楽しむ冒険者。',
    traits: [
      {
        title: '感性',
        text: '美しい景色に心が動く',
      },
      {
        title: '解放',
        text: '自然の中で自由になれる',
      },
      {
        title: '癒し',
        text: '静かな時間を楽しめる',
      },
      {
        title: '発見',
        text: '身近な自然の魅力に気づける',
      },
    ],
    questNumber: 'QUEST #014',
    questTitle: '朝焼けを、\n見に行け。',
    questDescription:
      '少し早起きして、まだ見たことのない場所へ。\n朝の空が変わっていく瞬間を見届けよう。',
    meta: '★★★☆☆　　2 HOURS　　SOLO',
  },

  SOCIAL: {
    title: '誰かと過ごすことが、\n好きな人。',
    description:
      'あなたは、一人ではなく誰かと一緒に\n新しい体験をすることで、より大きな\n楽しさや思い出を生み出せるタイプです。',
    typeText:
      '誰かと一緒だからこそ生まれる\n笑いや思い出を楽しむ冒険者。',
    traits: [
      {
        title: '共感',
        text: '誰かと楽しさを共有できる',
      },
      {
        title: '社交性',
        text: '人との時間を大切にする',
      },
      {
        title: '思い出',
        text: '一緒に過ごした時間を楽しめる',
      },
      {
        title: '楽しさ',
        text: '周りの人も楽しませられる',
      },
    ],
    questNumber: 'QUEST #041',
    questTitle: '友達を誘って、\n知らない店へ。',
    questDescription:
      'いつものメンバーと、いつもとは違う場所へ。\n一緒に新しいお気に入りを見つけよう。',
    meta: '★★☆☆☆　　2 HOURS　　GROUP',
  },

  CHALLENGER: {
    title: '新しいことに、\n挑戦する人。',
    description:
      'あなたは、少し勇気が必要なことに挑戦することで\n自分自身の成長や、新しい自分を発見できる\nタイプです。',
    typeText:
      '「やったことがない」を楽しみながら、\n一歩踏み出すことができる冒険者。',
    traits: [
      {
        title: '勇気',
        text: '少し怖くても一歩踏み出せる',
      },
      {
        title: '挑戦',
        text: '未知の体験を楽しめる',
      },
      {
        title: '成長',
        text: '経験から自分を広げられる',
      },
      {
        title: '行動力',
        text: '思い立ったら挑戦できる',
      },
    ],
    questNumber: 'QUEST #063',
    questTitle: 'やったことのない\nことをやれ。',
    questDescription:
      '今日は、今まで一度もやったことのないことを一つ。\n小さな挑戦から、新しい自分を見つけよう。',
    meta: '★★★☆☆　　1 HOUR　　BRAVE',
  },
};

function calculateAdventureType(answers: number[]): AdventureType {
  const scores: Record<AdventureType, number> = {
    EXPLORER: 0,
    NATURE: 0,
    SOCIAL: 0,
    CHALLENGER: 0,
  };

  answers.forEach((answer, questionIndex) => {
    if (answer === undefined) {
      return;
    }

    switch (questionIndex) {
      case 0:
        if (answer === 0) scores.EXPLORER += 2;
        if (answer === 1) scores.NATURE += 2;
        if (answer === 2) scores.SOCIAL += 2;
        if (answer === 3) scores.CHALLENGER += 1;
        break;

      case 1:
        if (answer === 0) scores.EXPLORER += 2;
        if (answer === 1) scores.CHALLENGER += 2;
        if (answer === 2) scores.SOCIAL += 2;
        break;

      case 2:
        if (answer === 0) scores.NATURE += 2;
        if (answer === 1) scores.EXPLORER += 2;
        if (answer === 2) scores.SOCIAL += 2;
        if (answer === 3) scores.CHALLENGER += 2;
        break;

      case 3:
        if (answer === 0) scores.EXPLORER += 1;
        if (answer === 1) scores.EXPLORER += 1;
        if (answer === 2) scores.SOCIAL += 2;
        if (answer === 3) scores.SOCIAL += 2;
        break;

      case 4:
        if (answer === 0) scores.EXPLORER += 2;
        if (answer === 1) scores.EXPLORER += 1;
        if (answer === 2) scores.CHALLENGER += 1;
        if (answer === 3) scores.EXPLORER += 1;
        break;

      case 5:
        if (answer === 0) scores.NATURE += 2;
        if (answer === 1) scores.NATURE += 1;
        if (answer === 2) scores.SOCIAL += 2;
        if (answer === 3) scores.CHALLENGER += 1;
        break;

      case 6:
        if (answer === 0) scores.SOCIAL += 2;
        if (answer === 1) scores.SOCIAL += 1;
        if (answer === 2) scores.SOCIAL += 2;
        if (answer === 3) scores.EXPLORER += 1;
        break;

      case 7:
        if (answer === 0) scores.NATURE += 2;
        if (answer === 1) scores.EXPLORER += 2;
        if (answer === 2) scores.SOCIAL += 2;
        if (answer === 3) scores.CHALLENGER += 2;
        break;

      case 8:
        if (answer === 0) scores.CHALLENGER += 2;
        if (answer === 1) scores.NATURE += 2;
        if (answer === 2) scores.SOCIAL += 2;
        if (answer === 3) scores.CHALLENGER += 2;
        break;

      case 9:
        if (answer === 0) scores.EXPLORER += 2;
        if (answer === 1) scores.NATURE += 1;
        if (answer === 2) scores.SOCIAL += 2;
        if (answer === 3) scores.CHALLENGER += 2;
        break;

      default:
        break;
    }
  });

  const types: AdventureType[] = [
    'EXPLORER',
    'NATURE',
    'SOCIAL',
    'CHALLENGER',
  ];

  return types.reduce((best, type) => {
    return scores[type] > scores[best] ? type : best;
  }, 'EXPLORER');
}

export default function ResultScreen() {
  const params = useLocalSearchParams<{ answers?: string }>();
  const [isSaving, setIsSaving] = useState(true);
  const [error, setError] = useState('');

  const adventureType = useMemo<AdventureType>(() => {
    try {
      const parsedAnswers = params.answers
        ? JSON.parse(params.answers)
        : [];

      return calculateAdventureType(parsedAnswers);
    } catch {
      return 'EXPLORER';
    }
  }, [params.answers]);

  const result = resultData[adventureType];

  useEffect(() => {
    const saveResult = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('ログイン情報を確認できませんでした。');
        setIsSaving(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          adventure_type: adventureType,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (updateError) {
        console.log('PROFILE UPDATE ERROR:', updateError);
        setError(
          '診断結果の保存に失敗しました。もう一度お試しください。'
        );
      }

      setIsSaving(false);
    };

    saveResult();
  }, [adventureType]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.logo}>
          POSEQ
        </Text>

        <Text style={styles.sub}>
          YOUR ADVENTURE STYLE
        </Text>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>
            YOUR RESULT
          </Text>

          <Text style={styles.title}>
            {result.title}
          </Text>

          <Text style={styles.description}>
            {result.description}
          </Text>
        </View>

        <View style={styles.typeCard}>
          <Text style={styles.typeLabel}>
            ADVENTURE TYPE
          </Text>

          <Text style={styles.typeTitle}>
            {adventureType}
          </Text>

          <Text style={styles.typeText}>
            {result.typeText}
          </Text>
        </View>

        <View style={styles.traitsCard}>
          <Text style={styles.sectionLabel}>
            YOUR TRAITS
          </Text>

          <View style={styles.traitsRow}>
            <View style={styles.trait}>
              <Text style={styles.traitNumber}>
                01
              </Text>

              <Text style={styles.traitTitle}>
                {result.traits[0].title}
              </Text>

              <Text style={styles.traitText}>
                {result.traits[0].text}
              </Text>
            </View>

            <View style={styles.trait}>
              <Text style={styles.traitNumber}>
                02
              </Text>

              <Text style={styles.traitTitle}>
                {result.traits[1].title}
              </Text>

              <Text style={styles.traitText}>
                {result.traits[1].text}
              </Text>
            </View>
          </View>

          <View style={styles.traitsDivider} />

          <View style={styles.traitsRow}>
            <View style={styles.trait}>
              <Text style={styles.traitNumber}>
                03
              </Text>

              <Text style={styles.traitTitle}>
                {result.traits[2].title}
              </Text>

              <Text style={styles.traitText}>
                {result.traits[2].text}
              </Text>
            </View>

            <View style={styles.trait}>
              <Text style={styles.traitNumber}>
                04
              </Text>

              <Text style={styles.traitTitle}>
                {result.traits[3].title}
              </Text>

              <Text style={styles.traitText}>
                {result.traits[3].text}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          YOUR FIRST QUEST
        </Text>

        <View style={styles.questCard}>
          <Text style={styles.questNumber}>
            {result.questNumber}
          </Text>

          <Text style={styles.questTitle}>
            {result.questTitle}
          </Text>

          <Text style={styles.questDescription}>
            {result.questDescription}
          </Text>

          <View style={styles.meta}>
            <Text style={styles.metaText}>
              {result.meta}
            </Text>
          </View>
        </View>

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Pressable
          style={[
            styles.startButton,
            isSaving && styles.disabledButton,
          ]}
          onPress={() => router.replace('/quests')}
          disabled={isSaving}
        >
          <Text style={styles.startButtonText}>
            {isSaving ? 'SAVING...' : 'START FIRST QUEST'}
          </Text>
        </Pressable>

        <Text style={styles.footer}>
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
    paddingTop: 25,
    paddingBottom: 90,
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
    marginTop: 65,
  },

  eyebrow: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 44,
    fontWeight: '900',
    marginTop: 12,
  },

  description: {
    color: '#7B8799',
    fontSize: 11,
    lineHeight: 20,
    marginTop: 18,
  },

  typeCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#8ECAFF',
    borderRadius: 22,
    padding: 22,
    marginTop: 35,
  },

  typeLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  typeTitle: {
    color: '#8ECAFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 10,
  },

  typeText: {
    color: '#9AA5B6',
    fontSize: 11,
    lineHeight: 19,
    marginTop: 10,
  },

  traitsCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 22,
    padding: 20,
    marginTop: 18,
    marginBottom: 32,
  },

  sectionLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 12,
  },

  traitsRow: {
    flexDirection: 'row',
  },

  trait: {
    flex: 1,
    paddingRight: 10,
  },

  traitNumber: {
    color: '#536075',
    fontSize: 8,
    fontWeight: '900',
  },

  traitTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 6,
  },

  traitText: {
    color: '#687386',
    fontSize: 9,
    lineHeight: 15,
    marginTop: 4,
  },

  traitsDivider: {
    height: 1,
    backgroundColor: '#202838',
    marginVertical: 18,
  },

  questCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 22,
    padding: 21,
    marginBottom: 18,
  },

  questNumber: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  questTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 36,
    fontWeight: '900',
    marginTop: 12,
  },

  questDescription: {
    color: '#7B8799',
    fontSize: 11,
    lineHeight: 19,
    marginTop: 14,
  },

  meta: {
    borderTopWidth: 1,
    borderTopColor: '#202838',
    marginTop: 18,
    paddingTop: 14,
  },

  metaText: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  error: {
    color: '#D98282',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginBottom: 12,
  },

  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 18,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.35,
  },

  startButtonText: {
    color: '#080B12',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },

  footer: {
    color: '#354052',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 28,
  },
});