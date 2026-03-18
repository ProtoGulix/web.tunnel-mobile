# Changelog

## [1.0.0] — 18 mars 2026

Première version de l'application mobile Tunnel. Cette version couvre les besoins du terrain : suivi des interventions, saisie des actions et gestion des demandes d'achat.

---

### Accueil

- Page d'accueil avec indicateur de santé du serveur en temps réel
- Accès rapide aux sections principales (Interventions, Planning, Achats)

---

### Planning

- Vue semaine du planning avec navigation par jour
- Saisie d'une action depuis le planning : date, plage horaire, type, description, complexité
- Création en cascade depuis le formulaire d'action :
  - Création d'une DI (demande d'intervention) si aucune n'existe
  - Création d'une intervention liée à la DI
- Sélection de l'équipement avec recherche et indicateur de santé machine
- Champs pré-remplis et verrouillés quand le contexte est déjà connu (équipement, intervention)
- Durée calculée automatiquement à partir de la plage horaire

---

### Interventions

- Liste des interventions avec filtres et recherche
- Détail d'une intervention : statut, actions réalisées, statistiques (heures, DA, nombre d'actions)
- Changement de statut depuis le détail (Prendre en charge, Mettre en attente, Marquer résolu, Clôturer)
- Ajout d'une action directement depuis le détail de l'intervention
- Affichage des demandes d'achat rattachées à chaque action avec leur statut en temps réel

---

### Demandes d'achat (DA)

- Création d'une DA depuis n'importe où : page Achats, détail d'intervention, ou depuis une action
- Recherche d'articles dans le catalogue stock (référence, nom, niveau de stock, emplacement)
- Mode **demande spéciale** si l'article n'est pas dans le catalogue (saisie libre)
- Sélection de l'urgence (Normal / Élevée / Critique) et de l'unité
- Liaison automatique à une action quand créée depuis le détail d'une intervention
- Liste des DA avec statuts dérivés (À qualifier, À dispatcher, Commandé, Reçu, etc.)

---

### Interface générale

- Application mobile-first (optimisée pour utilisation sur smartphone en atelier)
- Navigation par onglets en bas d'écran
- Sélecteurs sous forme de tiroirs (bottom-sheet) sur toute l'application
- Confirmation avant de quitter un formulaire avec des données saisies
- Recherche avec debounce et états d'attente explicites (chargement, aucun résultat)
