# CLAUDE.md — idemat-front (Portail usager IDemat)

Portail Angular citoyen/usager **IDemat** — permet aux usagers de s'inscrire, se connecter, consulter leur carte d'accès, leurs passages, les déchetteries, gérer leur compte.

Distinct du BO (`idbatv7-front`) qui est pour les agents/superviseurs.
Backend correspondant : module `api-idemat` dans `../idbatv7/` (port 8101)

---

## Commandes essentielles

```bash
cd idemat-front
npm start       # Serveur dev sur :4201
npm run build   # Build prod
```

---

## Stack technique

- Angular 20, **standalone components**, **OnPush**, **Signals**, **inject()**
- Angular Material
- Services agents **mockés** dans `src/services/agents/idemat/` — API backend IDemat pas encore connectée
- Branchement sur la vraie API = modifier uniquement les fichiers `services/agents/idemat/`, zéro composant à toucher

---

## Architecture src/

```
src/
├── app/                       # Composants (un dossier par écran)
├── services/
│   ├── agents/idemat/         # Services mockés — TODO: brancher sur l'API réelle
│   └── *.service.ts           # Services utilitaires
├── models/
│   ├── idemat/                # Interfaces/modèles spécifiques IDemat
│   └── *.model.ts             # Interfaces génériques
├── mocks/                     # Données de test
├── constantes/
├── interceptors/
├── core/api/                  # ⛔ Client OpenAPI idbatv7 — ne pas modifier
└── environments/
```

---

## ⛔ RÈGLES ABSOLUES — violations = PR refusée

### 1. Un fichier par classe ou interface — toujours

Chaque interface, classe ou type va dans son propre fichier. **Jamais** déclaré inline dans un composant.

```
✅ models/idemat/horaire-jour.model.ts     → export interface HoraireJour {}
✅ models/idemat/affluence-jour.model.ts   → export interface AffluenceJour {}
✅ models/tuile-menu.model.ts              → export interface TuileMenu {}

❌ home.component.ts                       → interface TuileMenu { ... }   // INTERDIT
❌ dechetterie-idemat.model.ts             → interface A {} + interface B {}  // INTERDIT
```

### 2. Zéro couleur codée en dur dans les SCSS — toujours les variables

Toutes les couleurs sont dans `src/_variables.scss`. Aucune valeur hex dans un `.scss` de composant.

```scss
✅ color: $text-color-dark;
✅ background: $primary-color-background;
✅ background: $primary-gradient;

❌ color: #333;                // INTERDIT
❌ background: #fef2ef;        // INTERDIT
❌ background: linear-gradient(150deg, #FBCAB6 ...);  // INTERDIT
```

**Toujours commencer chaque fichier SCSS par :**
```scss
@use 'variables' as *;
```

Si la couleur manque dans `_variables.scss`, l'y ajouter avec un nom sémantique avant de l'utiliser.

### 3. Commit et push uniquement sur validation explicite de Ronald

Ne jamais lancer `git commit` ni `git push` sans que Ronald ait dit explicitement "ok", "valide", "go" ou équivalent. Montrer le code, attendre la validation, puis commiter.

---

## Conventions composants

- Tous les composants sont **standalone**
- **OnPush** systématique
- **Signals** pour l'état local
- **inject()** pour les dépendances
- Pattern spécifique mat-form-field : `::ng-deep .mdc-text-field--outlined { height: 44px }` + repositionnement `mdc-floating-label`

## Statut PR en cours

- **PR #11** (`feature/idemat-portal-v1`) — portail v1 complet, en attente de review lead

## Workflow git

Branche `main` → `feature/<description>` → PR vers `main` — relecture lead dev obligatoire.
