# 🗺️ Michelin Quest — Roadmap de développement

---

## ✅ Setup (Fait)

- [x] Projet Expo + TypeScript initialisé (`michelin-quest/`)
- [x] Dépendances installées :
  - `expo-router` — navigation par fichiers
  - `expo-location` — géolocalisation
  - `react-native-maps` — carte interactive
  - `@supabase/supabase-js` — backend / auth / BDD
  - `@react-native-async-storage/async-storage` — stockage local
  - `react-native-url-polyfill` — compatibilité Supabase
  - `react-native-safe-area-context`, `react-native-screens` — UI système

---

## Phase 1 — MVP (Jour 1)

### 1.1 Structure de projet
- [ ] Créer l'arborescence :
  ```
  app/ components/ data/ lib/ types/
  ```
- [ ] Créer `data/restaurants.json` avec données mock (Paris, Lyon, Bordeaux)
- [ ] Créer `types/index.ts` — interfaces TypeScript (Restaurant, Badge, User, Challenge)
- [ ] Configurer `lib/supabase.ts` — client Supabase

---

### 1.2 Navigation (expo-router)
- [ ] `app/_layout.tsx` — layout racine avec TabNavigator
- [ ] 4 onglets : Explore / Profil / Challenges / Food Passport

---

### 1.3 Écran Onboarding
- [ ] Sélection de ville
- [ ] Préférences culinaires (checkboxes)
- [ ] Budget (€ / €€ / €€€)
- [ ] Stockage local des préférences (AsyncStorage)

---

### 1.4 Écran Explore — Carte interactive
- [ ] `app/index.tsx` — MapView centré sur position utilisateur
- [ ] Marqueurs restaurants (react-native-maps)
- [ ] Filtres : catégorie (Étoilé / Bib Gourmand), budget, type de cuisine
- [ ] Tap sur marqueur → fiche restaurant (bottom sheet)
- [ ] Composant `RestaurantCard.tsx`

---

### 1.5 Profil utilisateur
- [ ] `app/profile.tsx` — affichage XP, niveau, badges
- [ ] Barre de progression XP (`ProgressBar.tsx`)
- [ ] Grille de badges (`BadgeCard.tsx`)
- [ ] Historique des restaurants visités

---

## Phase 2 — Gamification (Jour 1–2)

### 2.1 Système XP
- [ ] Logique : visite restaurant → +100 XP
- [ ] Logique : interaction (avis) → +50 XP
- [ ] Calcul de niveau basé sur XP total
- [ ] Persister dans AsyncStorage (puis Supabase)

---

### 2.2 Badges
- [ ] Définir les badges dans `data/badges.json` :
  - **First Star** — 1er restaurant étoilé visité
  - **Bib Explorer** — 5 Bib Gourmand testés
  - **City Hunter** — 3 villes explorées
  - **Trend Seeker** — 3 restaurants populaires
- [ ] Logique de déblocage automatique au check-in
- [ ] Notification de badge débloqué (animation)

---

### 2.3 Challenges
- [ ] `app/challenges.tsx` — liste des défis actifs
- [ ] Challenges hebdomadaires :
  - Visiter 2 restaurants cette semaine
  - Explorer un nouveau quartier
  - Essayer une nouvelle cuisine
- [ ] Barre de progression par challenge
- [ ] Bonus XP à la complétion

---

### 2.4 Food Passport
- [ ] `app/passport.tsx` — carnet digital
- [ ] Liste des restaurants visités avec date
- [ ] Objectifs en cours avec % progression
- [ ] Design style "carnet de voyage"

---

## Phase 3 — Polish UI & Démo (Jour 2)

### 3.1 Design system
- [ ] Palette Michelin (rouge `#E2231A`, noir, blanc, or)
- [ ] Typographie cohérente
- [ ] Animations : badge unlock, gain XP, transition d'écrans

### 3.2 Données mock enrichies
- [ ] 15–20 restaurants fictifs réalistes (Paris, Lyon, Nice)
- [ ] Photos placeholder via `picsum.photos`
- [ ] Catégories variées : 1★, 2★, 3★, Bib Gourmand

### 3.3 Tests parcours utilisateurs
- [ ] Parcours 1 : ouvre app → voit la carte → clique un restaurant
- [ ] Parcours 2 : check-in restaurant → gagne XP → barre monte
- [ ] Parcours 3 : débloque badge "First Star" → animation
- [ ] Parcours 4 : consulte challenges → voit progression

---

## Phase 4 — Backend Supabase (optionnel / post-démo)

- [ ] Créer projet Supabase
- [ ] Tables : `users`, `restaurants`, `visits`, `badges`, `challenges`
- [ ] Authentification email / Google OAuth
- [ ] Sync des données locales → cloud
- [ ] Leaderboard entre amis (classement social)
- [ ] Partage de badges (deep link)

---

## Phase 5 — Features avancées (post-MVP)

- [ ] Recommandations IA (basées sur historique)
- [ ] Récompenses partenaires (QR code en restaurant)
- [ ] Intégration TikTok / Instagram (partage automatique)
- [ ] Notifications push (nouveau challenge, badge proche)
- [ ] Mode offline (cache des données)

---

## 📦 Stack résumée

| Couche | Techno |
|---|---|
| Frontend | React Native + Expo SDK 54 |
| Langage | TypeScript |
| Navigation | expo-router (file-based) |
| Carte | react-native-maps |
| Géoloc | expo-location |
| Backend | Supabase |
| Auth | Supabase Auth |
| Stockage local | AsyncStorage |

---

## 🏁 Priorités hackathon

1. **Carte + restaurants mock** → impression visuelle immédiate
2. **Check-in + XP** → démontre la gamification
3. **Badge débloqué** → moment "wow" pour le jury
4. **Profil propre** → synthèse claire de la progression
