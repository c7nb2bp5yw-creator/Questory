import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { joinQuest } from '../questStore';

const users = [
  {
    name: 'Adventure_A',
    id: '@adventure_a',
    bio: '知らない場所に行くのが好き。',
    cleared: 31,
    followers: 128,
    following: 64,
    photo: 'PHOTO 001',
    quest: '朝5時に起きて日の出を見ろ。',
    caption: '眠かったけど、行ってよかった。',
    nextQuest: '始発電車に乗って、知らない街へ行け。',
  },
  {
    name: 'Kenta',
    id: '@kenta',
    bio: '休日はとにかく外へ。',
    cleared: 18,
    followers: 86,
    following: 41,
    photo: 'PHOTO 002',
    quest: '初めての店に一人で入れ。',
    caption: '普段なら絶対入らない店に挑戦。',
    nextQuest: '知らない駅で降りて、1時間歩け。',
  },
];

export default function ExploreScreen() {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedQuest, setSelectedQuest] = useState(false);
  const [joined, setJoined] = useState(false);
  const [following, setFollowing] = useState<number[]>([]);

  const currentUser =
    selectedUser !== null ? users[selectedUser] : null;

  const toggleFollow = (index: number) => {
    setFollowing((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    );
  };

  const handleJoin = () => {
    joinQuest();
    setJoined(true);
  };

  // QUEST DETAIL
  if (selectedQuest && currentUser && selectedUser !== null) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>

          <Pressable
            style={styles.backButton}
            onPress={() => setSelectedQuest(false)}
          >
            <Text style={styles.backText}>← BACK</Text>
          </Pressable>

          <Text style={styles.smallLabel}>
            QUEST DETAIL
          </Text>

          <View style={styles.detailPhoto}>
            <Text style={styles.photoLabel}>
              CLEAR PHOTO
            </Text>

            <Text style={styles.photoNumber}>
              {currentUser.photo}
            </Text>
          </View>

          <Text style={styles.questLabel}>
            CLEARED QUEST
          </Text>

          <Text style={styles.detailTitle}>
            {currentUser.quest}
          </Text>

          <View style={styles.memoryCard}>
            <Text style={styles.memoryLabel}>
              MEMORY
            </Text>

            <Text style={styles.memoryText}>
              「{currentUser.caption}」
            </Text>
          </View>

          <View style={styles.nextCard}>
            <Text style={styles.nextLabel}>
              NEXT QUEST
            </Text>

            <Text style={styles.nextTitle}>
              {currentUser.nextQuest}
            </Text>

            <Text style={styles.nextDescription}>
              {currentUser.name}が次に挑戦するQUEST
            </Text>

            <Pressable
              style={[
                styles.cooperateButton,
                joined && styles.joinedButton,
              ]}
              onPress={handleJoin}
            >
              <Text style={styles.cooperateText}>
                {joined
                  ? '✓ HOMEに追加済み'
                  : '🤝 このQUESTに協力する'}
              </Text>
            </Pressable>

            {joined && (
              <Text style={styles.addedText}>
                このQUESTをHOMEに追加しました。
              </Text>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // PROFILE
  if (currentUser && selectedUser !== null) {
    const isFollowing = following.includes(selectedUser);

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>

          <Pressable
            style={styles.backButton}
            onPress={() => {
              setSelectedUser(null);
              setSelectedQuest(false);
              setJoined(false);
            }}
          >
            <Text style={styles.backText}>
              ← BACK
            </Text>
          </Pressable>

          <View style={styles.profileTop}>

            <View style={styles.bigAvatar}>
              <Text style={styles.bigAvatarText}>
                {currentUser.name.charAt(0)}
              </Text>
            </View>

            <Text style={styles.profileName}>
              {currentUser.name}
            </Text>

            <Text style={styles.profileId}>
              {currentUser.id}
            </Text>

            <Text style={styles.profileBio}>
              {currentUser.bio}
            </Text>

            <Pressable
              style={[
                styles.followButton,
                isFollowing && styles.followingButton,
              ]}
              onPress={() => toggleFollow(selectedUser)}
            >
              <Text
                style={[
                  styles.followButtonText,
                  isFollowing && styles.followingButtonText,
                ]}
              >
                {isFollowing ? '✓ FOLLOWING' : '+ FOLLOW'}
              </Text>
            </Pressable>

          </View>

          <View style={styles.stats}>

            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {currentUser.cleared}
              </Text>
              <Text style={styles.statLabel}>
                QUEST CLEAR
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {currentUser.followers + (isFollowing ? 1 : 0)}
              </Text>
              <Text style={styles.statLabel}>
                FOLLOWERS
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.stat}>
              <Text style={styles.statNumber}>
                {currentUser.following}
              </Text>
              <Text style={styles.statLabel}>
                FOLLOWING
              </Text>
            </View>

          </View>

          <View style={styles.nextCard}>

            <Text style={styles.nextLabel}>
              NEXT QUEST
            </Text>

            <Text style={styles.nextTitle}>
              {currentUser.nextQuest}
            </Text>

            <Pressable
              style={styles.cooperateButton}
              onPress={handleJoin}
            >
              <Text style={styles.cooperateText}>
                🤝 このQUESTに協力する
              </Text>
            </Pressable>

            {joined && (
              <Text style={styles.addedText}>
                このQUESTをHOMEに追加しました。
              </Text>
            )}

          </View>

          <Text style={styles.sectionTitle}>
            QUEST HISTORY
          </Text>

          {[
            currentUser.quest,
            '知らない駅で降りてみろ。',
            '一人で知らない店に入れ。',
            '夜の街を1時間歩け。',
          ].map((quest, index) => (
            <Pressable
              key={`${quest}-${index}`}
              style={styles.questRow}
              onPress={() => setSelectedQuest(true)}
            >
              <Text style={styles.questNumber}>
                #{String(
                  currentUser.cleared - index,
                ).padStart(3, '0')}
              </Text>

              <Text style={styles.questHistoryText}>
                {quest}
              </Text>

              <Text style={styles.arrow}>
                →
              </Text>
            </Pressable>
          ))}

        </ScrollView>
      </SafeAreaView>
    );
  }

  // FOLLOWING FEED
  const followedUsers = users.filter((_, index) =>
    following.includes(index),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.logo}>
          QUESTORY
        </Text>

        <Text style={styles.sub}>
          FOLLOWING
        </Text>

        <Text style={styles.title}>
          フォローしている人の{'\n'}
          冒険を見る。
        </Text>

        <View style={styles.followingBadge}>
          <Text style={styles.followingBadgeText}>
            {following.length} FOLLOWING
          </Text>
        </View>

        {followedUsers.length === 0 ? (
          <View style={styles.emptyCard}>

            <Text style={styles.emptyIcon}>
              +
            </Text>

            <Text style={styles.emptyTitle}>
              FOLLOW SOMEONE
            </Text>

            <Text style={styles.emptyText}>
              ユーザーをタップしてプロフィールを開き、
              FOLLOWしてみよう。
            </Text>

            <View style={styles.peopleList}>
              {users.map((user, index) => (
                <Pressable
                  key={user.id}
                  style={styles.personRow}
                  onPress={() => {
                    setSelectedUser(index);
                    setJoined(false);
                  }}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user.name.charAt(0)}
                    </Text>
                  </View>

                  <View style={styles.userArea}>
                    <Text style={styles.username}>
                      {user.name}
                    </Text>

                    <Text style={styles.meta}>
                      {user.cleared} QUESTS CLEAR
                    </Text>
                  </View>

                  <Text style={styles.arrow}>
                    →
                  </Text>
                </Pressable>
              ))}
            </View>

          </View>
        ) : (
          followedUsers.map((user) => {
            const index = users.indexOf(user);

            return (
              <View
                style={styles.postCard}
                key={user.id}
              >

                <Pressable
                  style={styles.postHeader}
                  onPress={() => {
                    setSelectedUser(index);
                    setJoined(false);
                  }}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user.name.charAt(0)}
                    </Text>
                  </View>

                  <View style={styles.userArea}>
                    <Text style={styles.username}>
                      {user.name}
                    </Text>

                    <Text style={styles.meta}>
                      {user.cleared} QUESTS CLEAR
                    </Text>
                  </View>

                  <Text style={styles.arrow}>
                    →
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.photo}
                  onPress={() => {
                    setSelectedUser(index);
                    setSelectedQuest(true);
                    setJoined(false);
                  }}
                >
                  <Text style={styles.photoLabel}>
                    CLEAR PHOTO
                  </Text>

                  <Text style={styles.photoNumber}>
                    {user.photo}
                  </Text>
                </Pressable>

                <Text style={styles.questLabel}>
                  CLEARED QUEST
                </Text>

                <Text style={styles.clearedQuest}>
                  {user.quest}
                </Text>

                <View style={styles.nextCard}>

                  <Text style={styles.nextLabel}>
                    NEXT QUEST
                  </Text>

                  <Text style={styles.nextTitle}>
                    {user.nextQuest}
                  </Text>

                  <Pressable
                    style={styles.cooperateButton}
                    onPress={() => {
                      setSelectedUser(index);
                      setSelectedQuest(true);
                      setJoined(false);
                    }}
                  >
                    <Text style={styles.cooperateText}>
                      🤝 協力する
                    </Text>
                  </Pressable>

                </View>

              </View>
            );
          })
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
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 100,
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
    fontSize: 31,
    lineHeight: 41,
    fontWeight: '900',
    marginTop: 40,
  },

  followingBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#2B3444',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 22,
    marginBottom: 20,
  },

  followingBadgeText: {
    color: '#8ECAFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  postCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 24,
    padding: 17,
    marginBottom: 18,
  },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#202A39',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  userArea: {
    flex: 1,
    marginLeft: 11,
  },

  username: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  meta: {
    color: '#566175',
    fontSize: 8,
    marginTop: 4,
  },

  photo: {
    height: 250,
    borderRadius: 18,
    backgroundColor: '#192130',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  photoLabel: {
    color: '#566175',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  photoNumber: {
    color: '#343E4E',
    fontSize: 36,
    fontWeight: '900',
    marginTop: 8,
  },

  questLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  clearedQuest: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  nextCard: {
    backgroundColor: '#0C111A',
    borderWidth: 1,
    borderColor: '#293345',
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
  },

  nextLabel: {
    color: '#8ECAFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  nextTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '900',
    marginTop: 9,
  },

  nextDescription: {
    color: '#687386',
    fontSize: 9,
    marginTop: 7,
  },

  cooperateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },

  joinedButton: {
    backgroundColor: '#8ECAFF',
  },

  cooperateText: {
    color: '#080B12',
    fontSize: 10,
    fontWeight: '900',
  },

  addedText: {
    color: '#8ECAFF',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 10,
  },

  backButton: {
    marginBottom: 28,
  },

  backText: {
    color: '#8ECAFF',
    fontSize: 10,
    fontWeight: '900',
  },

  smallLabel: {
    color: '#687386',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 15,
  },

  detailPhoto: {
    height: 300,
    borderRadius: 24,
    backgroundColor: '#192130',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailTitle: {
    color: '#FFFFFF',
    fontSize: 29,
    lineHeight: 38,
    fontWeight: '900',
    marginTop: 10,
  },

  memoryCard: {
    backgroundColor: '#111722',
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
  },

  memoryLabel: {
    color: '#687386',
    fontSize: 8,
    fontWeight: '900',
  },

  memoryText: {
    color: '#DCE1E8',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },

  profileTop: {
    alignItems: 'center',
  },

  bigAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1B2432',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bigAvatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },

  profileName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 15,
  },

  profileId: {
    color: '#687386',
    fontSize: 10,
    marginTop: 5,
  },

  profileBio: {
    color: '#8D98AA',
    fontSize: 12,
    marginTop: 10,
  },

  followButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 30,
    paddingVertical: 13,
    marginTop: 18,
  },

  followingButton: {
    backgroundColor: '#8ECAFF',
  },

  followButtonText: {
    color: '#080B12',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  followingButtonText: {
    color: '#080B12',
  },

  stats: {
    flexDirection: 'row',
    paddingVertical: 22,
    marginTop: 25,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#202838',
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

  statDivider: {
    width: 1,
    backgroundColor: '#202838',
  },

  sectionTitle: {
    color: '#687386',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginTop: 30,
    marginBottom: 10,
  },

  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1B2330',
  },

  questNumber: {
    color: '#536075',
    fontSize: 9,
    width: 48,
  },

  questHistoryText: {
    flex: 1,
    color: '#DCE1E8',
    fontSize: 12,
    fontWeight: '700',
  },

  arrow: {
    color: '#687386',
    fontSize: 18,
  },

  emptyCard: {
    backgroundColor: '#111722',
    borderWidth: 1,
    borderColor: '#202838',
    borderRadius: 24,
    padding: 22,
  },

  emptyIcon: {
    color: '#8ECAFF',
    fontSize: 30,
    textAlign: 'center',
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: 10,
  },

  emptyText: {
    color: '#687386',
    fontSize: 10,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 15,
  },

  peopleList: {
    marginTop: 5,
  },

  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#202838',
  },
});