import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const SUGGESTIONS = [
  { title: 'Près de moi', sub: 'Découvrez les options à proximité' },
  { title: 'Paris', sub: 'Plus de 100 tables étoilées' },
  { title: 'Lyon', sub: 'Capitale gastronomique de la France' },
  { title: 'Bordeaux', sub: 'Cuisine du terroir et grands vins' },
  { title: 'Marseille', sub: 'Méditerranée et saveurs du sud' },
];

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
const DAYS_SHORT_FR = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

function formatMonth(d: Date) {
  return `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDate(d: Date) {
  return `${DAYS_SHORT_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()].slice(0, 4)}.`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function SearchScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'ou' | 'quand' | 'qui'>('ou');
  const [location, setLocation] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [when, setWhen] = useState('Ce soir');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [babies, setBabies] = useState(0);
  const [pets, setPets] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [calendarMode, setCalendarMode] = useState<'Dates' | 'Flexibles'>('Dates');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const totalCovers = adults + children;

  function selectLocation(title: string) {
    setLocation(title);
    setLocationLabel(title);
    setStep('quand');
  }

  async function handleNearMe() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      selectLocation('Près de moi');
    } catch (_e) {}
  }

  function handleSearch() {
    router.push({
      pathname: '/results',
      params: {
        location: locationLabel || location,
        when,
        covers: String(totalCovers),
        lat: userCoords ? String(userCoords.lat) : '',
        lng: userCoords ? String(userCoords.lng) : '',
      },
    });
  }

  function clearAll() {
    setLocation('');
    setLocationLabel('');
    setWhen('Ce soir');
    setAdults(2);
    setChildren(0);
    setBabies(0);
    setPets(0);
    setCalendarMode('Dates');
    setSelectedDate(null);
    setCalendarMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    setStep('ou');
  }

  function prevMonth() {
    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  function selectQuickDate(label: string) {
    setSelectedDate(null);
    setWhen(label);
  }

  function handleDaySelect(d: Date) {
    setSelectedDate(d);
    setWhen(formatDate(d));
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Où card */}
        {step === 'ou' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ou ?</Text>
            <View style={styles.searchInputWrap}>
              <Ionicons name="search-outline" size={16} color="#9B9B9B" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Lieu, restaurant, plat..."
                placeholderTextColor="#9B9B9B"
                value={location}
                onChangeText={setLocation}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={() => {
                  if (location.trim()) { setLocationLabel(location.trim()); setStep('quand'); }
                }}
              />
            </View>
            <Text style={styles.suggestionsLabel}>Suggestions de destinations</Text>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity key={s.title} style={styles.suggestion} onPress={() => s.title === 'Près de moi' ? handleNearMe() : selectLocation(s.title)}>
                <View style={styles.suggestionIcon} />
                <View>
                  <Text style={styles.suggestionTitle}>{s.title}</Text>
                  <Text style={styles.suggestionSub}>{s.sub}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TouchableOpacity style={styles.pill} onPress={() => setStep('ou')}>
            <Text style={styles.pillLabel}>Lieu</Text>
            <Text style={styles.pillValue}>{locationLabel}</Text>
          </TouchableOpacity>
        )}

        {/* Quand card */}
        {step === 'quand' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ou ?</Text>

            {/* Dates / Flexibles toggle */}
            <View style={styles.toggleRow}>
              {(['Dates', 'Flexibles'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.toggleBtn, calendarMode === t && styles.toggleBtnActive]}
                  onPress={() => setCalendarMode(t)}
                >
                  <Text style={[styles.toggleText, calendarMode === t && styles.toggleTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Calendar grid (Dates mode only) */}
            {calendarMode === 'Dates' && (
              <>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity onPress={prevMonth} hitSlop={12}>
                    <Ionicons name="chevron-back" size={20} color="#1A1A1A" />
                  </TouchableOpacity>
                  <Text style={styles.calendarMonth}>{formatMonth(calendarMonth)}</Text>
                  <TouchableOpacity onPress={nextMonth} hitSlop={12}>
                    <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
                  </TouchableOpacity>
                </View>

                <View style={styles.dayHeaders}>
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                    <Text key={i} style={styles.dayHeader}>{d}</Text>
                  ))}
                </View>

                <CalendarGrid
                  month={calendarMonth}
                  selectedDate={selectedDate}
                  onSelect={handleDaySelect}
                />
              </>
            )}

            {/* Quick buttons */}
            <View style={styles.quickBtnsRow}>
              <TouchableOpacity
                style={[styles.quickBtn, when === "Aujourd'hui" && !selectedDate && styles.quickBtnActive]}
                onPress={() => selectQuickDate("Aujourd'hui")}
              >
                <Text style={[styles.quickBtnText, when === "Aujourd'hui" && !selectedDate && styles.quickBtnTextActive]}>
                  {"Aujourd'hui"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickBtn, when === 'Demain' && !selectedDate && styles.quickBtnActive]}
                onPress={() => selectQuickDate('Demain')}
              >
                <Text style={[styles.quickBtnText, when === 'Demain' && !selectedDate && styles.quickBtnTextActive]}>
                  Demain
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={() => setStep('qui')}>
              <Text style={styles.confirmBtnText}>Confirmer</Text>
            </TouchableOpacity>
          </View>
        ) : step !== 'ou' ? (
          <TouchableOpacity style={styles.pill} onPress={() => setStep('quand')}>
            <Text style={styles.pillLabel}>Quand</Text>
            <Text style={styles.pillValue}>{when}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pill} onPress={() => setStep('quand')}>
            <Text style={styles.pillLabel}>Quand</Text>
            <Text style={styles.pillValue}>Ce soir</Text>
          </TouchableOpacity>
        )}

        {/* Qui card */}
        {step === 'qui' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ou ?</Text>
            <CounterRow label="Adultes" sub="13 ans et plus" value={adults} min={1} onChange={setAdults} />
            <CounterRow label="Enfants" sub="De 2 à 12 ans" value={children} onChange={setChildren} />
            <CounterRow label="Bébés" sub="Moins de 2 ans" value={babies} onChange={setBabies} />
            <CounterRow label="Animaux Domestiques" sub="Avez-vous un animal d'assistance ?" value={pets} onChange={setPets} last />
          </View>
        ) : (
          <TouchableOpacity style={styles.pill} onPress={() => setStep('qui')}>
            <Text style={styles.pillLabel}>Nombre de couverts</Text>
            <Text style={styles.pillValue}>{totalCovers} {totalCovers === 1 ? 'personne' : 'personnes'}</Text>
          </TouchableOpacity>
        )}

        {/* Available only toggle */}
        <TouchableOpacity style={styles.availableRow} onPress={() => setAvailableOnly(!availableOnly)}>
          <Text style={styles.availableText}>Afficher uniquement les tables disponibles</Text>
          <View style={[styles.checkbox, availableOnly && styles.checkboxActive]}>
            {availableOnly && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={clearAll}>
          <Text style={styles.clearText}>Tout effacer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Ionicons name="search-outline" size={18} color="#fff" />
          <Text style={styles.searchBtnText}>Rechercher</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── CalendarGrid ────────────────────────────────────────────────────────────

function CalendarGrid({ month, selectedDate, onSelect }: {
  month: Date;
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = startOfDay(new Date());
  const year = month.getFullYear();
  const monthIdx = month.getMonth();

  const offset = (new Date(year, monthIdx, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function isSel(day: number) {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === monthIdx &&
      selectedDate.getDate() === day;
  }

  function isPast(day: number) {
    return new Date(year, monthIdx, day) < today;
  }

  function isToday(day: number) {
    return new Date(year, monthIdx, day).getTime() === today.getTime();
  }

  return (
    <View style={calStyles.grid}>
      {Array.from({ length: cells.length / 7 }, (_, w) => (
        <View key={w} style={calStyles.week}>
          {cells.slice(w * 7, w * 7 + 7).map((day, col) => {
            if (!day) return <View key={col} style={calStyles.cell} />;
            const past = isPast(day);
            const sel = isSel(day);
            const tod = isToday(day);
            return (
              <TouchableOpacity
                key={col}
                style={[calStyles.cell, sel && calStyles.cellSel, tod && !sel && calStyles.cellToday]}
                onPress={() => !past && onSelect(new Date(year, monthIdx, day))}
                disabled={past}
                activeOpacity={0.7}
              >
                <Text style={[
                  calStyles.cellText,
                  past && calStyles.textPast,
                  sel && calStyles.textSel,
                  tod && !sel && calStyles.textToday,
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const calStyles = StyleSheet.create({
  grid: { marginBottom: 16 },
  week: { flexDirection: 'row', marginBottom: 2 },
  cell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  cellSel: { backgroundColor: '#E2231A' },
  cellToday: { borderWidth: 1.5, borderColor: '#E2231A' },
  cellText: { fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
  textPast: { color: '#D0D0D0' },
  textSel: { color: '#FFFFFF', fontWeight: '700' },
  textToday: { color: '#E2231A', fontWeight: '700' },
});

// ─── CounterRow ──────────────────────────────────────────────────────────────

function CounterRow({ label, sub, value, min = 0, onChange, last = false }: {
  label: string; sub: string; value: number; min?: number; onChange: (v: number) => void; last?: boolean;
}) {
  return (
    <View style={[counterRowStyles.row, !last && counterRowStyles.rowBorder]}>
      <View style={counterRowStyles.textWrap}>
        <Text style={counterRowStyles.label}>{label}</Text>
        <Text style={counterRowStyles.sub}>{sub}</Text>
      </View>
      <View style={counterRowStyles.controls}>
        <TouchableOpacity style={counterRowStyles.btn} onPress={() => onChange(Math.max(min, value - 1))}>
          <Text style={counterRowStyles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={counterRowStyles.value}>{value}</Text>
        <TouchableOpacity style={counterRowStyles.btn} onPress={() => onChange(value + 1)}>
          <Text style={counterRowStyles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const counterRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  textWrap: { flex: 1 },
  label: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  sub: { fontSize: 12, color: '#9B9B9B', marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  btn: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: '#D0D0D0',
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontSize: 18, color: '#1A1A1A', lineHeight: 22 },
  value: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', minWidth: 20, textAlign: 'center' },
});

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F0F0' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: Platform.OS === 'ios' ? 60 : 36, paddingBottom: 16, gap: 12 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 14 },
  searchInputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1A1A1A' },
  suggestionsLabel: { fontSize: 12, color: '#9B9B9B', marginBottom: 10 },
  suggestion: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  suggestionIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#F0F0F0' },
  suggestionTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  suggestionSub: { fontSize: 12, color: '#9B9B9B', marginTop: 2 },
  pill: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  pillLabel: { fontSize: 15, color: '#1A1A1A', fontWeight: '500' },
  pillValue: { fontSize: 15, color: '#9B9B9B' },
  // Quand card
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  toggleBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
  toggleText: { fontSize: 14, color: '#9B9B9B', fontWeight: '500' },
  toggleTextActive: { color: '#FFFFFF' },
  calendarHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  calendarMonth: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  dayHeaders: { flexDirection: 'row', marginBottom: 4 },
  dayHeader: { flex: 1, fontSize: 13, color: '#9B9B9B', fontWeight: '500', textAlign: 'center' },
  quickBtnsRow: { flexDirection: 'row', gap: 8, marginBottom: 16, marginTop: 4 },
  quickBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center',
  },
  quickBtnActive: { backgroundColor: '#E2231A', borderColor: '#E2231A' },
  quickBtnText: { fontSize: 13, color: '#1A1A1A' },
  quickBtnTextActive: { color: '#FFFFFF', fontWeight: '600' },
  confirmBtn: {
    backgroundColor: '#E2231A', borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  // Available
  availableRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  availableText: { fontSize: 14, color: '#1A1A1A', flex: 1, marginRight: 12 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#D0D0D0',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: '#E2231A', borderColor: '#E2231A' },
  // Bottom bar
  bottomBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#F0F0F0',
  },
  clearText: { fontSize: 15, color: '#1A1A1A', fontWeight: '500', textDecorationLine: 'underline' },
  searchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#E2231A', borderRadius: 28, paddingHorizontal: 28, paddingVertical: 14,
    shadowColor: '#E2231A', shadowOpacity: 0.35, shadowRadius: 10, elevation: 4,
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

