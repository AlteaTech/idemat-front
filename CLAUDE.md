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

## Statut PR en cours (vérifié 2026-07-22 tard)

- **PR [#27](https://github.com/AlteaTech/idemat-front/pull/27)** — logo contrat centré + redimensionné (sidenav desktop + header mobile, 72px), issue #261. **Ouverte**, en attente du test de Bertrand (autre téléphone, XCover IDbat) pour trancher un doute sur le fix `image-orientation: from-image` (présent sur Passages, absent sur Signalements — pas encore tranché si c'est un vrai gap ou pas).
- **PR [#28](https://github.com/AlteaTech/idemat-front/pull/28)** — mergée puis **revertée par Jérémie** (`cfa084d`, 2026-07-10) : le squelette WIP sprint 10 n'a plus lieu d'être, la préparation passe directement au sprint 11. Voir section "Squelette WIP" ci-dessous, retirée du code.
- **PR [#29](https://github.com/AlteaTech/idemat-front/pull/29)** — **mergée** — affichage points (#130/#267) sur écran Passages & Points : total + détail par matière, valeurs à 0 en attendant la formule de calcul back/mobile.
- **PR [#30](https://github.com/AlteaTech/idemat-front/pull/30)** — session JWT glissante 30min (#277), voir section dédiée ci-dessus. **Ouverte**, vers `develop`.
- **PR [#33](https://github.com/AlteaTech/idemat-front/pull/33)** à **[#41](https://github.com/AlteaTech/idemat-front/pull/41)** — toutes **mergées** dans `develop` le 2026-07-22 : #33 (linkify), #34 (police mat-dialog + popup suppression compte — a nécessité un merge de `develop` en cours de route pour résoudre un conflit sur `styles.scss`, deux ajouts indépendants à la même liste de sélecteurs `font-family`, les deux conservés), #35 (chevauchement/SIRET inscription), #36-#39 (#292-#295), #40 (alignement largeur écrans compte, sans ticket), #41 (#296 cartes code-barres + déplacement ajout véhicule — suivi d'un fix de rafraîchissement de liste après ajout/suppression, voir section dédiée ci-dessous). Détail RG par RG dans CLAUDE.md idbatv7, section "Vague de petits fix fin de projet (2026-07-22)".
- **PR [#42](https://github.com/AlteaTech/idemat-front/pull/42)** (#306, mergée 2026-07-23) — écran intermédiaire "Mon compte" (`informations-personnelles`) bypassé : profil (header desktop) et item "Mon compte" (menu mobile) mènent directement à Paramètres du compte, retitré "Mon compte". Bouton "Modifier le profil" masqué (route conservée). Retour de Paramètres du compte → accueil.
- **PR [#43](https://github.com/AlteaTech/idemat-front/pull/43)** (#308, mergée 2026-07-23) — confirmation (Annuler/Valider) avant suppression d'un véhicule sur `/carte-acces`, nouveau dialog `ConfirmationSuppressionVehiculeComponent` calqué sur `ConfirmationSuppressionCompteComponent`.
- **PR [#45](https://github.com/AlteaTech/idemat-front/pull/45)** à **[#49](https://github.com/AlteaTech/idemat-front/pull/49)** — toutes **mergées** : #45 (#315 notification inscription multi-destinataires), #46 (#324 contratId envoyé au login), #47 (#334 scroll login), #48 (#276 Payfip wording + déclencheur réconciliation), #49 (#337 scroll sur 5 écrans supplémentaires — même piège CSS que #334, `min-height:100vh` + padding sans `box-sizing:border-box`).
- **PR [#50](https://github.com/AlteaTech/idemat-front/pull/50)** (#342, ouverte 2026-08-01, vers `release/sprint12`) — suite au changement de mécanisme back (mot de passe oublié : génération directe au lieu d'un lien), `NouveauMotDePasseComponent`/route/`confirmerResetPassword()` supprimés (plus aucun appelant). Voir CLAUDE.md idbatv7 pour le détail complet des RG. Bug Swagger sans rapport signalé au passage (`AchatPassagesController.retournerPaiementPayfip` retourne un `RedirectView` brut, pollue toute régénération du client de dizaines de modèles absurdes) — pas corrigé, hors scope.

**Toutes mergées le 2026-08-04** (`release/sprint12`) — chacune était passée `CONFLICTING` en attendant review (branche restée ouverte plusieurs jours pendant que `release/sprint12` avançait), résolue avant merge :
- **PR [#50](https://github.com/AlteaTech/idemat-front/pull/50)** (#342) — retrait du flux "nouveau mot de passe par lien", devenu mort (voir CLAUDE.md idbatv7, chantier #342/RG1-RG4). Conflit sur `usager-idemat-service-agents.ts` : le service généré avait été renommé (`MotDePasseIdmControllerService`→`MotDePasseControllerService`, convention sans suffixe `Idm`) et `confirmerReset` supprimé côté client généré — la version `develop` gardait à tort `HttpClient`/`Configuration` pour un `confirmerResetPassword()` déjà mort sur cette branche.
- **PR [#51](https://github.com/AlteaTech/idemat-front/pull/51)** — reset password ne transmettait pas `contratId` au back (bug signalé par Jérémie, cause racine détaillée dans CLAUDE.md idbatv7). `mot-de-passe-oublie-idemat.component.ts` transmet désormais l'id du contrat résolu depuis le slug d'URL.
- **PR [#52](https://github.com/AlteaTech/idemat-front/pull/52)** — client OpenAPI nettoyé suite au fix back du bug `RedirectView` (voir CLAUDE.md idbatv7) — `achat-passages-controller.service.ts` apparaît enfin proprement dans le client généré.

## Piège — fichiers générés orphelins après un renommage de classe côté back (découvert 2026-08-03)

`npm run generate-client-local` **n'efface jamais** les fichiers d'une génération précédente qui ne correspondent plus au spec actuel — il ajoute/écrase, mais ne nettoie pas. Repéré sur `mot-de-passe-idm-controller.service.ts` (+ son modèle `ResetPasswordIdmRequest`) : ancien nom de classe (`MotDePasseIdmControllerService`), généré avant le retrait du suffixe "Idm" côté back, jamais supprimé du disque — le code (`UsagerIdematServiceAgents`) l'importait toujours au lieu du bon service à jour (`MotDePasseControllerService`, `mot-de-passe-controller.service.ts`), avec un type de requête périmé (sans `contratId`).

**Réflexe généralisable** : après toute régénération suite à un renommage de controller/DTO côté back, vérifier `git status` sur `src/core/api/` pour repérer d'éventuels fichiers **orphelins non modifiés** (ancien nom encore présent sur disque, non référencé dans `api.ts`/`models.ts` régénérés) — ils compilent souvent silencieusement (l'ancien code les importe toujours) sans qu'on remarque qu'on tape sur une version obsolète du contrat d'API.

## Piège — validation "live" vs "lostfocus" cohabitant sur un même formulaire (#292, 2026-07-22)

Un `ErrorStateMatcher` fourni au niveau du `@Component` (`providers: [{provide: ErrorStateMatcher, useClass: ...}]`) s'applique à **tous** les champs du formulaire. Si un seul champ doit se comporter différemment (ex. SIRET : validation en direct dès la frappe, comme le fait le BO par défaut — sans `ErrorStateMatcher` custom, Material utilise `dirty || touched`), ne pas changer le matcher global : donner un `[errorStateMatcher]` **local** à ce seul `<input matInput>`, avec une classe dédiée (`dirty || touched`), en laissant le matcher global (`touched` seul, demande Bertrand) pour tout le reste du formulaire.

## Pattern — icônes SVG statiques (`<img src>`) : pas d'accès aux variables SCSS

Les icônes du dossier `public/*.svg` (`Carte.svg`, `Code barres.svg`, `User.svg`…) sont chargées via `<img src="...">`, des fichiers statiques totalement isolés d'Angular — **impossible** d'y référencer une variable SCSS (`$text-color-muted` etc.), même en théorie. La couleur est codée en dur (`fill="..."`) dans le fichier SVG lui-même. Pour uniformiser la couleur de plusieurs icônes d'un même écran, comparer et aligner les valeurs `fill` des fichiers SVG un par un — pas de solution CSS.

Pour qu'une icône suive vraiment une variable SCSS, il faudrait l'inliner en `<svg>` dans le template (`fill="currentColor"`, couleur héritée via `color` CSS du parent) au lieu de `<img src>` — refactor plus large, pas fait à ce jour (#295).

## Pattern — couleur d'un `mat-slide-toggle` (ou tout composant Material) qui ne rend pas la vraie couleur de marque

Le thème M3 global (`mat.theme()` dans `styles.scss`) utilise une palette Material générique (`mat.$rose-palette`) qui ne correspond pas à `$primary-color` (#ED6E57) réel. **Ne jamais changer le thème global pour corriger ça** (risque de casser d'autres composants app-wide) — utiliser les overrides ciblés par composant Material, ex. pour les toggles :

```scss
@include mat.slide-toggle-overrides((
  selected-track-color: $primary-color,
  unselected-track-color: white,
  // ...
));
```
Pattern déjà en place côté BO (`idbatv7-front/styles.scss`) pour les mêmes raisons — reproduit à l'identique côté IDemat (#294).

## Pattern — centrage horizontal : toujours `max-width` sur `.page-container`, jamais sur un enfant

`.page-container` (global, `_common.scss`) se centre lui-même via `width: 50%; margin: 0 auto`. Si un écran a besoin d'une largeur différente, poser le `max-width` **sur `.page-container` lui-même** (surcharge locale dans le composant), jamais sur un `div.contenu` enfant — sinon ce dernier ne se centre pas (il colle au bord gauche de la boîte large du parent), créant un désalignement horizontal entre écrans qui devraient pourtant être visuellement cohérents (repéré sur "Modifier le profil"/"Paramètres du compte" vs "Mon compte", 2026-07-22).

## Écran "Mes accès" (`carte-acces`) — ajout/suppression de véhicule (2026-07-22)

Déplacé depuis "Modifier le profil" (accord Ronald, anticipation des tickets à venir annoncés par Bertrand sur cet écran — voir issue #296). Même logique exacte que l'ancien emplacement (dialog `AjouterVehiculeDialogComponent`, `usagerService.addVehicule()`/`deleteVehicule()`) : "Modifier le profil" ne gère plus les véhicules du tout. Bloc "Véhicules" toujours gaté par `allowImmatriculationsParticuliers`/`allowImmatriculationsProfessionnels`, mais affiché même à 0 véhicule (pour permettre le premier ajout).

⚠️ **Bug corrigé le 2026-07-22 (même PR #41)** : après ajout/suppression, la liste ne se rafraîchissait pas fiablement. Le code patchait localement le signal `usager` (concat/filter manuel sur `vehicules`) au lieu de relire la source de vérité — fragile et sans gestion d'erreur (un échec HTTP silencieux donnait l'impression que rien ne s'était passé). **Pattern à privilégier pour toute mutation de liste (ajout/suppression) : recharger l'entité complète depuis le back (`usagerService.getUsager().subscribe(u => this.usager.set(u))`) plutôt que patcher l'état local à la main**, et toujours ajouter un handler `error` (même juste `console.error`) sur les `subscribe()` de mutation — son absence est indétectable côté UI (pas d'erreur visible, juste "rien ne se passe").

## Pattern — dialog de confirmation dédié par action destructrice (#308, 2026-07-23)

Pas de service de confirmation générique côté IDemat (contrairement à `ConfirmationService` du BO idbatv7-front) — chaque action destructrice a son propre petit composant dialog, calqué sur `ConfirmationSuppressionCompteComponent` (`dialog-container`/`dialog-header`/`actions-row`/`btn-annuler`+`btn-supprimer`, classes déjà globales via `_common.scss` sauf `.btn-supprimer` à redéfinir). `ConfirmationSuppressionVehiculeComponent` reprend ce pattern à l'identique avec un message paramétré via `MAT_DIALOG_DATA` (`{immatriculation: string}`). Pour toute nouvelle action de suppression : dupliquer ce pattern (nouveau composant, pas de service partagé à créer sauf si un 3e cas identique apparaît).

## Écran "Mon compte" (`informations-personnelles`) — bypassé (#306, 2026-07-23)

Avec un seul lien restant après le masquage de "Modifier le profil" (#306), l'écran intermédiaire ne se justifiait plus : le profil (header desktop, `top-bar-user`) et l'item "Mon compte" (menu mobile) mènent maintenant directement à `parametresCompte` (retitré "Mon compte"). Route/composant `informations-personnelles` conservés (rollback possible), juste plus liés nulle part — même pattern que "écran livré en avance sur son sprint" mais pour un écran devenu inutile plutôt que pas encore prêt. Retour de Paramètres du compte → accueil (pas vers l'écran bypassé).

## Piège — `ng serve` qui ne recharge plus après des opérations git (stash/checkout) mi-session

Le serveur dev peut cesser de rebuilder silencieusement après des changements de branche/stash sur le même repo pendant qu'il tourne — repéré en cherchant pourquoi un fix (rafraîchissement véhicule, ci-dessus) semblait "ne pas fonctionner" alors que le code était correct : le dernier rebuild du log datait de plus de 2h, avant l'édition. **Réflexe** : après tout `git stash`/`checkout`/`branch` sur un repo dont le dev server tourne, vérifier le timestamp du dernier "Application bundle generation complete" dans son log avant de conclure à un bug applicatif — si le serveur n'a pas rebuild depuis l'édition, le redémarrer (`kill` + `nohup npm start &`) avant de chercher plus loin. Même famille de piège que le `bootRun` backend resté stale (cf. CLAUDE.md idbatv7), côté frontend cette fois.

## Squelette WIP sprint 10 — reverté (2026-07-10)

La route `home` a pointé temporairement vers `WipComponent` (page plein écran "IDemat en cours de développement", hors shell) entre PR #28 et son revert par Jérémie (`cfa084d`) — **entièrement retiré du code**, `HomeComponent` est de nouveau la route active. Ne pas réintroduire ce pattern sans redemander.

## Règle métier — zones J1/F3 et carte grise (ajout de véhicule)

- **zoneJ1/zoneF3** : affichés et obligatoires **uniquement** si `contrat.demandeZoneJ1F3` est actif — **jamais** lié à PART/PRO (erreur corrigée par PR #25, ne pas réintroduire ce raccourci).
- **carteGrise** (fichier) : obligatoire côté front pour **tout** ajout de véhicule (PART et PRO, indépendamment du flag J1/F3) — bloqué par `erreurFichier` dans `AjouterVehiculeDialogComponent`. ⚠️ Aucun contrôle équivalent côté back (champ nullable dans les DTOs `AjouterVehiculeDioRequest`/`VehiculeInscriptionDioRequest`) — gap de validation identifié, pas corrigé, décision à prendre.

## TODO prod (avant mise en production)

- Remplacer les adresses email hardcodées de test (`rrosier@altea-si.com`) par les vraies adresses dans le backend (`InscriptionIdmService.inscrire()` et `DemandeInscriptionService.valider()`)
- Payfip (#276, mergé 2026-07-30) : checklist bascule prod détaillée dans `idbatv7/CLAUDE.md` et la mémoire `project_payfip_chantier.md` (numcli/saisie réels par contrat, endpoint SOAP à reconfirmer avec Bertrand, accès sortant back jamais vérifié depuis un vrai serveur de prod)

## Pattern — réconciliation Payfip à la consultation du solde (#276, 2026-07-30)

`PassagesPointsComponent.ngOnInit()` appelle `AchatPassagesIdematServiceAgents.reconcilierMesAchatsEnAttente()` (`POST /api/achat-passages/reconcilier`, filtré sur l'usager connecté) **avant** de charger `getPassagesInfo()`/`getStats()`, pour garantir la fraîcheur du solde affiché — le job Quartz global côté back (toutes les 20 min) ne suffit pas seul, sa cadence introduit un décalage. Appel best-effort (`catchError(() => of(void 0))`) : un échec ne doit jamais empêcher l'affichage de l'écran. Pas de déclencheur équivalent à la connexion/accueil — jugé redondant après discussion (voir `project_payfip_chantier.md` pour le raisonnement complet).

## Piège CSS — `min-height:100vh` + padding vertical sans `box-sizing:border-box` (#334/#337, 2026-07-30)

Plusieurs écrans plein écran (`.page`/`.overlay`, hors layout applicatif — login, mot de passe oublié, création de compte, confirmation, lien invalide) ont `min-height: 100vh` en `box-sizing: content-box` (comportement par défaut CSS) combiné à un `padding` vertical non nul. Le padding s'ajoute alors **par-dessus** les 100vh au lieu d'être compris dedans, provoquant une barre de scroll vertical inutile quel que soit le contenu réel de la page.

**Fix systématique** : ajouter `box-sizing: border-box;` au conteneur concerné (aucun changement des valeurs de padding elles-mêmes nécessaire).

⚠️ **Repéré deux fois de suite** (#334 sur `connexion-idemat`, puis #337 sur 5 autres écrans avec le même bloc copié-collé) — dès qu'un de ces deux symptômes apparaît sur un nouvel écran, vérifier immédiatement tous les autres via :
```bash
grep -rl "min-height:\s*100vh" src/app --include="*.scss"
```
et corriger tous les fichiers remontés d'un coup, plutôt que d'attendre un ticket séparé par écran.

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
