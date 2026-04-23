import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import ProgressBar from '../../components/ProgressBar';
import { buildChallenges } from '../../lib/domain/gamification';
import { useAuth } from '../../lib/auth';
import { loadProfile } from '../../lib/profile';
import { Challenge, User } from '../../types';

const MICHELIN_RED = '#E2231A';

export default function ChallengesScreen() {
  const { authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (authUser) loadProfile(authUser.id).then(setUser);
  }, [authUser]);

  useFocusEffect(
    useCallback(() => {
      if (authUser) {
        loadProfile(authUser.id).then(setUser);
      }
    }, [authUser])
  );

  if (!user) return null;

  const challenges = buildChallenges(user);
  const completed = challenges.filter((c) => c.completed).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎯 Challenges</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>
            {completed}/{challenges.length}
          </Text>
        </View>
      </View>

      <View style={styles.overviewCard}>
        <Text style={styles.overviewLabel}>Progression globale</Text>
        <ProgressBar progress={completed / challenges.length} color={MICHELIN_RED} height={12} />
        <Text style={styles.overviewSub}>
          {challenges.length - completed} challenge{challenges.length - completed > 1 ? 's' : ''}{' '}
          restant{challenges.length - completed > 1 ? 's' : ''}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>En cours</Text>
      {challenges
        .filter((c) => !c.completed)
        .map((c) => (
          <ChallengeItem key={c.id} challenge={c} />
        ))}

      {completed > 0 && (
        <>
          <Text style={styles.sectionTitle}>Complétés ✓</Text>
          {challenges
            .filter((c) => c.completed)
            .map((c) => (
              <ChallengeItem key={c.id} challenge={c} />
            ))}
        </>
      )}
    </ScrollView>
  );
}

function ChallengeItem({ challenge: c }: { challenge: Challenge }) {
  return (
    <View style={[styles.card, c.completed && styles.cardCompleted]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{c.title}</Text>
        <View style={[styles.xpTag, c.completed && styles.xpTagCompleted]}>
          <Text style={[styles.xpTagText, c.completed && styles.xpTagTextCompleted]}>
            +{c.xpReward} XP
          </Text>
        </View>
      </View>
      <Text style={styles.cardDesc}>{c.description}</Text>
      <View style={styles.progressRow}>
        <ProgressBar
          progress={c.current / c.target}
          color={c.completed ? '#10B981' : MICHELIN_RED}
          height={8}
        />
        <Text style={styles.progressCount}>
          {c.current}/{c.target}
        </Text>
      </View>
      {c.completed && <Text style={styles.completedLabel}>✓ Challenge complété !</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  progressBadge: {
    backgroundColor: MICHELIN_RED,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  progressText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  overviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  overviewSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: MICHELIN_RED,
  },
  cardCompleted: {
    borderLeftColor: '#10B981',
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  xpTag: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  xpTagCompleted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  xpTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  xpTagTextCompleted: {
    color: '#065F46',
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    minWidth: 30,
    textAlign: 'right',
  },
  completedLabel: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
});
