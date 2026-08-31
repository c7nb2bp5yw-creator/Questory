import { router } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const notifications = [
  {
    type: 'CO-OP',
    title: 'Adventure_A があなたのQUESTに協力しました',
    text: '「行ったことのない場所で、1時間過ごしてみろ。」',
    time: '2 MIN AGO',
  },
  {
    type: 'CLEAR',
    title: 'Kenta がQUESTをCLEARしました',
    text: '「初めての店に一人で入れ。」',
    time: '18 MIN AGO',
  },
  {
    type: 'FOLLOW',
    title: 'Mio があなたをフォローしました',
    text: '新しい冒険仲間が増えました。',
    time: '1 HOUR AGO',
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text
          style={styles.back}
          onPress={() => router.back()}
        >
          ← BACK
        </Text>

        <Text style={styles.logo}>QUESTORY</Text>

        <Text style={styles.sub}>NOTIFICATIONS</Text>

        <Text style={styles.title}>
          通知
        </Text>

        {notifications.map((item, index) => (
          <View
            key={`${item.type}-${index}`}
            style={styles.card}
          >
            <View style={styles.topRow}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>
                  {item.type}
                </Text>
              </View>

              <Text style={styles.time}>
                {item.time}
              </Text>
            </View>

            <Text style={styles.notificationTitle}>
              {item.title}
            </Text>

            <Text style={styles.notificationText}>
              {item.text}
            </Text>
          </View>
        ))}

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

  back: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 25,
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
    marginTop: 42,
    marginBottom: 25,
  },

  card: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  typeBadge: {
    backgroundColor: '#162334',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  typeText: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  time: {
    color: '#4F5B6E',
    fontSize: 8,
    fontWeight: '800',
  },

  notificationTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: 14,
  },

  notificationText: {
    color: '#687386',
    fontSize: 10,
    lineHeight: 17,
    marginTop: 7,
  },
});