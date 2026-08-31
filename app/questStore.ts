export const joinedQuest = {
  creator: 'Adventure_A',
  title: '始発電車に乗って、知らない街へ行け。',
  description:
    'いつもの場所から少し離れて、まだ知らない街を歩いてみよう。',
};

let hasJoinedQuest = false;

const listeners = new Set<() => void>();

export function getHasJoinedQuest() {
  return hasJoinedQuest;
}

export function joinQuest() {
  hasJoinedQuest = true;

  listeners.forEach((listener) => {
    listener();
  });
}

export function leaveQuest() {
  hasJoinedQuest = false;

  listeners.forEach((listener) => {
    listener();
  });
}

export function subscribeQuest(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}