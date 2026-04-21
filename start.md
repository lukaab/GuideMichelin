# 🚀 Michelin Quest — Guide de démarrage rapide (Dev)

---

## 🎯 Objectif

Créer rapidement un **MVP d’application gamifiée** (Michelin Quest) :

* mobile-first
* testable facilement
* prêt pour une démo hackathon

---

## 🛠️ Stack recommandée

### Frontend

* **React Native + Expo**
* TypeScript

👉 Avantages :

* 1 seul code pour mobile + web
* test rapide sur téléphone
* setup ultra rapide

---

### Backend (optionnel mais recommandé)

* **Supabase**

👉 Permet :

* base de données
* authentification
* stockage simple

---

## ⚙️ Installation du projet

### 1. Créer le projet

```bash
npx create-expo-app@latest michelin-quest
cd michelin-quest
```

---

### 2. Lancer le projet

```bash
npx expo start
```

---

## 📱 Tester l’application

### Option 1 (recommandée)

👉 Sur téléphone :

* scanner le QR code avec Expo Go

---

### Option 2

👉 Dans navigateur (preview web)

---

### Option 3

👉 Émulateur Android (si configuré)

---

## 🧱 Structure de projet conseillée

```bash
michelin-quest/
├── app/
│   ├── index.tsx
│   ├── profile.tsx
│   ├── restaurants.tsx
│   └── challenges.tsx
├── components/
│   ├── BadgeCard.tsx
│   ├── RestaurantCard.tsx
│   └── ProgressBar.tsx
├── data/
│   └── restaurants.json
├── lib/
│   └── supabase.ts
└── types/
    └── index.ts
```

---

## 📊 Données (MVP rapide)

Créer un fichier :

`data/restaurants.json`

```json
[
  {
    "id": 1,
    "name": "Restaurant Exemple",
    "city": "Paris",
    "category": "Bib Gourmand",
    "priceRange": "€€",
    "lat": 48.8566,
    "lng": 2.3522
  }
]
```

👉 Permet de développer sans API réelle

---

## 🔑 Fonctionnalités MVP à développer

### 1. Onboarding

* ville
* préférences
* budget

---

### 2. Liste / carte restaurants

* afficher restaurants proches
* filtres simples

---

### 3. Profil utilisateur

* XP
* badges
* progression

---

### 4. Badges

Exemples :

* First Star
* Bib Explorer
* City Hunter

---

### 5. Challenges

* visiter X restaurants
* explorer une zone

---

## 🧪 Tests à faire

### ✔ Test utilisateur

* navigation fluide
* actions fonctionnelles
* affichage correct

---

### ✔ Test logique

* ajout XP
* déblocage badges
* progression challenge

---

### ✔ Test affichage

* mobile
* écran desktop (démo)

---

## 🧠 Parcours utilisateur à valider

### Parcours 1

* ouvre app → voit restaurants

### Parcours 2

* visite resto → gagne XP

### Parcours 3

* débloque badge

### Parcours 4

* consulte challenges

---

## 🗓️ Plan hackathon

### Jour 1

* setup projet
* UI écrans principaux
* données mock

---

### Jour 2

* logique gamification
* polish UI
* préparation démo

---

## 🏁 Résumé

👉 Stack simple : Expo + React Native
👉 Test rapide : téléphone via QR code
👉 Focus : UX + gamification, pas perfection technique

> Objectif : une démo fluide et impactante, pas une app complète

---