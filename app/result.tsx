import { router } from 'expo-router';
import React from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function ResultScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.logo}>
          QUESTORY
        </Text>

        <Text style={styles.sub}>
          YOUR ADVENTURE STYLE
        </Text>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>
            YOUR RESULT
          </Text>

          <Text style={styles.title}>
            冒険することが、{'\n'}
            好きな人。
          </Text>

          <Text style={styles.description}>
            あなたは、いつもの日常から少し離れて
            {'\n'}
            新しい景色や体験に出会うことで、
            {'\n'}
            毎日をもっと楽しめるタイプです。
          </Text>
        </View>

        <View style={styles.typeCard}>
          <Text style={styles.typeLabel}>
            ADVENTURE TYPE
          </Text>

          <Text style={styles.typeTitle}>
            EXPLORER
          </Text>

          <Text style={styles.typeText}>
            知らない場所へ行くことを恐れず、
            {'\n'}
            自分だけの発見を楽しむ冒険者。
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
                好奇心
              </Text>

              <Text style={styles.traitText}>
                新しい場所に惹かれる
              </Text>
            </View>

            <View style={styles.trait}>
              <Text style={styles.traitNumber}>
                02
              </Text>

              <Text style={styles.traitTitle}>
                行動力
              </Text>

              <Text style={styles.traitText}>
                思い立ったら動ける
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
                発見
              </Text>

              <Text style={styles.traitText}>
                日常の中に面白さを見つける
              </Text>
            </View>

            <View style={styles.trait}>
              <Text style={styles.traitNumber}>
                04
              </Text>

              <Text style={styles.traitTitle}>
                挑戦
              </Text>

              <Text style={styles.traitText}>
                少しの勇気を楽しめる
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          YOUR FIRST QUEST
        </Text>

        <View style={styles.questCard}>
          <Text style={styles.questNumber}>
            QUEST #027
          </Text>

          <Text style={styles.questTitle}>
            知らない駅で{'\n'}
            降りてみろ。
          </Text>

          <Text style={styles.questDescription}>
            今日は、いつもの駅をひとつ飛び越えて。
            {'\n'}
            降りたことのない駅で、新しい景色を探そう。
          </Text>

          <View style={styles.meta}>
            <Text style={styles.metaText}>
              ★★☆☆☆　　1 HOUR　　SOLO
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.startButton}
          onPress={() => router.replace('/quests')}
        >
          <Text style={styles.startButtonText}>
            START FIRST QUEST
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

  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 18,
    alignItems: 'center',
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