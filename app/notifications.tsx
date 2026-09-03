import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { supabase } from '../lib/supabase';

type NotificationType = 'follow' | 'collaboration';

type NotificationItem = {
  id: string;
  type: NotificationType;
  actor_id: string;
  is_read: boolean;
  created_at: string;
  actor: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadNotifications = useCallback(
    async () => {
      setLoading(true);

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.log(
            'NOTIFICATIONS AUTH ERROR:',
            authError,
          );

          setNotifications([]);
          return;
        }

        const {
          data: notificationData,
          error: notificationError,
        } = await supabase
          .from('notifications')
          .select(`
            id,
            type,
            actor_id,
            is_read,
            created_at
          `)
          .eq('user_id', user.id)
          .order('created_at', {
            ascending: false,
          });

        if (notificationError) {
          console.log(
            'NOTIFICATIONS ERROR:',
            notificationError,
          );

          setNotifications([]);
          return;
        }

        const rows =
          notificationData ?? [];

        const actorIds = [
          ...new Set(
            rows.map(
              (item) => item.actor_id,
            ),
          ),
        ];

        let profiles: {
          id: string;
          name: string | null;
          username: string | null;
          avatar_url: string | null;
        }[] = [];

        if (actorIds.length > 0) {
          const {
            data: profileData,
            error: profileError,
          } = await supabase
            .from('profiles')
            .select(`
              id,
              name,
              username,
              avatar_url
            `)
            .in('id', actorIds);

          if (profileError) {
            console.log(
              'NOTIFICATION ACTORS ERROR:',
              profileError,
            );
          } else {
            profiles =
              profileData ?? [];
          }
        }

        const profileMap =
          new Map(
            profiles.map((profile) => [
              profile.id,
              profile,
            ]),
          );

        const items =
          rows.map((item) => ({
            ...item,
            actor:
              profileMap.get(
                item.actor_id,
              ) ?? null,
          })) as NotificationItem[];

        setNotifications(items);

        const unreadIds =
          items
            .filter(
              (item) => !item.is_read,
            )
            .map((item) => item.id);

        if (unreadIds.length > 0) {
          const { error: readError } =
            await supabase
              .from('notifications')
              .update({
                is_read: true,
              })
              .in('id', unreadIds)
              .eq('user_id', user.id);

          if (readError) {
            console.log(
              'NOTIFICATION READ ERROR:',
              readError,
            );
          } else {
            setNotifications(
              (current) =>
                current.map((item) =>
                  unreadIds.includes(
                    item.id,
                  )
                    ? {
                        ...item,
                        is_read: true,
                      }
                    : item,
                ),
            );
          }
        }
      } catch (error) {
        console.log(
          'LOAD NOTIFICATIONS ERROR:',
          error,
        );

        setNotifications([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications]),
  );

  const getMessage = (
    item: NotificationItem,
  ) => {
    const name =
      item.actor?.name ||
      item.actor?.username ||
      'ユーザー';

    if (item.type === 'follow') {
      return `${name}さんにフォローされました`;
    }

    return `${name}さんがあなたのQUESTに協力しました`;
  };

  const formatDate = (
    value: string,
  ) => {
    const date = new Date(value);

    return date.toLocaleString(
      'ja-JP',
      {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  };

  const openUser = (
    actorId: string,
  ) => {
    router.push({
      pathname: '/user/[id]',
      params: {
        id: actorId,
      },
    });
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <Text style={styles.backText}>
            ← BACK
          </Text>
        </Pressable>

        <Text style={styles.logo}>
          POSEQ
        </Text>

        <Text style={styles.sub}>
          NOTIFICATIONS
        </Text>

        <View style={styles.header}>
          <View>
            <Text
              style={styles.label}
            >
              ACTIVITY
            </Text>

            <Text
              style={styles.title}
            >
              通知。
            </Text>
          </View>

          <Text
            style={styles.count}
          >
            {notifications.length}
          </Text>
        </View>

        {loading ? (
          <View
            style={styles.loading}
          >
            <ActivityIndicator
              size="small"
              color="#8ECAFF"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              LOADING...
            </Text>
          </View>
        ) : notifications.length ===
          0 ? (
          <View
            style={styles.emptyCard}
          >
            <Text
              style={styles.emptyTitle}
            >
              NO NOTIFICATIONS
            </Text>

            <Text
              style={styles.emptyText}
            >
              まだ通知はありません。
            </Text>
          </View>
        ) : (
          notifications.map(
            (item) => (
              <Pressable
                key={item.id}
                style={
                  styles.notificationCard
                }
                onPress={() =>
                  openUser(
                    item.actor_id,
                  )
                }
              >
                <View
                  style={
                    styles.iconWrap
                  }
                >
                  <Text
                    style={
                      styles.iconText
                    }
                  >
                    {item.type ===
                    'follow'
                      ? '+'
                      : '∞'}
                  </Text>
                </View>

                <View
                  style={
                    styles.notificationMain
                  }
                >
                  <Text
                    style={
                      styles.message
                    }
                  >
                    {getMessage(
                      item,
                    )}
                  </Text>

                  <Text
                    style={styles.date}
                  >
                    {formatDate(
                      item.created_at,
                    )}
                  </Text>
                </View>

                <Text
                  style={styles.arrow}
                >
                  →
                </Text>
              </Pressable>
            ),
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#080B12',
    },

    content: {
      paddingHorizontal: 22,
      paddingTop: 20,
      paddingBottom: 120,
    },

    backButton: {
      marginBottom: 28,
    },

    backText: {
      color: '#8ECAFF',
      fontSize: 10,
      fontWeight: '900',
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

    header: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent:
        'space-between',
      marginTop: 42,
      marginBottom: 20,
    },

    label: {
      color: '#8ECAFF',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.5,
    },

    title: {
      color: '#FFFFFF',
      fontSize: 25,
      fontWeight: '900',
      marginTop: 8,
    },

    count: {
      color: '#8ECAFF',
      fontSize: 12,
      fontWeight: '900',
    },

    loading: {
      alignItems: 'center',
      paddingVertical: 60,
    },

    loadingText: {
      color: '#687386',
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.3,
      marginTop: 12,
    },

    emptyCard: {
      backgroundColor: '#111722',
      borderWidth: 1,
      borderColor: '#202838',
      borderRadius: 22,
      padding: 28,
      alignItems: 'center',
    },

    emptyTitle: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.2,
    },

    emptyText: {
      color: '#687386',
      fontSize: 10,
      marginTop: 10,
    },

    notificationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#111722',
      borderWidth: 1,
      borderColor: '#202838',
      borderRadius: 19,
      padding: 15,
      marginBottom: 10,
    },

    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#192130',
      alignItems: 'center',
      justifyContent: 'center',
    },

    iconText: {
      color: '#8ECAFF',
      fontSize: 18,
      fontWeight: '900',
    },

    notificationMain: {
      flex: 1,
      marginLeft: 13,
    },

    message: {
      color: '#FFFFFF',
      fontSize: 11,
      lineHeight: 17,
      fontWeight: '800',
    },

    date: {
      color: '#536075',
      fontSize: 8,
      marginTop: 6,
    },

    arrow: {
      color: '#8ECAFF',
      fontSize: 17,
      marginLeft: 10,
    },
  });