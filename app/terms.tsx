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

export default function TermsScreen() {
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
          QUESTORY
        </Text>

        <Text style={styles.sub}>
          TERMS OF SERVICE
        </Text>

        <Text style={styles.title}>
          利用規約
        </Text>

        <Text style={styles.updated}>
          最終更新日：2026年9月1日
        </Text>

        <Text style={styles.intro}>
          本利用規約は、Questory（以下「本サービス」）の利用条件を定めるものです。本サービスをご利用いただく前に、本規約をご確認ください。
        </Text>

        <Section
          number="01"
          title="本サービスについて"
        >
          Questoryは、日常の中でさまざまなQUESTに挑戦し、現実世界での体験や発見を楽しむためのサービスです。
        </Section>

        <Section
          number="02"
          title="アカウント"
        >
          ユーザーは、自身の責任においてアカウントを管理するものとします。第三者になりすます行為、虚偽の情報を登録する行為、他者のアカウントを不正に利用する行為は禁止します。
        </Section>

        <Section
          number="03"
          title="投稿コンテンツ"
        >
          ユーザーは、写真、プロフィール、文章その他のコンテンツを本サービスに投稿できる場合があります。投稿するコンテンツについて必要な権利を有していること、および第三者の権利を侵害しないことは、投稿したユーザーの責任となります。
        </Section>

        <Section
          number="04"
          title="禁止事項"
        >
          本サービスの利用にあたり、法令に違反する行為、他者への嫌がらせや脅迫、差別的または攻撃的な行為、他者のプライバシーを侵害する行為、不適切なコンテンツの投稿、スパム、不正アクセス、本サービスの運営を妨害する行為などを禁止します。
        </Section>

        <Section
          number="05"
          title="安全について"
        >
          QUESTへの参加はユーザー自身の判断と責任で行ってください。危険な場所への立ち入り、法令や施設のルールに反する行為、自身または他者の安全を損なう行為を行わないでください。
        </Section>

        <Section
          number="06"
          title="通報・ブロック"
        >
          ユーザーは、不適切な行為を行うユーザーを通報またはブロックできる場合があります。通報された内容について、必要に応じて確認や対応を行うことがあります。
        </Section>

        <Section
          number="07"
          title="コンテンツへの対応"
        >
          本規約に違反するコンテンツや、本サービスの安全な運営に支障をきたすと判断したコンテンツについて、事前の通知なく表示制限または削除などの対応を行う場合があります。
        </Section>

        <Section
          number="08"
          title="利用制限"
        >
          本規約への重大な違反、不正利用、他のユーザーへの重大な迷惑行為などが確認された場合、アカウントまたは本サービスの利用を制限する場合があります。
        </Section>

        <Section
          number="09"
          title="サービスの変更・停止"
        >
          本サービスの内容は、必要に応じて変更される場合があります。また、メンテナンス、障害その他の事情により、本サービスの全部または一部を一時的に停止する場合があります。
        </Section>

        <Section
          number="10"
          title="免責"
        >
          本サービスの利用によって生じた損害について、法令上認められる範囲で責任を負わないものとします。ただし、適用される法令により責任を免除できない場合を除きます。
        </Section>

        <Section
          number="11"
          title="規約の変更"
        >
          必要に応じて本規約を変更する場合があります。重要な変更がある場合は、本サービス内その他適切な方法でお知らせします。
        </Section>

        <Section
          number="12"
          title="お問い合わせ"
        >
          本サービスまたは本規約に関するお問い合わせ方法については、Questory内のサポートページをご確認ください。
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerLogo}>
            QUESTORY
          </Text>

          <Text style={styles.footerText}>
            GO OUT. FIND YOUR STORY.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type SectionProps = {
  number: string;
  title: string;
  children: React.ReactNode;
};

function Section({
  number,
  title,
  children,
}: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.number}>
          {number}
        </Text>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>
      </View>

      <Text style={styles.body}>
        {children}
      </Text>
    </View>
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

  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 45,
  },

  updated: {
    color: '#536075',
    fontSize: 9,
    marginTop: 12,
  },

  intro: {
    color: '#A7B0BE',
    fontSize: 11,
    lineHeight: 20,
    marginTop: 28,
    marginBottom: 12,
  },

  section: {
    borderTopWidth: 1,
    borderTopColor: '#202838',
    paddingTop: 23,
    marginTop: 23,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  number: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    width: 32,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
  },

  body: {
    color: '#8994A5',
    fontSize: 11,
    lineHeight: 20,
    marginTop: 13,
    paddingLeft: 32,
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
    color: '#465164',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 8,
  },
});