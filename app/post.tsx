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

export default function PostScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [posted, setPosted] = useState(false);

  const pickPhoto = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        '写真へのアクセスが必要です',
        'CLEAR写真を選ぶために、写真へのアクセスを許可してください。',
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.85,
      });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPosted(false);
    }
  };

  const handlePost = () => {
    if (!image) {
      Alert.alert(
        '写真を選択してください',
        'CLEARした時の写真を1枚選んでください。',
      );
      return;
    }

    setPosted(true);
  };

  if (posted) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.completeScroll}>
          <View style={styles.complete}>

            <Text style={styles.completeIcon}>
              ✓
            </Text>

            <Text style={styles.completeLabel}>
              QUEST CLEAR
            </Text>

            <Text style={styles.completeTitle}>
              冒険を残しました。
            </Text>

            <Text style={styles.completeText}>
              あなたのCLEARがプロフィールに
              記録されました。
            </Text>

            {image && (
              <Image
                source={{ uri: image }}
                style={styles.completeImage}
              />
            )}

            <Pressable
              style={styles.homeButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.homeButtonText}>
                BACK TO HOME
              </Text>
            </Pressable>

          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.logo}>
          QUESTORY
        </Text>

        <Text style={styles.sub}>
          POST CLEAR
        </Text>

        <Text style={styles.title}>
          冒険を残そう。
        </Text>

        <View style={styles.questCard}>

          <Text style={styles.questLabel}>
            CLEARED QUEST
          </Text>

          <Text style={styles.questNumber}>
            #027
          </Text>

          <Text style={styles.questTitle}>
            知らない駅で降りてみろ。
          </Text>

          <View style={styles.clearBadge}>
            <Text style={styles.clearBadgeText}>
              ✓ CLEAR
            </Text>
          </View>

        </View>

        <Text style={styles.sectionLabel}>
          CLEAR PHOTO
        </Text>

        <Pressable
          style={styles.photoArea}
          onPress={pickPhoto}
        >
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.selectedImage}
            />
          ) : (
            <>
              <Text style={styles.camera}>
                +
              </Text>

              <Text style={styles.photoTitle}>
                写真を選択
              </Text>

              <Text style={styles.photoDescription}>
                この冒険の思い出を1枚
              </Text>
            </>
          )}
        </Pressable>

        {image && (
          <Pressable
            style={styles.changeButton}
            onPress={pickPhoto}
          >
            <Text style={styles.changeText}>
              CHANGE PHOTO
            </Text>
          </Pressable>
        )}

        <Text style={styles.sectionLabel}>
          MEMORY
        </Text>

        <TextInput
          style={styles.caption}
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={120}
          placeholder="この冒険で感じたことを残そう。"
          placeholderTextColor="#4F5B6E"
          textAlignVertical="top"
        />

        <Text style={styles.count}>
          {caption.length}/120
        </Text>

        <Pressable
          style={[
            styles.postButton,
            !image && styles.disabledButton,
          ]}
          onPress={handlePost}
        >
          <Text style={styles.postButtonText}>
            POST CLEAR
          </Text>
        </Pressable>

        <Text style={styles.note}>
          投稿したCLEARはプロフィールの
          QUEST HISTORYに表示されます。
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

  completeScroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
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
    fontWeight: '900',
    marginTop: 42,
    marginBottom: 25,
  },

  questCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 22,
    padding: 19,
    marginBottom: 30,
  },

  questLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  questNumber: {
    color: '#8ECAFF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 13,
  },

  questTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '900',
    marginTop: 7,
  },

  clearBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#8ECAFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 15,
  },

  clearBadgeText: {
    color: '#080B12',
    fontSize: 8,
    fontWeight: '900',
  },

  sectionLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 12,
  },

  photoArea: {
    height: 330,
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },

  selectedImage: {
    width: '100%',
    height: '100%',
  },

  camera: {
    color: '#8ECAFF',
    fontSize: 38,
    fontWeight: '300',
  },

  photoTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 10,
  },

  photoDescription: {
    color: '#596579',
    fontSize: 9,
    marginTop: 6,
  },

  changeButton: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },

  changeText: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  caption: {
    height: 120,
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 17,
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 20,
    padding: 16,
  },

  count: {
    color: '#4F5B6E',
    fontSize: 8,
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 25,
  },

  postButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingVertical: 17,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.4,
  },

  postButtonText: {
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

  complete: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 50,
  },

  completeIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#8ECAFF',
    color: '#080B12',
    textAlign: 'center',
    lineHeight: 70,
    fontSize: 30,
    fontWeight: '900',
  },

  completeLabel: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 25,
  },

  completeTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    marginTop: 10,
    textAlign: 'center',
  },

  completeText: {
    color: '#687386',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 10,
  },

  completeImage: {
    width: 250,
    height: 310,
    borderRadius: 20,
    marginTop: 30,
  },

  homeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 28,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 28,
  },

  homeButtonText: {
    color: '#080B12',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});