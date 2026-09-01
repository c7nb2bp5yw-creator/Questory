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

export default function PrivacyPolicyScreen() {
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
          PRIVACY POLICY
        </Text>

        <Text style={styles.title}>
          プライバシーポリシー
        </Text>

        <Text style={styles.updated}>
          最終更新日：2026年9月1日
        </Text>

        <Text style={styles.intro}>
          Questory（以下「本サービス」）では、ユーザーのプライバシーを尊重し、本サービスの提供に必要な情報を適切に取り扱います。
        </Text>

        <Section
          number="01"
          title="取得する情報"
        >
          本サービスでは、アカウント登録情報、プロフィール情報、ユーザーID、メールアドレス、プロフィール画像、投稿された写真や文章、QUESTの達成記録、フォロー関係、ブロック情報、通報情報などを取得する場合があります。
        </Section>

        <Section
          number="02"
          title="情報の利用目的"
        >
          取得した情報は、本サービスの提供、アカウント管理、プロフィールや投稿の表示、QUEST機能やソーシャル機能の提供、安全性の確保、不正利用の防止、通報への対応、サービスの改善、お問い合わせへの対応などの目的で利用します。
        </Section>

        <Section
          number="03"
          title="投稿情報の公開"
        >
          プロフィール、ユーザー名、プロフィール画像、QUESTの達成記録、投稿された写真や文章など、本サービス上で公開されることを前提とした情報は、他のユーザーから閲覧できる場合があります。投稿する内容には個人情報や第三者のプライバシーに関する情報を不用意に含めないようご注意ください。
        </Section>

        <Section
          number="04"
          title="第三者への提供"
        >
          法令に基づく場合などを除き、取得した個人情報を本人の同意なく第三者へ提供しません。ただし、本サービスの提供に必要な範囲で、クラウドサービスなどの外部サービスを利用する場合があります。
        </Section>

        <Section
          number="05"
          title="外部サービス"
        >
          本サービスでは、認証、データ保存、画像保存その他の機能を提供するため、外部のクラウドサービス等を利用する場合があります。これらのサービスにおいて、サービス提供に必要な情報が処理される場合があります。
        </Section>

        <Section
          number="06"
          title="情報の安全管理"
        >
          ユーザー情報への不正アクセス、漏えい、紛失、改ざんなどを防止するため、本サービスの規模や性質に応じて必要な安全管理措置を講じるよう努めます。
        </Section>

        <Section
          number="07"
          title="ブロック・通報"
        >
          本サービスでは、安全な利用環境を維持するため、ブロックや通報に関する情報を保存する場合があります。これらの情報は、ユーザー間の接触制限、不正利用や迷惑行為への対応、本サービスの安全性向上などに利用します。
        </Section>

        <Section
          number="08"
          title="情報の削除"
        >
          ユーザーは、提供される機能またはお問い合わせを通じて、自身の情報の変更や削除を依頼できる場合があります。ただし、法令への対応、不正利用の防止、安全性の確保その他正当な理由により、一定期間情報を保持する場合があります。
        </Section>

        <Section
          number="09"
          title="アカウントの削除"
        >
          アカウント削除機能または所定の方法により、アカウントの削除を申請できるようにします。アカウント削除後のデータの取り扱いについては、法令上またはサービス運営上必要な範囲を除き、適切に削除または匿名化します。
        </Section>

        <Section
          number="10"
          title="未成年者の利用"
        >
          未成年のユーザーが本サービスを利用する場合は、必要に応じて保護者などの法定代理人の同意を得たうえで利用してください。
        </Section>

        <Section
          number="11"
          title="ポリシーの変更"
        >
          本サービスの内容や法令等の変更に応じて、本プライバシーポリシーを変更する場合があります。重要な変更がある場合は、本サービス内その他適切な方法でお知らせします。
        </Section>

        <Section
          number="12"
          title="お問い合わせ"
        >
          個人情報の取り扱い、本プライバシーポリシー、アカウントやデータの削除などに関するお問い合わせ方法については、Questory内のサポートページをご確認ください。
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
    fontSize: 32,
    lineHeight: 42,
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