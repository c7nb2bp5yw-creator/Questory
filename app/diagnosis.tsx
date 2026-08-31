import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const questions = [
  {
    question: '予定のない休日、いちばん惹かれるのは？',
    options: [
      '知らない街を歩く',
      '海・山・自然に行く',
      '誰かと遊びに行く',
      '行き先を決めずに出かける',
    ],
  },
  {
    question: '知らない駅で降りてみろ。と言われたら？',
    options: [
      'めっちゃやりたい',
      '少し不安だけどやってみたい',
      '誰かとならやりたい',
      'あまり惹かれない',
    ],
  },
  {
    question: '一番テンションが上がる体験は？',
    options: [
      '絶景を見る',
      '初めての場所に行く',
      '美味しいものを食べる',
      '少し勇気がいることに挑戦する',
    ],
  },
  {
    question: 'QUESTをやるなら？',
    options: [
      '一人が好き',
      '一人でも誰かとでも',
      '友達とやりたい',
      '恋人・大切な人とやりたい',
    ],
  },
  {
    question: '行き当たりばったりの冒険は？',
    options: [
      '大好き',
      'ある程度なら好き',
      '少し不安',
      '計画して動きたい',
    ],
  },
  {
    question: '朝5時に起きて日の出を見に行け。なら？',
    options: [
      '最高',
      '一度ならやりたい',
      '誰かとならやる',
      'そこまではしたくない',
    ],
  },
  {
    question: '知らない人と少し関わるQUESTは？',
    options: [
      '面白そう',
      '軽い会話ならOK',
      '誰かと一緒ならOK',
      'できれば避けたい',
    ],
  },
  {
    question: 'どんな体験をもっと増やしたい？',
    options: [
      '自然・絶景',
      '街・旅行',
      '食・文化',
      'チャレンジ・初体験',
    ],
  },
  {
    question: '「今日いい日だったな」と感じるのは？',
    options: [
      '初めての経験をした日',
      '心が動く景色を見た日',
      '誰かといい思い出ができた日',
      '普段ならしないことをやった日',
    ],
  },
  {
    question: 'Questoryに一番してほしいことは？',
    options: [
      '自分では行かない場所へ連れ出してほしい',
      '日常をもっと特別にしてほしい',
      '思い出を増やしてほしい',
      '自分の殻を少し破ってほしい',
    ],
  },
];

export default function DiagnosisScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const question = questions[currentQuestion];
  const progress = currentQuestion + 1;

  const selectAnswer = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = index;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (answers[currentQuestion] === undefined) {
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      router.push({
        pathname: '/result',
        params: {
          answers: JSON.stringify(answers),
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.logo}>QUESTORY</Text>

        <Text style={styles.sub}>
          FIND YOUR ADVENTURE
        </Text>

        <View style={styles.header}>
          <Text style={styles.questionCount}>
            QUESTION {String(progress).padStart(2, '0')} / 10
          </Text>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progress,
                { width: `${(progress / 10) * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.questionArea}>
          <Text style={styles.questionNumber}>
            Q{progress}
          </Text>

          <Text style={styles.question}>
            {question.question}
          </Text>
        </View>

        <View style={styles.options}>
          {question.options.map((option, index) => {
            const selected = answers[currentQuestion] === index;

            return (
              <Pressable
                key={option}
                style={[
                  styles.option,
                  selected && styles.selectedOption,
                ]}
                onPress={() => selectAnswer(index)}
              >
                <View
                  style={[
                    styles.optionNumber,
                    selected && styles.selectedOptionNumber,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionNumberText,
                      selected &&
                        styles.selectedOptionNumberText,
                    ]}
                  >
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.optionText,
                    selected && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>

                {selected && (
                  <Text style={styles.check}>
                    ✓
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[
            styles.nextButton,
            answers[currentQuestion] === undefined &&
              styles.disabledButton,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion === questions.length - 1
              ? 'SEE MY ADVENTURE STYLE'
              : 'NEXT'}
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
    paddingBottom: 80,
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
    marginTop: 48,
  },

  questionCount: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  progressBackground: {
    height: 3,
    backgroundColor: '#202838',
    borderRadius: 3,
    overflow: 'hidden',
  },

  progress: {
    height: '100%',
    backgroundColor: '#8ECAFF',
    borderRadius: 3,
  },

  questionArea: {
    marginTop: 50,
    marginBottom: 32,
  },

  questionNumber: {
    color: '#526078',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  question: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 38,
    fontWeight: '900',
    marginTop: 10,
  },

  options: {
    gap: 11,
  },

  option: {
    minHeight: 65,
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedOption: {
    backgroundColor: '#162334',
    borderColor: '#8ECAFF',
  },

  optionNumber: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#192130',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedOptionNumber: {
    backgroundColor: '#8ECAFF',
  },

  optionNumberText: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
  },

  selectedOptionNumberText: {
    color: '#080B12',
  },

  optionText: {
    flex: 1,
    color: '#DCE1E8',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    marginLeft: 12,
  },

  selectedOptionText: {
    color: '#FFFFFF',
  },

  check: {
    color: '#8ECAFF',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 8,
  },

  nextButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 28,
  },

  disabledButton: {
    opacity: 0.3,
  },

  nextButtonText: {
    color: '#080B12',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
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