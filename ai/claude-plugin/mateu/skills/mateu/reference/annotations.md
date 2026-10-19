# Mateu annotation catalog (common ones)

All in `io.mateu.uidl.annotations` unless noted. Bean Validation annotations
(`@NotEmpty`, `@NotNull`, `@Email`, `@Min`, …) come from `jakarta.validation.constraints`.
Use single-type imports: several names exist both as an annotation and as a record/interface
(`@Menu`/`Menu`, `@Button`/`Button`, `@Searchable`/`Searchable`…) — see the imports note in SKILL.md.

## Routing & app
| Annotation | Use |
|---|---|
| `@UI("/path")` | register a class as a routed screen |
| `specs/ui/routes.yaml` entry (`route: p/:id`, `viewModel: <FQCN>`) | extra / parameterised / nested inner routes — `@Route`/`@Routes` were **removed** (see https://mateu.io/concepts/routes-and-mounts/ and the **mateu-yaml** skill) |
| `HomeRouteSupplier` (interface on the app class) | home route — `@HomeRoute` was **removed**; default home = first menu item. |
| `@App(...)` | app-level layout/variant/theme toggle |
| `@Title`, `@Subtitle`, `@Overline`, `@PageTitle` (browser tab) | titles |
| `@Logo`, `@FavIcon` | branding |
| `@Menu` | navigation entry (ViewModel, String route, `RouteLink`, `RemoteMenu`, nested) |
| `@KeycloakSecured` | deprecated for removal — Mateu does not authenticate: use the host framework's security (Spring Security…) or a `PrincipalResolver` bean |

## Field editability & visibility
| Annotation | Use |
|---|---|
| `@ReadOnly` | visible, not editable (field or class) |
| `@PlainText`, `@Multiline` | render as plain text |
| `@Hidden` / `@HiddenInList` / `@HiddenInCreate` / `@HiddenInView` / `@HiddenInEditor` | hide per context |
| `@EditableOnlyWhenCreating`, `@NotEditable` | edit constraints |
| `@NotCreatable`, `@NotDeletable` | CRUD constraints |
| `@Hidden("!state.flag")`, `@Disabled("…")` | hide / disable, optionally by a client-side expression over `state` |
| `@EyesOnly(roles/groups/scopes/permissions)` | hide a field / menu entry unless the user matches (evaluated server-side; also strips it from the state) |
| `@ReadOnlyUnless(roles/groups/scopes/permissions)` | read-only unless the user matches (field or class); same 4 dimensions as `@EyesOnly` |
| `@DisabledUnless(roles/groups/scopes/permissions)` | disabled unless the user matches (field or `@Button`/`@Toolbar`) |
| `@Filterable` | makes a column of a grid FIELD filterable (an `AutoCrud` already offers every basic entity field as a filter — see crud.md) |
| `@Searchable(selector = …, label = …)` | a **field** picked from a modal search dialog (a `Selector` listing). Not list search — a listing gets its search box from `implements Searchable` (interface) |

## Field meaning & presentation
| Annotation | Use |
|---|---|
| `@Stereotype(FieldStereotype.X)` | override the control (textarea, email, password, money, badge, uploadableImage, …) |
| `@Label`, `@Help`, `@Icon` | label / tooltip / icon |
| `@LinkTo("/customers/${state.customerId}")` | navigation icon at the right of the field; href/title interpolate live against state (icon, title, target attrs; programmatic alternative: `LinkSupplier` returning `NavLink`) |
| `@Status(mappings = @StatusMapping(from, to))` | colored state badge (`StatusType`) |
| `@Lookup(search=…, label=…)` | relation picker; suppliers implement `LookupOptionsSupplier` / `LookupLabelSupplier` |
| `@Notice(theme="warning")` on a `String` | inline banner showing the value; hidden while blank |
| `@Badge`, `@Avatar`, `@KPI`, `@Banner`, `@BadgeInHeader` | presentation semantics |
| `@Weight`, `@Colspan`, `@ColumnWidth`, `@Priority` | sizing / ordering |
| `@PrimaryKey`, `@GeneratedValue` | identity |

## Actions
| Annotation | Use |
|---|---|
| `@Button`, `@Toolbar`, `@Action` | a method becomes a button/action (styles, confirm, background, sse, shortcut) |
| `@WizardCompletionAction` | wizard completion button |
| `ColumnActionGroup` row column, `@OnRowSelected` | per-row action / selection handler |
| `@AutoSave(debounceMillis=…)` | auto-save on change |
| `@Fab` | floating action button |

## Layout
| Annotation | Use |
|---|---|
| `@Section("…", columns=…)` | titled group |
| `@Tab("…")` | tabbed sections |
| `@Zones` + `@Zone(name,width)` | side-by-side columns |
| `@FoldedLayout`, `@MasterDetail(minHeightWhenDetailVisible=…)` | folded / master-detail form layouts |
| `@FoldoutDetail(overview={…}, folded={…})` (class) | read-only view of a record as overview + one foldout panel per remaining `@Section` |
| `@Compact` | high-density mode |
| `@Toc` / `@Section(sticky=true)` | sticky section index for long pages / pinned section |
| `@Aside(width=…)` | a component field as the page's side panel |
| `@AutoLayout`, `@AutoPage(false)` | layout inference opt-in / page-archetype inference opt-out |
| `@Inline` | expand a nested object into the parent section |

## Styling & misc
| Annotation | Use |
|---|---|
| `@Style("…")`, `@CssClasses("…")`, `@DivStyle("…")` | CSS |
| `@Header`, `@Footer` | custom header/footer components |
| `@Breadcrumbs`, `@Breadcrumb` | an explicit breadcrumb trail (replaces the automatic one: menu path + CRUD level, built by the renderer) |
| `@NoBreadcrumbs` | no automatic breadcrumb trail — on a page, or on the `@UI` shell for the whole app |
| `@AI(sse="…")` | in-app AI chat button (app feature, not codegen) |

## Base classes & interfaces
| Type | Use |
|---|---|
| `AutoCrud<T extends Identifiable>` | full CRUD orchestrator |
| `Listing<Row>` (interface) | listing page — single `search(SearchRequest, HttpRequest)`; grows by declaring capabilities |
| `Searchable` / `Filterable<F>` | input capabilities: search box / filter bar (declared) |
| `Navigable<D,Id>` / `Editable<E,Id>` / `Creatable<F,Id>` / `Deletable<Id>` | interaction capabilities: detail / edit (drawer if not navigable) / create / delete (implemented) |
| `Wizard` + `WizardStep` | multi-step flow |
| `AutoEditableView<T>` / `EditableView<V,E>` / `MultiView` | editor / composed views |
| `ComponentTreeSupplier` | fluent component tree |
| `CrudStore<T>` | CRUD data-access port (`findById`, `save`, `findAll`, `deleteAllById`; default `find(searchText, filters, pageable)`) |
| `ReactiveListing<Row>` | Reactor twin of `Listing` |
| `Identifiable` | entity with `String id()` |
| `SearchableText` | entity interface: `searchableText()` = what the default `CrudStore.find` matches the search box against (else `toString()`) |
| `HomeRouteSupplier` | on the app shell: `homeRoute()` names the page it opens on (default: first menu item) |
| `ComponentAdapter<T>` | render a non-annotated domain object |
| `LookupOptionsSupplier`, `LookupLabelSupplier` | `@Lookup` suppliers |

## Effects (action return values)
`void`/`null` (stay), `new Message("…")` (toast), `new State(this)` (update, no nav),
`URI.create("/path")` (navigate), any Java object (open as a view), `PageBanner`,
`UICommand.dispatchEvent(…)` / `UICommand.closeModal(…)`, a `Drawer`/`Dialog` (opens an overlay).
Return one or a `List.of(...)` of several. **There is no `Navigation` type.**

## Composed (semantic) annotations
Any Mateu **field/method/class** annotation can be used as a meta-annotation to build a
single domain annotation that bundles configuration — model intent, not widgets:

```java
@Lookup(search = ProveedorOptions.class, label = ProveedorLabel.class)
@Target(ElementType.FIELD) @Retention(RUNTIME)
public @interface ProveedorId {}

// usage
@ProveedorId String proveedorId;
```

Also works for methods (`@Toolbar @Label("Guardar") @interface AccionGuardar {}`) and
classes (`@Compact @interface PantallaCompacta {}`). Exception: `@UI` (the only routing
annotation) is resolved at compile time and is **not** composable.
