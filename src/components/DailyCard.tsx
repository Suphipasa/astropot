import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

export type HoroscopeData = {
  zodiac: string;
  date: string;
  physique: number;
  status: number;
  finances: number;
  relationship: number;
  career: number;
  travel: number;
  family: number;
  friends: number;
  health: number;
};

const SCORE_LABELS: Record<keyof Omit<HoroscopeData, 'zodiac' | 'date'>, string> = {
  physique: 'Fizik',
  status: 'Genel durum',
  finances: 'Finans',
  relationship: 'İlişki',
  career: 'Kariyer',
  travel: 'Seyahat',
  family: 'Aile',
  friends: 'Arkadaşlar',
  health: 'Sağlık',
};

const SCORE_KEYS: (keyof Omit<HoroscopeData, 'zodiac' | 'date'>)[] = [
  'physique',
  'status',
  'finances',
  'relationship',
  'career',
  'travel',
  'family',
  'friends',
  'health',
];

type DailyCardProps = {
  data: HoroscopeData;
};

const GLASS_PURPLE = 'rgba(88, 56, 163, 0.35)';
const GLASS_BORDER = 'rgba(212, 175, 55, 0.25)';
const GLASS_HIGHLIGHT = 'rgba(255, 255, 255, 0.08)';

function ScoreBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.scoreBarBg}>
        <View style={[styles.scoreBarFill, { width: `${clamped}%` }]} />
      </View>
      <Text style={styles.scoreValue}>{value}</Text>
    </View>
  );
}

export function DailyCard({ data }: DailyCardProps) {
  const { zodiac, date } = data;

  return (
    <View style={styles.card}>
      <View style={styles.cardInner}>
        <View style={styles.header}>
          <Text style={styles.zodiac}>{zodiac}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        <View style={styles.scores}>
          {SCORE_KEYS.map((key) => (
            <ScoreBar key={key} label={SCORE_LABELS[key]} value={data[key]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: GLASS_PURPLE,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  cardInner: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: GLASS_HIGHLIGHT,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  zodiac: {
    color: theme.colors.accent,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  date: {
    color: theme.colors.text,
    fontSize: 14,
    opacity: 0.7,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  scores: {
    gap: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.95,
    width: 100,
  },
  scoreBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: GLASS_HIGHLIGHT,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 4,
  },
  scoreValue: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },
});
