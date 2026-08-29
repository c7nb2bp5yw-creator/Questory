import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function HomeScreen() {
  const [started, setStarted] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [caption, setCaption] = useState('');

  if (clearing) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.clearContent}>
          <Text style={styles.logo}>QUESTORY</Text>

          <View style={styles.clearHeader}>
            <Text style={styles.clearSmall}>QUEST #001</Text>
            <Text style={styles.clearTitle}>QUEST CLEAR</Text>
            <Text style={styles.clearSubtitle}>
              冒険の記録を残そう。
            </Text>
          </View>

          <View style={styles.photoBox}>
            <Text style={styles.photoIcon}>＋</Text>
            <Text style={styles.photoTitle}>ADD PHOTO</Text>
            <Text style={styles.photoText}>
              達成した瞬間の写真を追加
            </Text>
          </View>

          <Text style={styles.inputLabel}>MEMORY</Text>

          <TextInput
            style={styles.input}
            placeholder="この冒険はどうだった？"
            placeholderTextColor="#566175"
            multiline
            value={caption}
            onChangeText={setCaption}
          />

          <Pressable style={styles.postButton}>
            <Text style={styles.postButtonText}>SAVE CLEAR</Text>
          </Pressable>

          <Pressable
            style={styles.backButton}
            onPress={() => setClearing(false)}
          >
            <Text style={styles.backButtonText}>BACK</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>QUESTORY</Text>

          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>LV. 01</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          {started ? 'QUEST IN PROGRESS' : 'NEXT QUEST'}
        </Text>

        <View style={styles.questCard}>
          <View style={styles.cardTop}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>ADVENTURE</Text>
            </View>

            <Text style={styles.rarity}>RARE</Text>
          </View>

          <Text style={styles.questNumber}>QUEST #001</Text>

          <Text style={styles.questTitle}>
            知らない駅で{'\n'}降りてみろ。
          </Text>

          <Text style={styles.description}>
            いつもの目的地から少し離れて、
            行ったことのない街を自分の足で探索しよう。
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View>
              <Text style={styles.infoLabel}>TIME</Text>
              <Text style={styles.infoValue}>1〜2 HOURS</Text>
            </View>

            <View>
              <Text style={styles.infoLabel}>BUDGET</Text>
              <Text style={styles.infoValue}>〜 ¥2,000</Text>
            </View>

            <View>
              <Text style={styles.infoLabel}>STYLE</Text>
              <Text style={styles.infoValue}>SOLO</Text>
            </View>
          </View>
        </View>

        {!started ? (
          <>
            <Pressable
              style={styles.startButton}
              onPress={() => setStarted(true)}
            >
              <Text style={styles.startButtonText}>START QUEST</Text>
            </Pressable>

            <Pressable style={styles.changeButton}>
              <Text style={styles.changeButtonText}>CHANGE QUEST</Text>
              <Text style={styles.changeCount}>3 / 3 LEFT</Text>
            </Pressable>

            <Text style={styles.message}>
              AIがあなたの好みや行動から、次の冒険を選びます。
            </Text>
          </>
        ) : (
          <>
            <View style={styles.activeBox}>
              <Text style={styles.activeDot}>●</Text>

              <View>
                <Text style={styles.activeTitle}>QUEST STARTED</Text>
                <Text style={styles.activeText}>
                  冒険が始まりました。達成したら記録を残そう。
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.clearButton}
              onPress={() => setClearing(true)}
            >
              <Text style={styles.clearButtonText}>CLEAR QUEST</Text>
            </Pressable>
          </>
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
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 48,
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },

  levelBadge: {
    borderWidth: 1,
    borderColor: '#2B3343',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  levelText: {
    color: '#8F9AAF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  sectionLabel: {
    color: '#687386',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 14,
  },

  questCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  categoryBadge: {
    backgroundColor: '#192434',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  categoryText: {
    color: '#8ECAFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  rarity: {
    color: '#B2BAC8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },

  questNumber: {
    color: '#566175',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },

  questTitle: {
    color: '#FFFFFF',
    fontSize: 33,
    lineHeight: 43,
    fontWeight: '900',
    marginBottom: 18,
  },

  description: {
    color: '#919BAC',
    fontSize: 15,
    lineHeight: 24,
  },

  divider: {
    height: 1,
    backgroundColor: '#252D3A',
    marginVertical: 24,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  infoLabel: {
    color: '#536075',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  infoValue: {
    color: '#D9DFE8',
    fontSize: 11,
    fontWeight: '700',
  },

  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 19,
    alignItems: 'center',
    marginBottom: 12,
  },

  startButtonText: {
    color: '#070A10',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },

  changeButton: {
    borderWidth: 1,
    borderColor: '#2A3241',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  changeButtonText: {
    color: '#9BA5B5',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  changeCount: {
    color: '#596579',
    fontSize: 10,
    fontWeight: '700',
  },

  message: {
    color: '#4E596C',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 22,
    paddingHorizontal: 30,
  },

  activeBox: {
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },

  activeDot: {
    color: '#8ECAFF',
    fontSize: 12,
  },

  activeTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  activeText: {
    color: '#788396',
    fontSize: 11,
  },

  clearButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 19,
    alignItems: 'center',
  },

  clearButtonText: {
    color: '#070A10',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },

  clearContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 40,
  },

  clearHeader: {
    marginTop: 70,
    marginBottom: 36,
  },

  clearSmall: {
    color: '#647086',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },

  clearTitle: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },

  clearSubtitle: {
    color: '#7E899B',
    fontSize: 15,
  },

  photoBox: {
    height: 230,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#354055',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },

  photoIcon: {
    color: '#8ECAFF',
    fontSize: 34,
    marginBottom: 12,
  },

  photoTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },

  photoText: {
    color: '#596579',
    fontSize: 12,
  },

  inputLabel: {
    color: '#667287',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },

  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 18,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 16,
  },

  postButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 19,
    alignItems: 'center',
    marginBottom: 12,
  },

  postButtonText: {
    color: '#070A10',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },

  backButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },

  backButtonText: {
    color: '#647086',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
});