import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const questHistory = [
  {
    number: '027',
    title: '知らない駅で降りてみろ。',
    date: 'TODAY',
    photo: 'CLEAR PHOTO 027',
  },
  {
    number: '026',
    title: '朝5時に起きて日の出を見ろ。',
    date: '2 DAYS AGO',
    photo: 'CLEAR PHOTO 026',
  },
  {
    number: '025',
    title: '一人で知らない店に入れ。',
    date: '5 DAYS AGO',
    photo: 'CLEAR PHOTO 025',
  },
  {
    number: '024',
    title: '夜の街を1時間歩け。',
    date: '1 WEEK AGO',
    photo: 'CLEAR PHOTO 024',
  },
];

export default function ProfileScreen() {
  const [name, setName] = useState('Adventure_A');
  const [userId, setUserId] = useState('@adventure_a');
  const [bio, setBio] = useState(
    '知らない場所に行くのが好き。',
  );

  const [profileImage, setProfileImage] =
    useState<string | null>(null);

  const [saved, setSaved] = useState(false);

  const [selectedQuest, setSelectedQuest] =
    useState<number | null>(null);

  const changePhoto = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        '写真へのアクセスが必要です',
        'プロフィール写真を選ぶために、写真へのアクセスを許可してください。',
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      setSaved(false);
    }
  };

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  if (selectedQuest !== null) {
    const quest = questHistory[selectedQuest];

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>

          <Pressable
            style={styles.backButton}
            onPress={() => setSelectedQuest(null)}
          >
            <Text style={styles.backText}>
              ← BACK TO PROFILE
            </Text>
          </Pressable>

          <Text style={styles.logo}>
            QUESTORY
          </Text>

          <Text style={styles.sub}>
            QUEST MEMORY
          </Text>

          <View style={styles.detailHeader}>
            <Text style={styles.questNumberLarge}>
              #{quest.number}
            </Text>

            <Text style={styles.detailDate}>
              CLEARED {quest.date}
            </Text>
          </View>

          <View style={styles.clearPhoto}>
            <Text style={styles.photoLabel}>
              {quest.photo}
            </Text>

            <Text style={styles.photoIcon}>
              📸
            </Text>

            <Text style={styles.photoHint}>
              CLEARした時の写真
            </Text>
          </View>

          <Text style={styles.detailLabel}>
            QUEST
          </Text>

          <Text style={styles.detailTitle}>
            {quest.title}
          </Text>

          <View style={styles.memoryBox}>
            <Text style={styles.memoryLabel}>
              MEMORY
            </Text>

            <Text style={styles.memoryText}>
              この冒険で見つけた景色や思い出を
              ここに残せます。
            </Text>
          </View>

          <View style={styles.clearStatus}>
            <Text style={styles.clearCheck}>
              ✓
            </Text>

            <View>
              <Text style={styles.statusTitle}>
                QUEST CLEARED
              </Text>

              <Text style={styles.statusText}>
                あなたの旅の一部になりました。
              </Text>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.topBar}>
          <View>
            <Text style={styles.logo}>
              QUESTORY
            </Text>

            <Text style={styles.sub}>
              PROFILE
            </Text>
          </View>

          <Pressable
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.settingsButtonText}>
              ⚙ SETTINGS
            </Text>
          </Pressable>
        </View>

        <View style={styles.profileHeader}>

          <View style={styles.avatar}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          <Pressable
            style={styles.photoButton}
            onPress={changePhoto}
          >
            <Text style={styles.photoButtonText}>
              CHANGE PHOTO
            </Text>
          </Pressable>

        </View>

        <Text style={styles.sectionLabel}>
          PROFILE INFORMATION
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            NAME
          </Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(text) => {
              setName(text);
              setSaved(false);
            }}
            placeholder="名前を入力"
            placeholderTextColor="#4F5B6E"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            USER ID
          </Text>

          <TextInput
            style={styles.input}
            value={userId}
            onChangeText={(text) => {
              setUserId(text);
              setSaved(false);
            }}
            autoCapitalize="none"
            placeholder="@username"
            placeholderTextColor="#4F5B6E"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            BIO
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.bioInput,
            ]}
            value={bio}
            onChangeText={(text) => {
              setBio(text);
              setSaved(false);
            }}
            multiline
            maxLength={80}
            placeholder="自己紹介を書こう"
            placeholderTextColor="#4F5B6E"
          />

          <Text style={styles.characterCount}>
            {bio.length}/80
          </Text>
        </View>

        <Text style={styles.sectionLabel}>
          YOUR STATS
        </Text>

        <View style={styles.stats}>

          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              27
            </Text>

            <Text style={styles.statLabel}>
              QUESTS CLEARED
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              128
            </Text>

            <Text style={styles.statLabel}>
              FOLLOWERS
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              64
            </Text>

            <Text style={styles.statLabel}>
              FOLLOWING
            </Text>
          </View>

        </View>

        <View style={styles.historyHeader}>

          <View>
            <Text style={styles.sectionLabel}>
              YOUR JOURNEY
            </Text>

            <Text style={styles.historyTitle}>
              QUEST HISTORY
            </Text>
          </View>

          <Text style={styles.historyCount}>
            27 CLEARED
          </Text>

        </View>

        {questHistory.map((quest, index) => (
          <Pressable
            key={quest.number}
            style={styles.historyCard}
            onPress={() => setSelectedQuest(index)}
          >

            <View style={styles.historyNumberBox}>
              <Text style={styles.historyNumber}>
                {quest.number}
              </Text>
            </View>

            <View style={styles.historyInfo}>
              <Text style={styles.historyQuest}>
                {quest.title}
              </Text>

              <Text style={styles.historyDate}>
                CLEARED {quest.date}
              </Text>
            </View>

            <Text style={styles.historyArrow}>
              →
            </Text>

          </Pressable>
        ))}

        <Pressable
          style={[
            styles.saveButton,
            saved && styles.savedButton,
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>
            {saved ? '✓ SAVED' : 'SAVE PROFILE'}
          </Text>
        </Pressable>

        <Text style={styles.note}>
          写真とプロフィール情報は現在この端末上で
          仮保存しています。
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
    paddingTop: 20,
    paddingBottom: 120,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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

  settingsButton: {
    borderWidth: 1,
    borderColor: '#344054',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  settingsButtonText: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  profileHeader: {
    alignItems: 'center',
    marginTop: 42,
    marginBottom: 38,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#1B2432',
    borderWidth: 1,
    borderColor: '#344054',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },

  photoButton: {
    borderWidth: 1,
    borderColor: '#344054',
    borderRadius: 14,
    paddingHorizontal: 17,
    paddingVertical: 11,
    marginTop: 15,
  },

  photoButtonText: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  sectionLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 14,
  },

  inputGroup: {
    marginBottom: 22,
  },

  label: {
    color: '#536075',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 15,
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  characterCount: {
    color: '#4F5B6E',
    fontSize: 8,
    textAlign: 'right',
    marginTop: 6,
  },

  stats: {
    flexDirection: 'row',
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 20,
    paddingVertical: 20,
    marginBottom: 35,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
  },

  statLabel: {
    color: '#596579',
    fontSize: 7,
    fontWeight: '900',
    marginTop: 5,
  },

  divider: {
    width: 1,
    backgroundColor: '#293345',
  },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },

  historyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginTop: -8,
  },

  historyCount: {
    color: '#536075',
    fontSize: 8,
    fontWeight: '900',
  },

  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 17,
    padding: 14,
    marginBottom: 9,
  },

  historyNumberBox: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#192130',
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyNumber: {
    color: '#8ECAFF',
    fontSize: 11,
    fontWeight: '900',
  },

  historyInfo: {
    flex: 1,
    marginLeft: 13,
  },

  historyQuest: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },

  historyDate: {
    color: '#566175',
    fontSize: 8,
    marginTop: 5,
  },

  historyArrow: {
    color: '#687386',
    fontSize: 18,
    marginLeft: 8,
  },

  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 28,
  },

  savedButton: {
    backgroundColor: '#8ECAFF',
  },

  saveText: {
    color: '#080B12',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  note: {
    color: '#4F5B6E',
    fontSize: 9,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 15,
  },

  backButton: {
    marginBottom: 25,
  },

  backText: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  detailHeader: {
    marginTop: 35,
    marginBottom: 20,
  },

  questNumberLarge: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
  },

  detailDate: {
    color: '#687386',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 6,
  },

  clearPhoto: {
    height: 330,
    borderRadius: 24,
    backgroundColor: '#192130',
    borderWidth: 1,
    borderColor: '#293345',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoLabel: {
    color: '#566175',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  photoIcon: {
    fontSize: 38,
    marginTop: 12,
  },

  photoHint: {
    color: '#4F5B6E',
    fontSize: 9,
    marginTop: 10,
  },

  detailLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginTop: 25,
  },

  detailTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 37,
    fontWeight: '900',
    marginTop: 8,
  },

  memoryBox: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 18,
    padding: 18,
    marginTop: 22,
  },

  memoryLabel: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  memoryText: {
    color: '#8792A4',
    fontSize: 11,
    lineHeight: 19,
    marginTop: 9,
  },

  clearStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1822',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 17,
    padding: 16,
    marginTop: 14,
  },

  clearCheck: {
    color: '#8ECAFF',
    fontSize: 22,
    marginRight: 13,
  },

  statusTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  statusText: {
    color: '#596579',
    fontSize: 9,
    marginTop: 4,
  },
});