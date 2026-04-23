import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FILTER_DEFINITIONS, filterStore } from '../lib/domain/filters';

export default function AdvancedFiltersScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(() => [...filterStore.active]);

  function toggle(id: string) {
    setSelected((p) => (p.includes(id) ? p.filter((l) => l !== id) : [...p, id]));
  }

  function handleApply() {
    filterStore.active = selected;
    router.back();
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backdrop} onPress={() => router.back()} activeOpacity={1} />

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>Filtres Avancés</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.chipGrid}>
            {FILTER_DEFINITIONS.map((f) => {
              const active = selected.includes(f.id);
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggle(f.id)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearBtn} onPress={() => setSelected([])}>
            <Text style={styles.clearText}>Tout effacer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyText}>
              Appliquer{selected.length > 0 ? ` (${selected.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  content: { padding: 20 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  chipActive: { backgroundColor: '#E2231A', borderColor: '#E2231A' },
  chipText: { fontSize: 14, color: '#1A1A1A' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  clearText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  applyBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#E2231A',
    alignItems: 'center',
  },
  applyText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
