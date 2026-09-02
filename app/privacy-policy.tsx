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
          <Text style={styles.backText}>← BACK</Text>
        </Pressable>

        <Text style={styles.logo}>QUESTORY</Text>
        <Text style={styles.sub}>PRIVACY POLICY</Text>

        <Text style={styles.title}>
          プライバシーポリシー
        </Text>

        <Text style={styles.updated}>
          最終更新日：2026年9月2日
        </Text>

        <Text style={styles.intro}>
          Questory（以下「本サービス」）では、ユーザーのプライバシーを尊重し、本サービスの提供に必要な情報を適切に取り扱います。
        </Text>

        <Section number="01" title="取得する情報">
          本サービスでは、アカウント登録に関する情報（メールアドレス、ユーザーID等）、プロフィール情報（ユーザー名、表示名、プロフィール画像、自己紹介等）、ユーザーが投稿する写真や文章、QUESTの表示・達成・スキップ等の利用履歴、フォロー関係、ブロック情報、通報情報、お問い合わせ内容その他本サービスの利用に伴ってユーザーから提供される情報を取得する場合があります。{'\n\n'}
          また、本サービスの正常な提供、安全性の確保、不正利用防止等のため、サービスの利用状況やシステム上必要となる情報を処理する場合があります。
        </Section>

        <Section number="02" title="情報の利用目的">
          取得した情報は、本サービスの提供および維持、アカウント管理、プロフィールや投稿コンテンツの表示、QUESTの提供、ユーザーごとのQUESTの提案・生成・改善、フォローその他のソーシャル機能の提供、ユーザーサポート、安全性の確保、不正利用や迷惑行為の防止、通報への対応、サービスの改善および不具合対応のために利用します。{'\n\n'}
          QUESTの達成履歴やスキップ履歴等は、今後表示するQUESTをユーザーにより適したものにするために利用される場合があります。
        </Section>

        <Section number="03" title="投稿情報の公開">
          プロフィール、ユーザー名、プロフィール画像、QUESTの達成記録、投稿された写真や文章その他本サービス上で公開されることを前提とした情報は、他のユーザーから閲覧できる場合があります。{'\n\n'}
          投稿する内容には、住所、電話番号その他の個人情報や、第三者のプライバシーに関する情報を不用意に含めないようご注意ください。
        </Section>

        <Section number="04" title="第三者への提供">
          本サービスでは、法令に基づく場合、ユーザー本人の同意がある場合その他法令上認められる場合を除き、個人情報を第三者へ提供しません。{'\n\n'}
          ただし、本サービスの提供に必要な範囲で、クラウドサービス、認証サービス、データ保存サービス、画像保存サービス、AIサービスその他の外部サービス提供者に情報の処理を委託する場合があります。{'\n\n'}
          この場合、必要な範囲で情報が当該サービス提供者のシステム上で処理されることがあります。
        </Section>

        <Section number="05" title="外部サービス">
          本サービスでは、認証、データベース、画像保存、QUEST生成その他の機能を提供するため、第三者が提供するクラウドサービスやAIサービス等を利用する場合があります。{'\n\n'}
          これらの外部サービスに送信される情報は、本サービスの提供に必要な範囲に限定するよう努めます。{'\n\n'}
          各外部サービスにおける情報の取扱いについては、それぞれのサービス提供者が定めるプライバシーポリシー等が適用される場合があります。
        </Section>

        <Section number="06" title="情報の安全管理">
          本サービスでは、ユーザー情報への不正アクセス、漏えい、紛失、改ざん等を防止するため、本サービスの規模および性質に応じて必要かつ合理的な安全管理措置を講じるよう努めます。
        </Section>

        <Section number="07" title="ブロック・通報">
          本サービスでは、安全な利用環境を維持するため、ブロックや通報に関する情報を保存する場合があります。{'\n\n'}
          これらの情報は、ユーザー間の接触制限、不正利用や迷惑行為への対応、本サービスの安全性向上等のために利用します。
        </Section>

        <Section number="08" title="情報の変更・削除">
          ユーザーは、本サービス上で提供される機能により、一部のプロフィール情報等を変更または削除することができます。{'\n\n'}
          また、本サービス内のアカウント設定からアカウント削除を行うことができます。{'\n\n'}
          法令上保存義務がある場合、不正利用への対応その他正当な理由がある場合を除き、不要となった情報について適切な削除または匿名化を行います。
        </Section>

        <Section number="09" title="アカウントの削除">
          ユーザーは、本サービス内のアカウント設定から自身のアカウントを削除することができます。{'\n\n'}
          アカウントを削除した場合、法令上保存が必要な情報を除き、当該ユーザーのプロフィール情報、投稿した写真や文章、QUESTの達成記録その他アカウントに関連する個人データを、本サービスの定める方法に従って削除します。{'\n\n'}
          削除された情報は、原則として復元することができません。
        </Section>

        <Section number="10" title="情報の保存期間">
          取得した情報は、本サービスの提供に必要な期間保存します。{'\n\n'}
          アカウント削除後は、法令上の義務、不正利用への対応、紛争対応その他正当な理由により保存が必要な情報を除き、合理的な期間内に削除または匿名化します。
        </Section>

        <Section number="11" title="未成年者の利用">
          未成年のユーザーが本サービスを利用する場合は、適用される法令に従い、必要に応じて保護者その他の法定代理人の同意を得た上で利用してください。
        </Section>

        <Section number="12" title="本ポリシーの変更">
          本サービスの内容、利用する外部サービスまたは法令等の変更に応じて、本プライバシーポリシーを変更する場合があります。{'\n\n'}
          重要な変更を行う場合には、本サービス内での表示その他適切な方法によりお知らせします。
        </Section>

        <Section number="13" title="お問い合わせ">
          個人情報の取扱い、本プライバシーポリシー、アカウントやデータの削除その他のお問い合わせについては、本サービス内のサポートページに記載されたお問い合わせ先までご連絡ください。
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerLogo}>QUESTORY</Text>
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

function Section({ number, title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.number}>{number}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <Text style={styles.body}>{children}</Text>
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