import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const questions = [
  {
    title: '休日はどう過ごしたい？',
    options: ['ゆっくりしたい', '友達と遊びたい', '新しいことをしたい', '遠くへ行きたい'],
  },
  {
    title: 'どれくらい冒険したい？',
    options: ['気軽に', 'ちょっと挑戦', 'かなり挑戦', '未知の世界へ'],
  },
  {
    title: '誰と挑戦したい？',
    options: ['一人', '友達', '恋人', 'その時による'],
  },
  {
    title: '予算はどれくらい？',
    options: ['〜1,000円', '〜3,000円', '〜5,000円', '〜10,000円以上'],
  },
  {
    title: '今、一番やってみたいことは？',
    options: ['自然', 'グルメ', '旅行', 'スポーツ・体験'],
  },
];

export default function QuizScreen() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showQuest, setShowQuest] = useState(false);
  const [started, setStarted] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [memory, setMemory] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const question = questions[questionIndex];
  const isLast = questionIndex === questions.length - 1;

  const selectAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);

    if (!isLast) {
      setQuestionIndex(questionIndex + 1);
    }
  };

  const pickPhoto = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const resetAll = () => {
    setQuestionIndex(0);
    setAnswers([]);
    setShowQuest(false);
    setStarted(false);
    setClearing(false);
    setMemory('');
    setPhotoUri(null);
    setPosted(false);
  };

  if (posted) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.successContent}>
          <Text style={styles.logo}>QUESTORY</Text>

          <View style={styles.successTop}>
            <Text style={styles.successMark}>✓</Text>

            <Text style={styles.smallLabel}>
              QUEST CLEAR
            </Text>

            <Text style={styles.successTitle}>
              POSTED.
            </Text>

            <Text style={styles.successText}>
              あなたの冒険を記録しました。
            </Text>
          </View>

          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={styles.postedPhoto}
            />
          ) : (
            <View style={styles.postedPhotoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>
                NO PHOTO
              </Text>
            </View>
          )}

          <View style={styles.postedCard}>
            <Text style={styles.cardLabel}>
              CLEARED QUEST
            </Text>

            <Text style={styles.postedQuest}>
              知らない駅で降りてみろ。
            </Text>

            {memory.length > 0 && (
              <>
                <View style={styles.divider} />

                <Text style={styles.cardLabel}>
                  MEMORY
                </Text>

                <Text style={styles.memoryText}>
                  「{memory}」
                </Text>
              </>
            )}
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={resetAll}
          >
            <Text style={styles.primaryButtonText}>
              FIND NEXT QUEST
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (clearing) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.clearContent}>
          <Text style={styles.logo}>QUESTORY</Text>

          <Text style={styles.smallLabel}>
            COMPLETE QUEST
          </Text>

          <Text style={styles.clearTitle}>
            冒険を、{'\n'}記録しよう。
          </Text>

          <Text style={styles.clearSubtitle}>
            CLEARした瞬間をQuestoryに残します。
          </Text>

          <Pressable
            style={styles.photoBox}
            onPress={pickPhoto}
          >
            {photoUri ? (
              <>
                <Image
                  source={{ uri: photoUri }}
                  style={styles.preview}
                />

                <View style={styles.changePhoto}>
                  <Text style={styles.changePhotoText}>
                    CHANGE PHOTO
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.photoPlus}>＋</Text>

                <Text style={styles.photoTitle}>
                  ADD PHOTO
                </Text>

                <Text style={styles.photoText}>
                  タップして写真を選択
                </Text>
              </>
            )}
          </Pressable>

          <Text style={styles.memoryLabel}>
            MEMORY
          </Text>

          <TextInput
            style={styles.memoryInput}
            placeholder="このQUESTはどうだった？"
            placeholderTextColor="#566175"
            value={memory}
            onChangeText={setMemory}
            multiline
          />

          <Pressable
            style={styles.primaryButton}
            onPress={() => setPosted(true)}
          >
            <Text style={styles.primaryButtonText}>
              POST CLEAR
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => setClearing(false)}
          >
            <Text style={styles.secondaryButtonText}>
              BACK
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (showQuest) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.questContent}>
          <Text style={styles.logo}>QUESTORY</Text>

          <Text style={styles.smallLabel}>
            {started ? 'QUEST IN PROGRESS' : 'YOUR QUEST'}
          </Text>

          <View style={styles.questCard}>
            <View style={styles.questTop}>
              <Text style={styles.category}>
                ADVENTURE
              </Text>

              <Text style={styles.rare}>
                RARE
              </Text>
            </View>

            <Text style={styles.questNumber}>
              QUEST #001
            </Text>

            <Text style={styles.questTitle}>
              知らない駅で{'\n'}降りてみろ。
            </Text>

            <Text style={styles.questDescription}>
              いつもの目的地から少し離れて、
              行ったことのない街を自分の足で探索しよう。
            </Text>

            <View style={styles.divider} />

            <Text style={styles.reasonLabel}>
              WHY THIS QUEST?
            </Text>

            <Text style={styles.reasonText}>
              あなたの診断結果から、新しい場所を体験する
              QUESTを選びました。
            </Text>

            <View style={styles.infoRow}>
              <View>
                <Text style={styles.infoLabel}>
                  TIME
                </Text>
                <Text style={styles.infoValue}>
                  1〜2 HOURS
                </Text>
              </View>

              <View>
                <Text style={styles.infoLabel}>
                  BUDGET
                </Text>
                <Text style={styles.infoValue}>
                  〜 ¥2,000
                </Text>
              </View>

              <View>
                <Text style={styles.infoLabel}>
                  STYLE
                </Text>
                <Text style={styles.infoValue}>
                  SOLO
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
              <View style={styles.startedBox}>
                <Text style={styles.startedTitle}>
                  QUEST STARTED
                </Text>

                <Text style={styles.startedText}>
                  あなたの冒険が始まりました。
                </Text>
              </View>

              <Pressable
                style={styles.primaryButton}
                onPress={() => setClearing(true)}
              >
                <Text style={styles.primaryButtonText}>
                  CLEAR QUEST
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>QUESTORY</Text>

        <View style={styles.progressArea}>
          <Text style={styles.progressText}>
            {questionIndex + 1} / {questions.length}
          </Text>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((questionIndex + 1) / questions.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <Text style={styles.smallLabel}>
          QUESTORY DIAGNOSIS
        </Text>

        <Text style={styles.title}>
          {question.title}
        </Text>

        <Text style={styles.subtitle}>
          あなたに合うQUESTを見つけるための質問です。
        </Text>

        <View style={styles.options}>
          {question.options.map((option) => (
            <Pressable
              key={option}
              style={[
                styles.option,
                answers[questionIndex] === option &&
                  styles.selectedOption,
              ]}
              onPress={() => selectAnswer(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  answers[questionIndex] === option &&
                    styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>

              <Text style={styles.arrow}>→</Text>
            </Pressable>
          ))}
        </View>

        {isLast && answers[questionIndex] && (
          <Pressable
            style={styles.primaryButton}
            onPress={() => setShowQuest(true)}
          >
            <Text style={styles.primaryButtonText}>
              FIND MY QUEST
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B12',
  },

  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
  },

  questContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 60,
  },

  clearContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 60,
  },

  successContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 60,
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 35,
  },

  progressArea: {
    marginBottom: 45,
  },

  progressText: {
    color: '#667287',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 9,
  },

  progressBar: {
    height: 3,
    backgroundColor: '#202838',
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: 3,
    backgroundColor: '#FFFFFF',
  },

  smallLabel: {
    color: '#687386',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 14,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 41,
    fontWeight: '900',
    marginBottom: 12,
  },

  subtitle: {
    color: '#707C8F',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 30,
  },

  options: {
    gap: 11,
  },

  option: {
    minHeight: 62,
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 17,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectedOption: {
    borderColor: '#FFFFFF',
    backgroundColor: '#151B26',
  },

  optionText: {
    color: '#B5BDCA',
    fontSize: 14,
    fontWeight: '700',
  },

  selectedOptionText: {
    color: '#FFFFFF',
  },

  arrow: {
    color: '#586477',
    fontSize: 18,
  },

  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
  },

  primaryButtonText: {
    color: '#070A10',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2B3444',
    borderRadius: 17,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 12,
  },

  secondaryButtonText: {
    color: '#8E98A9',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  questCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 28,
    padding: 24,
  },

  questTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  category: {
    color: '#8ECAFF',
    fontSize: 10,
    fontWeight: '900',
  },

  rare: {
    color: '#A5AFBF',
    fontSize: 10,
    fontWeight: '900',
  },

  questNumber: {
    color: '#566175',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
  },

  questTitle: {
    color: '#FFFFFF',
    fontSize: 33,
    lineHeight: 43,
    fontWeight: '900',
    marginBottom: 18,
  },

  questDescription: {
    color: '#909BAC',
    fontSize: 14,
    lineHeight: 23,
  },

  divider: {
    height: 1,
    backgroundColor: '#252D3A',
    marginVertical: 24,
  },

  reasonLabel: {
    color: '#687386',
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 8,
  },

  reasonText: {
    color: '#A0A9B7',
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 24,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  infoLabel: {
    color: '#536075',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 6,
  },

  infoValue: {
    color: '#D9DFE8',
    fontSize: 10,
    fontWeight: '700',
  },

  startedBox: {
    borderWidth: 1,
    borderColor: '#2A3546',
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
  },

  startedTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 6,
  },

  startedText: {
    color: '#788497',
    fontSize: 12,
  },

  clearTitle: {
    color: '#FFFFFF',
    fontSize: 38,
    lineHeight: 48,
    fontWeight: '900',
    marginBottom: 12,
  },

  clearSubtitle: {
    color: '#788497',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 25,
  },

  photoBox: {
    height: 230,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#354055',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    overflow: 'hidden',
  },

  preview: {
    width: '100%',
    height: '100%',
  },

  photoPlus: {
    color: '#8ECAFF',
    fontSize: 34,
    marginBottom: 10,
  },

  photoTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },

  photoText: {
    color: '#596579',
    fontSize: 11,
    marginTop: 7,
  },

  changePhoto: {
    position: 'absolute',
    bottom: 12,
    backgroundColor: '#080B12',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },

  memoryLabel: {
    color: '#687386',
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 8,
  },

  memoryInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 17,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 14,
    textAlignVertical: 'top',
  },

  successTop: {
    marginTop: 45,
    marginBottom: 25,
  },

  successMark: {
    color: '#8ECAFF',
    fontSize: 50,
    marginBottom: 18,
  },

  successTitle: {
    color: '#FFFFFF',
    fontSize: 46,
    fontWeight: '900',
    marginTop: 5,
  },

  successText: {
    color: '#788497',
    fontSize: 13,
    marginTop: 10,
  },

  postedPhoto: {
    width: '100%',
    height: 250,
    borderRadius: 22,
  },

  postedPhotoPlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 22,
    backgroundColor: '#151D29',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoPlaceholderText: {
    color: '#566175',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  postedCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 22,
    padding: 20,
    marginTop: 18,
  },

  cardLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 9,
  },

  postedQuest: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '900',
  },

  memoryText: {
    color: '#DCE1E8',
    fontSize: 14,
    lineHeight: 22,
  },
});