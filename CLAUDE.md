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
| `POST /api/auth/refresh` | `AuthController` | ✅ livré 2026-07-10 (#277) — rafraîchit le JWT (30min glissantes) |
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

**Route connexion : `/:contrat`** (slug à la racine — contrainte Veolia : `idemat-dev.recyclage.veolia.fr/testRRO`). Implémentée via `isContratSlugGuard` (`canMatch`) dans `src/app/core/guards/is-contrat-slug.guard.ts`.

Les autres pages publiques gardent leur préfixe : `mot-de-passe-oublie/:contrat`, `creation-compte/:contrat`, `nouveau-mot-de-passe/:contrat`.

Le slug est lu depuis `this.route.paramMap` dans `ngOnInit()` et stocké dans `private contratSlug = ''`. **Toujours utiliser `this.contratSlug` directement dans les navigations retour** — plus de `routesConstantes.connexionIdemat` (constante supprimée).

```typescript
// ✅ Pattern correct — retour connexion
protected retourConnexion(): void {
  this.router.navigate(['/' + this.contratSlug]);
}
```

**Slug en localStorage :** `ConnexionIdematComponent` persiste le slug dans `storagesConstantes.contratSlug` (`'contrat_slug_idemat'`) après `getByUrl` réussi. `authGuard` et `AuthService.logout()` le lisent pour naviguer vers `/${slug}` (fallback `lienInvalide` si absent).

## Page lien invalide — gestion slug absent/erroné

Toutes les pages publiques à slug (`/:contrat`, `creation-compte/:contrat`, `creation-compte/:contrat/:type`, `mot-de-passe-oublie/:contrat`, `nouveau-mot-de-passe/:contrat`) : redirection vers `/lien-invalide` (`LienInvalideComponent`) si :
- `:contrat` absent dans `paramMap`, **ou**
- `getByUrl`/`getContratByUrl` échoue (slug inconnu → 400 backend)

Toujours `{replaceUrl: true}` sur ces `router.navigate()` : le slug invalide ne doit pas rester dans l'historique, sinon le bouton "Retour" (`location.back()`) de `LienInvalideComponent` rebondit en boucle sur la page d'erreur.

`LienInvalideComponent` : page de layout custom (`.page`/`.card` sur `$primary-gradient`, pas de `@use 'common'`, même pattern que `demande-ok-idemat`). Icône `Carte de ville.svg` (asset Veolia, fill inversé en blanc). Bouton "Retour" = `location.back()` (`@angular/common Location`), aligné sur le `history.go(-1)` de la page d'erreur Veolia (`idemat-dev.recyclage.veolia.fr`).

## Intercepteur HTTP — comportement sur 401

`error.interceptor.ts` appelle `authService.logout()` sur tout 401. `logout()` lit `storagesConstantes.contratSlug` depuis le localStorage et navigue vers `/${slug}` (fallback `/lien-invalide`). Conséquence : tout endpoint public appelé sans JWT doit être dans le `permitAll` de `SecurityConfig` côté back (`/api/mot-de-passe/**`, `/api/inscription`, etc.), sinon l'utilisateur est redirigé en boucle.

## Session JWT glissante 30min (#277, livré 2026-07-10)

Le token JWT est passé de 24h fixe à **30min glissantes** (durée pilotée par `jwt.expiration-web-ms` côté back, `api-idemat/application.properties`). `AuthService` (`src/services/auth/auth.service.ts`) :
- détecte l'activité réelle (`click`/`keydown`/`visibilitychange` sur `document`, throttlé par un simple timestamp `lastActivityAt`)
- toutes les 60s (`setInterval`), si activité dans les 60 dernières secondes → appelle `AuthenticationServiceAgents.refreshToken()` (`POST /api/auth/refresh`) et remplace le JWT en storage
- sinon laisse la session expirer naturellement (pas de logout forcé sur échec de refresh — c'est `isTokenExpired` + le 401 existant qui restent seuls responsables)
- **pas de plafond de session absolu** (décision Jérémie) : tant qu'il y a de l'activité, la session glisse indéfiniment

⚠️ **Piège** : `isTokenExpired()` avait une marge de sécurité codée en dur à **1h** (pensée pour l'ancien token 24h). Avec un token de 30min, cette marge doit être largement inférieure à la durée du token — passée à **1min**. Toute nouvelle modification de la durée du token doit revérifier ce ratio (marge ≪ durée token), sinon le token peut apparaître "expiré" dès sa réception.

⚠️ **Drift générateur OpenAPI découvert en implémentant `/refresh`** : le dossier `src/core/api/` contenait un fichier orphelin `auth-idm-controller.service.ts` (classe `AuthIdmControllerService`, DTOs `LoginIdmRequest`/`LoginIdmResponse`) que `ConnexionIdematComponent` et `AuthenticationServiceAgents.authenticateUser()` utilisent encore pour le login. Une régénération actuelle (`npm run generate-client-local`) ne produit plus ce fichier — le controller réel s'appelle `AuthController` côté back et génère `auth-controller.service.ts` (`AuthControllerService`, DTOs `LoginDioRequest`/`LoginDio`). Les deux sont fonctionnellement identiques (mêmes champs JSON `courriel`/`motDePasse`/`token`), donc pas de bug actif, mais **le login et le refresh utilisent aujourd'hui deux classes générées différentes pour le même endpoint** (`refreshToken()` a été branché sur la version à jour `AuthControllerService`, volontairement pas de refactor du login existant pour ne pas risquer une régression hors scope). À nettoyer à l'occasion : basculer le login sur `AuthControllerService` et supprimer `auth-idm-controller.service.ts` + `login-idm-request.ts`/`login-idm-response.ts`.

## Conventions shell mobile

- Bouton retour ← : `<button (click)="goBack()">` dans `idemat-shell.component.html`, masqué sur home via `@if (!isActive(routesConstantes.home))`
- `div.btn-icon-placeholder` (36px) pour symétrie quand le bouton retour est absent
- `LienNav.mobileOnly?: boolean` — items filtrés dans le shell quand `isDesktop()` (960px+)
- `.btn-retour` des composants (bouton "Retour" dans le contenu de la page) : masqué globalement sur mobile via `styles.scss` (`@media (max-width: 959px) { .btn-retour { display: none !important; } }`)
- Sous-titres utilisateur : `<p class="page-titre-sous">{{ usager()?.prenom }} {{ usager()?.nom }}</p>` sous le `<h1>` des pages de compte

## Conventions dialog Angular Material

Les interfaces `Data` et `Result` des dialogs Angular Material (`MAT_DIALOG_DATA`) doivent être dans `src/models/idemat/`, jamais inline dans le composant :
- `models/idemat/ajouter-vehicule-dialog.model.ts` → `AjouterVehiculeDialogData` + `AjouterVehiculeDialogResult`

## Statut PR en cours (vérifié 2026-07-10)

- **PR [#27](https://github.com/AlteaTech/idemat-front/pull/27)** — logo contrat centré + redimensionné (sidenav desktop + header mobile, 72px), issue #261. **Ouverte**, en attente du test de Bertrand (autre téléphone, XCover IDbat) pour trancher un doute sur le fix `image-orientation: from-image` (présent sur Passages, absent sur Signalements — pas encore tranché si c'est un vrai gap ou pas).
- **PR [#28](https://github.com/AlteaTech/idemat-front/pull/28)** — mergée puis **revertée par Jérémie** (`cfa084d`, 2026-07-10) : le squelette WIP sprint 10 n'a plus lieu d'être, la préparation passe directement au sprint 11. Voir section "Squelette WIP" ci-dessous, retirée du code.
- **PR [#29](https://github.com/AlteaTech/idemat-front/pull/29)** — **mergée** — affichage points (#130/#267) sur écran Passages & Points : total + détail par matière, valeurs à 0 en attendant la formule de calcul back/mobile.
- **PR [#30](https://github.com/AlteaTech/idemat-front/pull/30)** — session JWT glissante 30min (#277), voir section dédiée ci-dessus. **Ouverte**, vers `develop`.

## Squelette WIP sprint 10 — reverté (2026-07-10)

La route `home` a pointé temporairement vers `WipComponent` (page plein écran "IDemat en cours de développement", hors shell) entre PR #28 et son revert par Jérémie (`cfa084d`) — **entièrement retiré du code**, `HomeComponent` est de nouveau la route active. Ne pas réintroduire ce pattern sans redemander.

## Règle métier — zones J1/F3 et carte grise (ajout de véhicule)

- **zoneJ1/zoneF3** : affichés et obligatoires **uniquement** si `contrat.demandeZoneJ1F3` est actif — **jamais** lié à PART/PRO (erreur corrigée par PR #25, ne pas réintroduire ce raccourci).
- **carteGrise** (fichier) : obligatoire côté front pour **tout** ajout de véhicule (PART et PRO, indépendamment du flag J1/F3) — bloqué par `erreurFichier` dans `AjouterVehiculeDialogComponent`. ⚠️ Aucun contrôle équivalent côté back (champ nullable dans les DTOs `AjouterVehiculeDioRequest`/`VehiculeInscriptionDioRequest`) — gap de validation identifié, pas corrigé, décision à prendre.

## TODO prod (avant mise en production)

- Remplacer les adresses email hardcodées de test (`rrosier@altea-si.com`) par les vraies adresses dans le backend (`InscriptionIdmService.inscrire()` et `DemandeInscriptionService.valider()`)

## Convention commentaire sur les issues GitHub

Après chaque livraison (branche pushée), commenter l'issue avec :

1. **Branche livrée** — nom complet
2. **Ce qui est livré** — RG par RG si le ticket en contient (✅/⚠️ par point), sinon par composant/écran
3. **Ce qui reste** — arbitrages non résolus, endpoints manquants, points à valider
4. **Questions d'arbitrage** — décisions en attente (lead / BRI / MO), formulées explicitement avec le contexte
5. **Mode opératoire de test** si nécessaire — URL, slug de test, identifiants, étapes pas à pas

## Directives (src/directives/) — référence

| Directive | Selector | Effet |
|---|---|---|
| `MajusculeOnlyDirective` | `MajusculeOnly` | Force la saisie en majuscules |
| `AlphaNumOnlyDirective` | `AlphaNumOnly` | Bloque tout caractère non alphanumérique |
| `ChiffresOnlyDirective` | `ChiffresOnly` | Bloque tout caractère non numérique (0-9 uniquement, pas de virgule, pas de E+) |

Pattern commun : `@HostListener('input')` → `replace(regex, '')` → `setValue(valeurNettoyee, {emitEvent: false})` + `setSelectionRange`.

## Pipes (src/pipes/) — référence

| Pipe | Usage |
|---|---|
| `LinkifyPipe` | `[innerHTML]="texte | linkify"` — transforme les URLs brutes en `<a target="_blank">`. Utilise `DomSanitizer.bypassSecurityTrustHtml`. |

## Workflow git

Branche `develop` → `feature/<description>` ou `fix/<description>` → PR vers `develop` — relecture lead dev obligatoire.
