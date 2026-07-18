# Mateu annotation catalog (common ones)

All in `io.mateu.uidl.annotations` unless noted. Bean Validation annotations
(`@NotEmpty`, `@NotNull`, `@Email`, `@Min`, …) come from `jakarta.validation.constraints`.

## Routing & app
| Annotation | Use |
|---|---|
| `@UI("/path")` | register a class as a routed screen |
| `@Route("/p/:id")`, `@Routes` | extra / parameterised routes |
| `@HomeRoute`, `@BaseRoute` | mark home / base route |
| `@App(...)` | app-level layout/variant/theme toggle |
| `@Title`, `@Subtitle`, `@PageTitle` | titles |
| `@Logo`, `@FavIcon` | branding |
| `@Menu` | navigation entry (ViewModel, String route, `RouteLink`, `RemoteMenu`, nested) |
| `@KeycloakSecured` | protect a view |

## Field editability & visibility
| Annotation | Use |
|---|---|
| `@ReadOnly` | visible, not editable (field or class) |
| `@PlainText`, `@Multiline` | render as plain text |
| `@Hidden` / `@HiddenInList` / `@HiddenInCreate` / `@HiddenInView` / `@HiddenInEditor` | hide per context |
| `@EditableOnlyWhenCreating`, `@NotEditable` | edit constraints |
| `@NotCreatable`, `@NotDeletable` | CRUD constraints |
| `@Disabled`, `@EyesOnly` | disabled / sensitive (`@EyesOnly` also hides fields by roles/groups/scopes/permissions) |
| `@ReadOnlyUnless(roles/groups/scopes/permissions)` | read-only unless the user matches (field or class); same 4 dimensions as `@EyesOnly` |
| `@DisabledUnless(roles/groups/scopes/permissions)` | disabled unless the user matches (field or `@Button`/`@Toolbar`) |
| `@Filterable`, `@Searchable` | list filtering / global search |

## Field meaning & presentation
| Annotation | Use |
|---|---|
| `@Stereotype(FieldStereotype.X)` | override the control (textarea, email, password, money, badge, uploadableImage, …) |
| `@Label`, `@Help`, `@Icon` | label / tooltip / icon |
| `@LinkTo("/customers/${state.customerId}")` | navigation icon at the right of the field; href/title interpolate live against state (icon, title, target attrs; programmatic alternative: `LinkSupplier` returning `NavLink`) |
| `@Status(mappings = @StatusMapping(from, to))` | colored state badge (`StatusType`) |
| `@Lookup(search=…, label=…)` | relation picker (server-side suppliers) |
| `@Badge`, `@Avatar`, `@KPI`, `@Banner`, `@BadgeInHeader` | presentation semantics |
| `@Weight`, `@Colspan`, `@ColumnWidth`, `@Priority` | sizing / ordering |
| `@PrimaryKey`, `@GeneratedValue` | identity |

## Actions
| Annotation | Use |
|---|---|
| `@Button`, `@Toolbar`, `@Action` | a method becomes a button/action (styles, confirm, background, sse, shortcut) |
| `@WizardCompletionAction` | wizard completion button |
| `@RowAction`, `@OnRowSelected` | per-row action / selection handler |
| `@AutoSave(debounceMillis=…)` | auto-save on change |
| `@Fab` | floating action button |

## Layout
| Annotation | Use |
|---|---|
| `@Section("…", columns=…)` | titled group |
| `@Tabs` + `@Tab("…")` | tabbed sections |
| `@Zones` + `@Zone(name,width)` | side-by-side columns |
| `@Accordion`, `@AccordionPanel` | collapsible sections |
| `@SplitLayout`, `@MasterDetail`, `@FoldedLayout` | split / master-detail |
| `@Compact` | high-density mode |
| `@Inline` | expand a nested object into the parent section |

## Styling & misc
| Annotation | Use |
|---|---|
| `@Style("…")`, `@CssClasses("…")`, `@DivStyle("…")` | CSS |
| `@Header`, `@Footer` | custom header/footer components |
| `@Breadcrumbs`, `@Breadcrumb` | breadcrumbs |
| `@AI(sse="…")` | in-app AI chat button (app feature, not codegen) |

## Base classes & interfaces
| Type | Use |
|---|---|
| `AutoCrud<T extends Identifiable>` | full CRUD orchestrator |
| `Listing<Filters,Row>` | custom listing page (override `search()`) |
| `Wizard` + `WizardStep` | multi-step flow |
| `AutoEditableView<T>` / `EditableView<V,E>` / `MultiView` | editor / composed views |
| `ComponentTreeSupplier` | fluent component tree |
| `CrudStore<T>` | CRUD data-access port (was `CrudRepository`)  |
| `ListingBackend<Filters,Row>` | listing contract as an interface (when not extending `Listing`) |
| `Identifiable` | entity with `String id()` |
| `ComponentAdapter<T>` | render a non-annotated domain object |
| `LookupOptionsSupplier`, `LookupLabelSupplier` | `@Lookup` suppliers |

## Effects (action return values)
`void`/`null` (stay), `new Message("…")` (toast), `new State(this)` (update, no nav),
`URI.create("/path")` (navigate), any Java object (open as a view), `PageBanner`.
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
classes (`@Compact @interface PantallaCompacta {}`). Exception: routing annotations
(`@UI`/`@Route`/`@HomeRoute`) are resolved at compile time and are **not** composable.
