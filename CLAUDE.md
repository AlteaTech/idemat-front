# CLAUDE.md — idemat-front (Portail usager IDemat)

## ⛔ RÈGLES ABSOLUES — violations bloquantes

1. **Toujours demander explicitement avant de `git commit` ou `git push`.** Poser la question ("Je commit/push ?") et attendre une réponse explicite : "oui", "ok", "go", "valide". "On code" ou "vas-y" ne valent pas pour le commit.
2. **Jamais de fichier de migration Flyway (`VXX__xxx.sql`) sans autorisation explicite.** Une migration = `CREATE`/`ALTER TABLE` réel en base au prochain démarrage — irréversible en prod.
3. **Jamais de publication GitHub (issue, PR, commentaire) sans montrer le draft et attendre validation.**

---

Portail Angular citoyen/usager **IDemat** — permet aux usagers de s'inscrire, se connecter, consulter leur carte d'accès, leurs passages, les déchetteries, gérer leur compte.

Distinct du BO (`idbatv7-front`) qui est pour les agents/superviseurs.
Backend correspondant : module `api-idemat` dans `../idbatv7/` (port 8101)

---

## Commandes essentielles

```bash
cd idemat-front
npm run generate-client-local   # Regénère les services Angular depuis l'OpenAPI local (:8101)
npm start                        # Serveur dev sur :4201
npm run build                    # Build prod
```

---

## Stack technique

- Angular 20, **standalone components**, **OnPush**, **Signals**, **inject()**
- Angular Material
- Services agents dans `src/services/agents/idemat/` — connectés à l'API réelle (backend :8101). Certains endpoints complexes (multipart multi-fichiers, tableaux parallèles) utilisent `HttpClient` direct plutôt que le client OpenAPI généré — ne pas régénérer ces méthodes sans vérification
- Branchement/adaptation API = modifier uniquement ces fichiers, zéro composant à toucher
- Icônes : SVG personnalisés dans `public/` (Gauche.svg, Droite.svg, Immatriculation.svg, Picto corbeille.svg, Picto crayon.svg, User.svg, Code barres.svg, Autres cartes.svg, Carte de ville.svg…). Pas de mat-icon sauf icônes dynamiques (nav shell, logout, badge)

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
│   ├── forms/                 # Interfaces TypedFormGroup (FormGroup<XxxFormModel>)
│   └── *.model.ts             # Interfaces génériques
├── mocks/                     # Données de test
├── constantes/                # Routes, couleurs, grids, constantes métier
├── validateurs/               # Validateurs custom de formulaires
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

Si la couleur manque dans `_variables.scss`, l'y ajouter avec un nom sémantique avant de l'utiliser.

### 2b. Architecture SCSS — `_common.scss` pour les règles partagées

Chaque fichier SCSS composant commence obligatoirement par :

```scss
@use 'variables' as *;
@use 'common' as *;
```

`src/_common.scss` centralise toutes les règles répétées entre composants IDemat :
`.loading-screen`, `.page-container`, `.page-title`, `.page-titre-sous`, `.btn-retour`, `.bloc` et sa famille (`.bloc-header`, `.bloc-sous-titre`, `.bloc-row`, `.bloc-label`, `.bloc-valeur`, `.bloc-vide`), `.liste` et sa famille, `.full-width`, `.dialog-container` et sa famille, `.btn-annuler`, + `::ng-deep` Material (dialog shape 16px + form-field height 44px + repositionnement labels).

**Surcharge par cascade CSS** : pour une valeur différente d'une seule propriété, redéclarer **uniquement cette propriété** dans le fichier local — toutes les autres restent actives depuis `_common.scss`.

```scss
// _common.scss définit margin-bottom: 24px
// Le composant a besoin de 8px → surcharge locale :
.page-title { margin-bottom: 8px; }   // ✅ les autres propriétés (display, font-size…) restent
```

**Ce qui NE va PAS dans `_common.scss`** :
- `.btn-valider` — trop de variantes selon le contexte (dialog vs page)
- `:host { display: flex; ... }` — risque d'impacter les hosts de dialogs
- `max-width: 960px` sur `.page-container` — certains composants n'en ont pas

### 4. FormGroups toujours typés — interface dans models/forms/

Chaque `FormGroup` doit être typé via une interface dédiée dans `src/models/forms/`.

```typescript
// ✅ src/models/forms/connexion-idemat-form.model.ts
export interface ConnexionIdematFormModel {
  login: FormControl<string>;
  motdepasse: FormControl<string>;
}

// ✅ composant
protected form = new FormGroup<ConnexionIdematFormModel>({ ... });

// ❌ INTERDIT
protected form = new FormGroup({ login: new FormControl(''), ... });
```

Un fichier par interface FormModel, suffixe `-form.model.ts`.

### 5. Constantes arrays/objets dans src/constantes/

Toute constante déclarée dans un composant (tableau, objet) doit être externalisée dans `src/constantes/`.

```typescript
// ✅ src/constantes/inscription.constantes.ts
export const CIVILITES = ['M.', 'Mme', 'Autre'] as const;

// ✅ src/constantes/couleurs.constantes.ts
export const CHART_COLORS = { barHigh: '#ED6E57', ... } as const;

// ❌ INTERDIT — dans le composant
const CIVILITES = ['M.', 'Mme', 'Autre'];
```

### 6. Validateurs custom dans src/validateurs/

Toute fonction de validation custom doit aller dans `src/validateurs/`, jamais inline dans un composant.

```typescript
// ✅ src/validateurs/passwords-match.validator.ts
export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null { ... }

// ❌ INTERDIT — déclaré dans modification-mot-de-passe.component.ts
function passwordsMatchValidator(...) { ... }
```

### 7b. IDs du backend — toujours `number`, jamais `string`

Le backend expose les IDs en `Long`. Dans les modèles TypeScript, ils sont `number`. Ne jamais les convertir avec `String()` ni les déclarer en `string`.

```typescript
// ✅ Correct
export interface UsagerIdematModel {
  guid: number;
}
// guid: r.id!

// ❌ Interdit
export interface UsagerIdematModel {
  guid: string;
}
// guid: String(r.id)
```

### 7. Zéro code mort — supprimer, ne pas commenter

Routes, constantes, imports inutilisés → supprimer directement. Ne jamais laisser du code commenté dans `app.routes.ts` ou `routes.constantes.ts`.

```typescript
// ❌ INTERDIT
// {path: routesConstantes.dechetteries, component: DechetteriesComponent},

// ❌ INTERDIT dans routes.constantes.ts
resetMotDePasse: 'reset-password',  // jamais utilisé
```

### 3. Commit et push uniquement sur validation explicite de Ronald

Ne jamais lancer `git commit` ni `git push` sans que Ronald ait dit explicitement "ok", "valide", "go" ou équivalent. Montrer le code, attendre la validation, puis commiter.

---

## Conventions composants

- Tous les composants sont **standalone**
- **OnPush** systématique
- **Signals** pour l'état local
- **inject()** pour les dépendances
- Pattern spécifique mat-form-field : `::ng-deep .mdc-text-field--outlined { height: 44px }` + repositionnement `mdc-floating-label`

## Routes API backend IDemat (port 8101)

Convention : `@RequestMapping` = `/api/<NomController-sans-Idm-sans-Controller>` en kebab-case.

**Endpoints livrés (PR #177 + PR #178 + feature/idemat-bloc2) :**
| Route | Controller | Statut |
|---|---|---|
| `POST /api/inscription` | `InscriptionController` | ✅ |
| `POST /api/auth/login` | `AuthController` | ✅ |
| `POST /api/mot-de-passe` | `MotDePasseController` | ✅ |
| `POST /api/mot-de-passe/confirmer` | `MotDePasseController` | ✅ livré 2026-05-28 (#122) — public, sans JWT |
| `GET /api/contrat/by-url/{url}` | `ContratController` | ✅ |
| `GET /api/usager/me` | `UsagerController` | ✅ |
| `PUT /api/usager/profil` | `UsagerController` | ✅ |
| `PUT /api/usager/email` | `UsagerController` | ✅ |
| `PUT /api/usager/mot-de-passe` | `UsagerController` | ✅ |
| `GET /api/dechetterie` | `DechetterieController` | ✅ |
| `GET /api/dechetterie/{id}` | `DechetterieController` | ✅ |
| `POST /api/vehicule` | `VehiculeController` | ✅ |
| `DELETE /api/vehicule/{immat}` | `VehiculeController` | ✅ |
| `PUT /api/vehicule/{immat}` | `VehiculeController` | ✅ livré 2026-05-25 (#182) |
| `DELETE /api/usager` | `UsagerController` | ✅ |

Branchement/adaptation API = modifier uniquement `src/services/agents/idemat/` — zéro composant à toucher.

## Pages publiques (sans JWT) — pattern slug

Les pages publiques IDemat (`connexion-idemat`, `mot-de-passe-oublie`, `nouveau-mot-de-passe`, `inscription`) suivent toutes le même pattern de route : `<nom-page>/:contrat`. Le slug est lu depuis `this.route.paramMap` dans `ngOnInit()` et stocké dans `private contratSlug = ''`. **Toujours utiliser `this.contratSlug` dans toutes les navigations** (retour connexion, succès, etc.) — l'oublier = redirection vers `/connexion-idemat` sans slug.

```typescript
// ✅ Pattern correct
private contratSlug = '';

ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    this.contratSlug = params.get('contrat') ?? '';
  });
}

protected retourConnexion(): void {
  this.router.navigate([`/${routesConstantes.connexionIdemat}/${this.contratSlug}`]);
}
```

## Page lien invalide — gestion slug absent/erroné

Pages publiques à slug concernées (`connexion-idemat`, `creation-compte/:contrat`, `creation-compte/:contrat/:type`) : redirection vers `/lien-invalide` (`LienInvalideComponent`) si :
- `:contrat` absent dans `paramMap`, **ou**
- `getByUrl`/`getContratByUrl` échoue (slug inconnu → 400 backend)

Toujours `{replaceUrl: true}` sur ces `router.navigate()` : le slug invalide ne doit pas rester dans l'historique, sinon le bouton "Retour" (`location.back()`) de `LienInvalideComponent` rebondit en boucle sur la page d'erreur.

`mot-de-passe-oublie` est **hors scope** (décision Ronald, 2026-06-15).

`LienInvalideComponent` : page de layout custom (`.page`/`.card` sur `$primary-gradient`, pas de `@use 'common'`, même pattern que `demande-ok-idemat`). Icône `Carte de ville.svg` (asset Veolia, fill inversé en blanc). Bouton "Retour" = `location.back()` (`@angular/common Location`), aligné sur le `history.go(-1)` de la page d'erreur Veolia (`idemat-dev.recyclage.veolia.fr`).

## Intercepteur HTTP — comportement sur 401

`error.interceptor.ts` appelle `authService.logout()` sur tout 401, ce qui navigue vers `/connexion-idemat` **sans slug**. Conséquence : tout endpoint public appelé sans JWT doit être dans le `permitAll` de `SecurityConfig` côté back (`/api/mot-de-passe/**`, `/api/inscription`, etc.), sinon l'utilisateur est redirigé sans slug.

## Conventions shell mobile

- Bouton retour ← : `<button (click)="goBack()">` dans `idemat-shell.component.html`, masqué sur home via `@if (!isActive(routesConstantes.home))`
- `div.btn-icon-placeholder` (36px) pour symétrie quand le bouton retour est absent
- `LienNav.mobileOnly?: boolean` — items filtrés dans le shell quand `isDesktop()` (960px+)
- `.btn-retour` des composants (bouton "Retour" dans le contenu de la page) : masqué globalement sur mobile via `styles.scss` (`@media (max-width: 959px) { .btn-retour { display: none !important; } }`)
- Sous-titres utilisateur : `<p class="page-titre-sous">{{ usager()?.prenom }} {{ usager()?.nom }}</p>` sous le `<h1>` des pages de compte

## Conventions dialog Angular Material

Les interfaces `Data` et `Result` des dialogs Angular Material (`MAT_DIALOG_DATA`) doivent être dans `src/models/idemat/`, jamais inline dans le composant :
- `models/idemat/modifier-vehicule-dialog.model.ts` → `ModifierVehiculeDialogData` + `ModifierVehiculeDialogResult`
- `models/idemat/ajouter-vehicule-dialog.model.ts` → `AjouterVehiculeDialogData` + `AjouterVehiculeDialogResult`

## Statut PR en cours

- **PR #11** (`feature/idemat-portal-v1`) — portail complet blocs 1 & 2 + refonte maquette + shell mobile + METHODO, en attente de review lead
- **PR #14** (`feature/inscription-staging`) — inscription staging (#182) + mot de passe oublié (#122) + fix slug demande-ok

## Livraisons récentes (2026-05-29)

- `DemandOkIdematComponent` : fix `retourConnexion()` — slug contrat propagé via `router.lastSuccessfulNavigation?.extras?.state?.['contratUrl']` ou `history.state?.contratUrl`
- `inscription.component.ts` : passage du `contratUrl` dans le state de navigation vers `demande-ok` (`{ state: { contratUrl } }`)
- `vehicule-inscription-param.model.ts` : ajout `fileCarteGrise?: File`
- `inscription-idemat-service-agents.ts` : corrections envoi véhicules + kbis

## TODO prod (avant mise en production)

- Remplacer les adresses email hardcodées de test (`rrosier@altea-si.com`) par les vraies adresses dans le backend (`InscriptionIdmService.inscrire()` et `DemandeInscriptionService.valider()`)

## Convention commentaire sur les issues GitHub

Après chaque livraison (branche pushée), commenter l'issue avec :

1. **Branche livrée** — nom complet
2. **Ce qui est livré** — RG par RG si le ticket en contient (✅/⚠️ par point), sinon par composant/écran
3. **Ce qui reste** — arbitrages non résolus, endpoints manquants, points à valider
4. **Questions d'arbitrage** — décisions en attente (lead / BRI / MO), formulées explicitement avec le contexte
5. **Mode opératoire de test** si nécessaire — URL, slug de test, identifiants, étapes pas à pas

## Workflow git

Branche `main` → `feature/<description>` → PR vers `main` — relecture lead dev obligatoire.
