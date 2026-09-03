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
          <Text style={styles.backText}>← BACK</Text>
        </Pressable>

        <Text style={styles.logo}>POSEQ</Text>
        <Text style={styles.sub}>TERMS OF SERVICE</Text>

        <Text style={styles.title}>利用規約</Text>

        <Text style={styles.updated}>
          最終更新日：2026年9月2日
        </Text>

        <Text style={styles.intro}>
          本利用規約（以下「本規約」）は、POSEQ（以下「本サービス」）の利用条件を定めるものです。本サービスを利用する方（以下「ユーザー」）は、本規約に同意した上で本サービスをご利用ください。
        </Text>

        <Section number="01" title="本サービスについて">
          本サービスは、日常の中でさまざまなQUESTに挑戦し、現実世界での体験や発見を楽しみ、ユーザー同士でその体験を共有するためのサービスです。{'\n\n'}
          本サービスで提示されるQUESTは、ユーザーの状況、過去の利用状況その他の情報に基づき表示または生成される場合があります。
        </Section>

        <Section number="02" title="アカウント">
          ユーザーは、自身の責任においてアカウントおよびログイン情報を適切に管理するものとします。{'\n\n'}
          第三者になりすます行為、虚偽の情報を登録する行為、他者のアカウントを不正に利用する行為は禁止します。
        </Section>

        <Section number="03" title="投稿コンテンツ">
          ユーザーは、写真、プロフィール、文章その他のコンテンツ（以下「投稿コンテンツ」）を本サービスに投稿できる場合があります。{'\n\n'}
          ユーザーは、自身が投稿するコンテンツについて必要な権利を有していること、および第三者の著作権、肖像権、プライバシーその他の権利を侵害していないことを確認した上で投稿するものとします。{'\n\n'}
          投稿コンテンツの権利は、原則として投稿したユーザーに帰属します。ただしユーザーは、本サービスの提供、表示、運営、改善および不具合対応に必要な範囲で、当該投稿コンテンツを利用することを本サービス運営者に許諾するものとします。
        </Section>

        <Section number="04" title="禁止事項">
          ユーザーは、本サービスの利用にあたり、法令または公序良俗に違反する行為、犯罪行為に関連する行為、他者への嫌がらせ、脅迫、差別、誹謗中傷、第三者のプライバシーや知的財産権その他の権利を侵害する行為、わいせつ・暴力的その他不適切なコンテンツの投稿、スパム行為、不正アクセス、本サービスのシステムに過度な負荷を与える行為、本サービスの運営を妨害する行為、その他運営者が不適切と合理的に判断する行為を禁止します。
        </Section>

        <Section number="05" title="QUESTと安全について">
          QUESTへの参加は、ユーザー自身の判断と責任で行ってください。{'\n\n'}
          ユーザーは、危険な場所や立入禁止区域への侵入、交通法規その他の法令に違反する行為、店舗・施設・公共空間などのルールに反する行為、自身または他者の生命、身体、財産等に危険を及ぼす行為を行ってはなりません。{'\n\n'}
          本サービス上でQUESTが表示された場合であっても、周囲の状況や自身の体調等を確認し、安全に実行できないと判断した場合は実行しないでください。
        </Section>

        <Section number="06" title="通報・ブロック">
          ユーザーは、不適切なコンテンツまたは行為を行うユーザーについて、本サービス上の機能を利用して通報またはブロックできる場合があります。{'\n\n'}
          運営者は、通報された内容について必要に応じて確認し、コンテンツの削除、表示制限、利用制限その他必要と判断する対応を行う場合があります。
        </Section>

        <Section number="07" title="コンテンツへの対応">
          本規約に違反するコンテンツ、第三者の権利を侵害するコンテンツ、または本サービスの安全な運営に支障をきたすと合理的に判断されるコンテンツについて、運営者は必要に応じて表示制限または削除等の対応を行う場合があります。
        </Section>

        <Section number="08" title="利用制限・アカウント停止">
          本規約への重大または反復的な違反、不正利用、他のユーザーへの重大な迷惑行為その他本サービスの安全な運営を妨げる行為が確認された場合、運営者は当該ユーザーによる本サービスの利用を制限し、またはアカウントを停止・削除する場合があります。
        </Section>

        <Section number="09" title="アカウント削除">
          ユーザーは、本サービス内のアカウント設定から自身のアカウントの削除を行うことができます。{'\n\n'}
          アカウントを削除した場合、法令上保存が必要な情報を除き、当該アカウントに関連するプロフィール情報、投稿コンテンツその他のユーザーデータは、本サービスの定める方法に従って削除されます。{'\n\n'}
          アカウント削除後は、原則として削除されたデータを復元することはできません。
        </Section>

        <Section number="10" title="本サービスおよび知的財産権">
          本サービスを構成するプログラム、デザイン、ロゴ、文章その他のコンテンツに関する権利は、ユーザー自身が投稿したコンテンツを除き、運営者または正当な権利を有する第三者に帰属します。{'\n\n'}
          本規約による本サービスの利用許可は、これらの権利をユーザーに譲渡するものではありません。
        </Section>

        <Section number="11" title="サービスの変更・停止">
          運営者は、本サービスの改善、機能追加、仕様変更その他必要な理由により、本サービスの内容を変更する場合があります。{'\n\n'}
          また、メンテナンス、システム障害、外部サービスの障害その他やむを得ない事情により、本サービスの全部または一部を一時的に停止する場合があります。
        </Section>

        <Section number="12" title="免責および責任">
          運営者は、本サービスについて、その完全性、正確性、安全性、特定目的への適合性、継続的な提供等を保証するものではありません。{'\n\n'}
          ユーザー間またはユーザーと第三者との間で発生したトラブルについては、原則として当事者間で解決するものとします。{'\n\n'}
          本サービスの利用に関連してユーザーに損害が生じた場合、運営者は、適用される法令により認められる範囲を超えて責任を負うものではありません。ただし、法令により運営者の責任を制限または免除することが認められない場合には、この限りではありません。
        </Section>

        <Section number="13" title="本規約の変更">
          運営者は、法令に従い、必要に応じて本規約を変更する場合があります。重要な変更を行う場合には、本サービス内での表示その他適切な方法によりユーザーへお知らせします。
        </Section>

        <Section number="14" title="準拠法・管轄">
          本規約は日本法を準拠法とします。本サービスまたは本規約に関連して紛争が生じた場合には、法令に従い適切な裁判所を管轄裁判所とします。
        </Section>

        <Section number="15" title="お問い合わせ">
          本サービス、本規約、通報その他のお問い合わせについては、本サービス内のサポートページに記載されたお問い合わせ先までご連絡ください。
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerLogo}>POSEQ</Text>
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