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

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Text style={styles.backText}>
            ← BACK
          </Text>
        </Pressable>

        <Text style={styles.logo}>
          POSEQ
        </Text>

        <Text style={styles.sub}>
          ABOUT
        </Text>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>
            GO OUT.
          </Text>

          <Text style={styles.heroTitle}>
            FIND YOUR{'\n'}STORY.
          </Text>

          <Text style={styles.heroDescription}>
            画面の向こうじゃなく、{'\n'}
            今日という現実を冒険しよう。
          </Text>
        </View>

        <View style={styles.messageCard}>
          <Text style={styles.cardLabel}>
            WHAT IS POSEQ?
          </Text>

          <Text style={styles.messageTitle}>
            日常を、冒険に。
          </Text>

          <Text style={styles.message}>
            POSEQは、現実世界で小さなQUESTに挑戦するためのアプリです。
            {'\n\n'}
            行ったことのない場所へ行く。
            {'\n'}
            いつもなら選ばないものを選ぶ。
            {'\n'}
            誰かと新しいことをしてみる。
            {'\n\n'}
            そんな小さな行動が、いつもの一日を少しだけ特別に変えていきます。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionNumber}>
            01
          </Text>

          <Text style={styles.sectionTitle}>
            QUEST
          </Text>

          <Text style={styles.sectionText}>
            あなたに届く小さな挑戦。
            {'\n'}
            難しいことを達成するためではなく、新しい体験に出会うきっかけです。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionNumber}>
            02
          </Text>

          <Text style={styles.sectionTitle}>
            EXPERIENCE
          </Text>

          <Text style={styles.sectionText}>
            QUESTの舞台はスマートフォンの中ではありません。
            {'\n'}
            街、自然、お店、人との時間。
            {'\n'}
            現実世界そのものがPOSEQのフィールドです。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionNumber}>
            03
          </Text>

          <Text style={styles.sectionTitle}>
            STORY
          </Text>

          <Text style={styles.sectionText}>
            挑戦したQUESTは、あなた自身の冒険の記録になります。
            {'\n'}
            小さな体験を積み重ねて、自分だけのSTORYを作っていきます。
          </Text>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quote}>
            “スマホを置いた先に、{'\n'}
            まだ知らない今日がある。”
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLogo}>
            POSEQ
          </Text>

          <Text style={styles.footerText}>
            GO OUT. FIND YOUR STORY.
          </Text>

          <Text style={styles.version}>
            VERSION 1.0.0
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
    paddingVertical: 8,
    marginBottom: 25,
  },

  backText: {
    color: '#8ECAFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
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
    paddingVertical: 62,
  },

  heroLabel: {
    color: '#8ECAFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 46,
    lineHeight: 51,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 10,
  },

  heroDescription: {
    color: '#8994A5',
    fontSize: 12,
    lineHeight: 21,
    marginTop: 23,
  },

  messageCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 24,
    padding: 22,
  },

  cardLabel: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  messageTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 14,
  },

  message: {
    color: '#A7B0BE',
    fontSize: 11,
    lineHeight: 21,
    marginTop: 17,
  },

  section: {
    borderTopWidth: 1,
    borderTopColor: '#202838',
    paddingTop: 26,
    marginTop: 32,
  },

  sectionNumber: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.3,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 8,
  },

  sectionText: {
    color: '#8994A5',
    fontSize: 11,
    lineHeight: 20,
    marginTop: 12,
  },

  quoteCard: {
    backgroundColor: '#0E141E',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginTop: 40,
  },

  quote: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 27,
    fontWeight: '800',
    textAlign: 'center',
  },

  footer: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#202838',
    marginTop: 45,
    paddingTop: 30,
  },

  footerLogo: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
  },

  footerText: {
    color: '#536075',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 8,
  },

  version: {
    color: '#343E4D',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 15,
  },
});