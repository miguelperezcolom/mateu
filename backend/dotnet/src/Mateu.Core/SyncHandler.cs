using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Text.Json;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Handles a single POST /mateu/v3/sync/{route} call → a UIIncrement.</summary>
public sealed class SyncHandler(MateuRegistry registry, ITranslator? translator = null, Func<Identity?>? identity = null)
{
    private readonly ReflectionMapper _mapper = new(translator, identity);

    public UIIncrementDto Handle(RunActionRqDto rq, string? requestBaseUrl = null)
    {
        // 0. Audience projection: the appState value under "audience" (the [AppContext] selector
        // named audience) filters [Audience]-marked members for the whole request.
        ReflectionMapper.SetCurrentAudience(
            rq.AppState.TryGetValue("audience", out var audience) ? StateString(audience) : null);

        // 1. App shell at the root route.
        if (string.IsNullOrEmpty(rq.ActionId)
            && registry.Resolve(rq.ServerSideType, rq.Route) is { } t0
            && t0.GetCustomAttribute<AppAttribute>() is { } app)
            return RenderApp(t0, app.Title, rq, requestBaseUrl);

        // 2. A Crud (resolved by serverSideType or by route prefix) — list / detail / new / edit + actions.
        if (ResolveCrud(rq) is { } c)
            return HandleCrud(c.Type, c.Element, c.BaseRoute, rq);

        var type = registry.Resolve(rq.ServerSideType, rq.Route);
        if (type is null) return Error($"Route not found: {rq.Route}");

        // 2b. A declarative Listing — a read-only searchable listing with typed filters.
        if (ReflectionMapper.ListingTypes(type) is { } listing)
        {
            var view = Activator.CreateInstance(type)!;
            return rq.ActionId switch
            {
                "search" => ListingSearch(view, listing.Filters, listing.Row, rq),
                // A selector dialog's row pick: write (id, label) back into the host field.
                "action-on-row-select" => SelectorRowSelected(view, listing.Row, rq),
                _ => Render(type, view, rq),
            };
        }

        // 3. A wizard.
        if (typeof(Wizard).IsAssignableFrom(type)) return HandleWizard(type, rq);

        // 4. A plain view.
        var instance = Activator.CreateInstance(type)!;
        BindState(instance, rq.ComponentState);
        if (rq.ActionId?.StartsWith("search-") == true) return FieldSearch(instance, rq);
        if (rq.ActionId?.StartsWith("codesearch-") == true) return FieldCodeSearch(type, rq);
        // The notification inbox's app-level actions — dispatched with the app's serverSideType,
        // like the app header actions (mirrors Java's NotificationsActionRunner).
        if (rq.ActionId?.StartsWith("_notifications-") == true) return Notifications(instance, rq);
        // The command palette's entity search — same app-level rail (mirrors Java's
        // GlobalSearchActionRunner).
        if (rq.ActionId == "_globalsearch") return GlobalSearch(instance, rq);
        // 4b. Archetype in-place actions (CollectionDetail / GeneralOverview): selection, search
        // filtering and record switching mutate the bound state and re-render the tree — no
        // navigation, no method dispatch.
        if (instance is IComponentTreeSupplier)
        {
            if (rq.ActionId == "selectCollectionItem")
            {
                type.GetProperty("SelectedId")?.SetValue(instance,
                    StateString(GetState(rq.Parameters, "_item")));
                return Render(type, instance, rq);
            }
            if (rq.ActionId is "filterCollection" or "switchRecord")
                return Render(type, instance, rq);
            // A TodoList row click ACTS on the row instead of selecting it: the archetype finds
            // the row by id and its ActionOn result maps as a regular action result (a route
            // string → NavigateTo); an unknown row (or a null result) just re-renders the list
            // (mirrors Java's TodoList.openTodoItem returning `this`).
            if (rq.ActionId == "openTodoItem" && instance is ITodoList todoList)
                return todoList.OpenTodoItem(StateString(GetState(rq.Parameters, "_item"))) is { } result
                    ? MapResult(result, rq)
                    : Render(type, instance, rq);
            // A CalendarPage's built-in actions: the toolbar chevrons/Today move the displayed
            // month and re-render (re-running Events for the new month); an event click ACTS on
            // the event — the frontend sends it as parameters._clickedEvent = {id, title, date,
            // color} and the archetype finds it back by id, its ActionOn result mapping as a
            // regular action result (a route string → NavigateTo); "+ Create" runs CreateAction.
            // Unknown events / null results just re-render the page (mirrors Java's CalendarPage
            // actions returning `this`).
            if (instance is ICalendarPage calendarPage)
                switch (rq.ActionId)
                {
                    case "openCalendarEvent":
                        return calendarPage.OpenCalendarEvent(ClickedEventId(rq)) is { } opened
                            ? MapResult(opened, rq)
                            : Render(type, instance, rq);
                    case "previousCalendarMonth":
                        calendarPage.PreviousMonth();
                        return Render(type, instance, rq);
                    case "nextCalendarMonth":
                        calendarPage.NextMonth();
                        return Render(type, instance, rq);
                    case "goCalendarToday":
                        calendarPage.GoToday();
                        return Render(type, instance, rq);
                    case "createCalendarEvent":
                        return calendarPage.CreateCalendarEvent() is { } created
                            ? MapResult(created, rq)
                            : Render(type, instance, rq);
                }
        }
        return string.IsNullOrEmpty(rq.ActionId) ? Render(type, instance, rq) : RunAction(type, instance, rq);
    }

    private UIIncrementDto HandleWizard(Type type, RunActionRqDto rq)
    {
        var wizard = Activator.CreateInstance(type)!;
        BindState(wizard, rq.ComponentState);
        var step = StepOf(rq);
        var total = ReflectionMapper.EditableProperties(type)
            .Select(p => p.Find<StepAttribute>()?.Step ?? 1).DefaultIfEmpty(1).Max();
        var route = "/" + (type.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? "");

        switch (rq.ActionId)
        {
            case "back": step = Math.Max(1, step - 1); break;
            case "next" when step >= total: return MapResult(((Wizard)wizard).Complete());
            case "next": ((Wizard)wizard).OnNext(step, step + 1); step++; break;
        }
        return FragmentResponse(Title(type), _mapper.MapWizard(type, wizard, route, step), rq);
    }

    private static int StepOf(RunActionRqDto rq) =>
        rq.ComponentState.TryGetValue("__step", out var v) && v is JsonElement { ValueKind: JsonValueKind.Number } el
            ? el.GetInt32() : 1;

    // ── CRUD ───────────────────────────────────────────────────────────────────
    private (Type Type, Type Element, string BaseRoute)? ResolveCrud(RunActionRqDto rq)
    {
        if (!string.IsNullOrEmpty(rq.ServerSideType) && registry.Resolve(rq.ServerSideType, null) is { } byName
            && ReflectionMapper.CrudElementType(byName) is { } el1)
            return (byName, el1, "/" + (byName.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? ""));

        if (registry.ResolveByPrefix(rq.Route) is { } pref
            && ReflectionMapper.CrudElementType(pref.Type) is { } el2)
            return (pref.Type, el2, "/" + pref.BaseRoute);

        return null;
    }

    private UIIncrementDto HandleCrud(Type crudType, Type element, string baseRoute, RunActionRqDto rq)
    {
        var crud = Activator.CreateInstance(crudType)!;
        var (mode, id) = ParseCrudRoute(baseRoute, rq.Route);

        // A [Lookup] field on the entity form searches its options through the crud view.
        if (rq.ActionId?.StartsWith("search-") == true) return FieldSearch(crud, rq);
        // A [Searchable] field on the entity form opens its selector dialog.
        if (rq.ActionId?.StartsWith("codesearch-") == true) return FieldCodeSearch(element, rq);

        return rq.ActionId switch
        {
            "search" => CrudSearch(crud, element, rq),
            "create" or "save" => CrudSave(crud, crudType, element, id, rq, baseRoute),
            "update-row" => UpdateRow(crud, crudType, element, rq),
            "delete" => Navigate(baseRoute, id is null ? null : Delete(crud, id), rq),
            // EditInDrawer (the Redwood "Create and Edit - Drawer" template): New and row clicks
            // open the crud form in a Drawer over the listing instead of navigating; cancels just
            // close it. Route-based /new — /{id}/edit deep links keep working unchanged.
            "new" when EditInDrawer(crud) =>
                CrudDrawer(crudType, element, New(element), "new", $"{baseRoute}/new", rq, crud),
            "view" or "edit" when EditInDrawer(crud) && RowId(rq, element) is { } rowId =>
                CrudDrawer(crudType, element, GetOrNew(crud, crudType, element, rowId), "edit",
                    $"{baseRoute}/{rowId}/edit", rq, crud),
            "cancel-new" or "cancel-edit" or "cancel-view" when EditInDrawer(crud) =>
                UIIncrementDto.Of(commands: [UICommandDto.CloseModal() with { TargetComponentId = Target(rq) }]),
            null or "" => mode switch
            {
                "new" => RenderEntity(crudType, element, New(element), "new", $"{baseRoute}/new", rq),
                "view" => RenderEntity(crudType, element, GetOrNew(crud, crudType, element, id), "view", $"{baseRoute}/{id}", rq),
                "edit" => RenderEntity(crudType, element, GetOrNew(crud, crudType, element, id), "edit", $"{baseRoute}/{id}/edit", rq),
                _ => RenderCrudList(crudType, crud, baseRoute, rq),
            },
            { } aid when aid.StartsWith("action-on-row-") => ActionOnRows(crud, crudType, element, rq),
            _ => Error($"Action not found: {rq.ActionId}"),
        };
    }

    /// <summary>A [ListToolbarButton] bulk action: runs the named method on the crud with the
    /// grid's selected rows (componentState crud_selected_items) rebuilt as typed entities — a
    /// List&lt;T&gt; parameter receives them. A null/void result re-runs the search so the
    /// listing reflects the changes; anything else maps as a regular action result (mirrors
    /// Java's ActionOnRowActionHandler).</summary>
    private static UIIncrementDto ActionOnRows(object crud, Type crudType, Type element, RunActionRqDto rq)
    {
        var name = rq.ActionId!["action-on-row-".Length..];
        var method = crudType.GetMethods(BindingFlags.Public | BindingFlags.Instance)
            .FirstOrDefault(m => !m.IsSpecialName && Naming.CamelCase(m.Name) == name);
        if (method is null) return Error($"Action not found: {rq.ActionId}");
        var result = method.Invoke(crud, BuildBulkArguments(method, rq));
        return result is null ? CrudSearch(crud, element, rq) : MapResult(result, rq);
    }

    /// <summary>Fills a bulk method's parameters: a List&lt;T&gt;/IReadOnlyList&lt;T&gt;
    /// parameter receives the selected rows rebuilt as typed entities (the same New+BindState
    /// path update-row uses); anything unfillable is null.</summary>
    private static object?[] BuildBulkArguments(MethodInfo method, RunActionRqDto rq)
    {
        var parameters = method.GetParameters();
        if (parameters.Length == 0) return [];
        var selected = rq.ComponentState.TryGetValue("crud_selected_items", out var raw)
                       && raw is JsonElement { ValueKind: JsonValueKind.Array } el
            ? el
            : (JsonElement?)null;
        return parameters.Select(p => SelectedRowElementType(p.ParameterType) is { } rowType
            ? SelectedRows(rowType, selected)
            : null).ToArray();
    }

    private static Type? SelectedRowElementType(Type t) =>
        t.IsGenericType
        && (t.GetGenericTypeDefinition() == typeof(List<>)
            || t.GetGenericTypeDefinition() == typeof(IList<>)
            || t.GetGenericTypeDefinition() == typeof(IReadOnlyList<>)
            || t.GetGenericTypeDefinition() == typeof(IEnumerable<>))
            ? t.GetGenericArguments()[0]
            : null;

    private static object SelectedRows(Type rowType, JsonElement? selected)
    {
        var rows = (System.Collections.IList)Activator.CreateInstance(typeof(List<>).MakeGenericType(rowType))!;
        if (selected is not { } array) return rows;
        foreach (var rowEl in array.EnumerateArray())
        {
            if (rowEl.ValueKind != JsonValueKind.Object) continue;
            var row = Activator.CreateInstance(rowType)!;
            BindState(row, rowEl.EnumerateObject().ToDictionary(x => x.Name, x => (object?)x.Value));
            rows.Add(row);
        }
        return rows;
    }

    private static (string Mode, string? Id) ParseCrudRoute(string baseRoute, string? route)
    {
        var r = "/" + MateuRegistry.Normalize(route);
        var bp = baseRoute.TrimEnd('/');
        var suffix = r.Length > bp.Length && r.StartsWith(bp) ? r[bp.Length..].Trim('/') : "";
        if (suffix == "") return ("list", null);
        if (suffix == "new") return ("new", null);
        var parts = suffix.Split('/');
        return parts.Length >= 2 && parts[1] == "edit" ? ("edit", parts[0]) : ("view", parts[0]);
    }

    private UIIncrementDto RenderCrudList(Type crudType, object crud, string baseRoute, RunActionRqDto rq) =>
        FragmentResponse(Title(crudType), _mapper.MapView(crudType, crud, baseRoute), rq);

    private UIIncrementDto RenderEntity(Type crudType, Type element, object entity, string mode, string route, RunActionRqDto rq) =>
        FragmentResponse(Title(crudType), _mapper.MapEntityForm(crudType, element, entity, mode, route), rq,
            LookupLabels(element, entity, Activator.CreateInstance(crudType)!));

    /// <summary>The event the EditInDrawer drawer emits on save: the listing refreshes by
    /// re-running its search (mirrors Java's Crud.SAVED_IN_DRAWER_EVENT).</summary>
    public const string SavedInDrawerEvent = "mateu-crud:saved-in-drawer";

    private static bool EditInDrawer(object crud) =>
        crud.GetType().GetProperty("EditInDrawer")?.GetValue(crud) as bool? ?? false;

    private static string? RowId(RunActionRqDto rq, Type element)
    {
        var idField = Naming.CamelCase(element.GetProperty("Id")?.Name ?? "Id");
        return StateString(GetState(rq.Parameters, idField))
            ?? StateString(GetState(rq.ComponentState, idField));
    }

    /// <summary>The EditInDrawer create/edit form: the same entity form the /new — /{id}/edit
    /// routes render, wrapped in a Drawer emitted as an Add fragment over the listing.</summary>
    private UIIncrementDto CrudDrawer(
        Type crudType, Type element, object entity, string mode, string route, RunActionRqDto rq, object crud)
    {
        var form = _mapper.MapEntityForm(crudType, element, entity, mode, route);
        var width = crudType.GetProperty("EditDrawerWidth")?.GetValue(crud) as string ?? "36rem";
        var drawer = new ClientSideComponentDto(
            new DrawerMetadataDto("crud-edit-drawer", mode == "new" ? "New" : "Edit", form)
                { Width = width },
            "crud-edit-drawer", [], null, null, null);
        return UIIncrementDto.Of(fragments:
            [new UIFragmentDto(Target(rq), drawer, null,
                LookupLabels(element, entity, Activator.CreateInstance(crudType)!), "Add", null)]);
    }

    private UIIncrementDto CrudSave(object crud, Type crudType, Type element, string? id, RunActionRqDto rq, string baseRoute)
    {
        // Start from the stored entity (so untouched fields survive) and apply the edited fields.
        // Versioned entities bind onto a DETACHED copy: an in-memory Get may return the live
        // stored instance by reference, and a rejected (stale) save must persist NOTHING.
        var stored = id is not null ? crudType.GetMethod("Get")!.Invoke(crud, [id]) : null;
        var storedVersion = StoredVersionOf(stored);
        var entity = stored is null ? New(element)
            : storedVersion is null ? stored
            : CopyOf(stored, element);
        BindState(entity, rq.ComponentState);
        if (id is not null) element.GetProperty("Id")?.SetValue(entity, id);

        var missing = RequiredMissing(entity, element);
        if (missing.Count > 0)
            return Error("Please fill: " + string.Join(", ", missing));

        // Optimistic locking ([Version] property): reject the editor save when someone else saved
        // in between (unless _forceOverwrite), bump the version otherwise — both no-ops without a
        // [Version] property; creating a new entity skips both (there is no stored entity yet).
        if (id is not null)
        {
            if (IsStale(entity, storedVersion, rq))
                return ConflictDialog(
                    "Este registro ha cambiado mientras lo editabas. Puedes recargar para ver los"
                    + " cambios (perdiendo los tuyos) o sobrescribir con tu versión.",
                    "cancel-edit", rq.ActionId!, null, rq);
            BumpVersion(entity);
        }

        crudType.GetMethod("Save")!.Invoke(crud, [entity]);
        if (EditInDrawer(crud))
        {
            // drawer mode: no navigation — close the drawer emitting the saved event and re-run
            // the listing's search in place so the new/edited row shows up.
            return UIIncrementDto.Of(
                commands:
                [
                    UICommandDto.CloseModal(SavedInDrawerEvent) with { TargetComponentId = Target(rq) },
                    new UICommandDto(Target(rq), "RunAction",
                        new { actionId = "search", targetComponentId = Target(rq) }),
                ],
                messages: [new MessageDto("success", "middle", "", "Saved", 3000)]);
        }
        return Navigate(baseRoute, "Saved", rq);
    }

    /// <summary>Answers a lookup field's search-&lt;fieldId&gt; action: the view's
    /// IOptionsSupplier options for that field, filtered by the typed text (case-insensitive
    /// containment on the label) and paged, returned as a data-only fragment keyed by the field
    /// (mirrors Java's SearchFieldActionRunner).</summary>
    private static UIIncrementDto FieldSearch(object instance, RunActionRqDto rq)
    {
        var fieldId = rq.ActionId!["search-".Length..];
        if (instance is not IOptionsSupplier supplier)
            return Error($"no lookup options supplier found for field {fieldId}");

        var searchText = StateString(GetState(rq.Parameters, "searchText"))?.ToLowerInvariant() ?? "";
        var page = ToInt(GetState(rq.Parameters, "page"), 0);
        var size = ToInt(GetState(rq.Parameters, "size"), 50);
        if (size <= 0) size = 50;

        var all = supplier.Options(fieldId)
            .Where(o => searchText.Length == 0
                        || o.Label.Contains(searchText, StringComparison.OrdinalIgnoreCase))
            .ToList();
        var content = all.Skip(page * size).Take(size)
            .Select(o => new OptionDto(o.Value, o.Label)).ToList();
        var data = new Dictionary<string, object?>
        {
            [fieldId] = new { content, pageSize = size, pageNumber = page, totalElements = all.Count },
        };
        return UIIncrementDto.Of(fragments:
            [new UIFragmentDto(rq.InitiatorComponentId ?? "ux_main", null, null, data, "Replace", null)]);
    }

    /// <summary>The notification inbox's app-level actions (mirrors Java's
    /// NotificationsActionRunner): _notifications-list answers the supplier's current list as a
    /// data-only fragment keyed _notifications; _notifications-read marks the ids parameter (an
    /// explicit list, "all" → every currently-unread id, or one bare id) read and answers the
    /// REFRESHED list the same way.</summary>
    private static UIIncrementDto Notifications(object instance, RunActionRqDto rq)
    {
        if (instance is not INotificationsSupplier supplier)
            return Error("the app class does not implement INotificationsSupplier — no inbox to serve");
        if (rq.ActionId == "_notifications-read")
            supplier.MarkNotificationsRead(ReadIds(supplier, rq));
        var data = new Dictionary<string, object?>
        {
            ["_notifications"] = supplier.Notifications() ?? [],
        };
        return UIIncrementDto.Of(fragments:
            [new UIFragmentDto(rq.InitiatorComponentId ?? "ux_main", null, null, data, "Replace", null)]);
    }

    /// <summary>The command palette's entity search (mirrors Java's GlobalSearchActionRunner):
    /// _globalsearch with a searchText parameter answers the app class's IGlobalSearchSupplier
    /// hits as a data-only fragment keyed _globalsearch.</summary>
    private static UIIncrementDto GlobalSearch(object instance, RunActionRqDto rq)
    {
        if (instance is not IGlobalSearchSupplier supplier)
            return Error("the app class does not implement IGlobalSearchSupplier — no global search to serve");
        var searchText = StateString(GetState(rq.Parameters, "searchText")) ?? "";
        var data = new Dictionary<string, object?>
        {
            ["_globalsearch"] = supplier.GlobalSearch(searchText) ?? [],
        };
        return UIIncrementDto.Of(fragments:
            [new UIFragmentDto(rq.InitiatorComponentId ?? "ux_main", null, null, data, "Replace", null)]);
    }

    /// <summary>The ids parameter of _notifications-read: an explicit list, "all" → every
    /// currently-unread notification's id, or a single bare id.</summary>
    private static List<string> ReadIds(INotificationsSupplier supplier, RunActionRqDto rq)
    {
        var raw = GetState(rq.Parameters, "ids");
        if (raw is JsonElement { ValueKind: JsonValueKind.Array }) return MultiValues(raw);
        var text = StateString(raw);
        if (text == "all")
            return (supplier.Notifications() ?? []).Where(n => n.Unread).Select(n => n.Id).ToList();
        return text is null ? [] : [text];
    }

    /// <summary>Persists a single row edited in place in the listing grid (inline editing). The
    /// edited row travels in the _editedRow action parameter (mirrors Java's
    /// UpdateRowActionHandler → FilteredAutoCrud.updateRow: rebuild the entity, save).</summary>
    private static UIIncrementDto UpdateRow(object crud, Type crudType, Type element, RunActionRqDto rq)
    {
        if (!rq.Parameters.TryGetValue("_editedRow", out var raw)
            || raw is not JsonElement { ValueKind: JsonValueKind.Object } rowEl)
            return Error("update-row requires an _editedRow parameter");

        var row = rowEl.EnumerateObject()
            .ToDictionary(prop => prop.Name, prop => (object?)prop.Value);
        var entity = New(element);
        BindState(entity, row);

        // Optimistic locking ([Version] property): Sobrescribir re-sends the SAME edited row (the
        // button's parameters merge into the action request), Recargar re-runs the search.
        var id = element.GetProperty("Id")?.GetValue(entity)?.ToString();
        var stored = string.IsNullOrEmpty(id) ? null : crudType.GetMethod("Get")!.Invoke(crud, [id]);
        if (IsStale(entity, StoredVersionOf(stored), rq))
            return ConflictDialog(
                "Esta fila ha cambiado mientras la editabas. Recarga para ver los cambios o"
                + " sobrescribe con tu versión.",
                "search", "update-row",
                new Dictionary<string, object?> { ["_editedRow"] = rowEl }, rq);
        BumpVersion(entity);

        crudType.GetMethod("Save")!.Invoke(crud, [entity]);
        return UIIncrementDto.Of(messages: [new MessageDto("success", "middle", "", "Saved", 3000)]);
    }

    // ── Optimistic locking ([Version], mirrors Java's OptimisticLock) ────────────

    /// <summary>The entity's [Version] property (int or long), or null — every optimistic-locking
    /// step is a no-op without one.</summary>
    private static PropertyInfo? VersionProperty(Type entityClass) =>
        entityClass.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .FirstOrDefault(p => p.Find<VersionAttribute>() is not null);

    /// <summary>The [Version] value of the STORED entity, or null when there is no stored entity
    /// or no [Version] property (→ every optimistic-locking step is a no-op).</summary>
    private static long? StoredVersionOf(object? stored) =>
        stored is not null && VersionProperty(stored.GetType()) is { } version
            ? Convert.ToInt64(version.GetValue(stored) ?? 0L)
            : null;

    /// <summary>True when the STORED entity is newer than the incoming one (someone else saved in
    /// between). When the request carries _forceOverwrite (the conflict dialog's explicit
    /// override) the stored version is ADOPTED into the incoming entity instead, so the bump
    /// below moves it forward — stale numbers never resurrect.</summary>
    private static bool IsStale(object incoming, long? storedVersion, RunActionRqDto rq)
    {
        if (storedVersion is not { } stored || VersionProperty(incoming.GetType()) is not { } version)
            return false;
        if (ForceOverwrite(rq))
        {
            SetVersion(incoming, version, stored);
            return false;
        }
        return stored > Convert.ToInt64(version.GetValue(incoming) ?? 0L);
    }

    /// <summary>Increments the entity's [Version] by 1 before persisting (int stays int, long
    /// stays long).</summary>
    private static void BumpVersion(object entity)
    {
        if (VersionProperty(entity.GetType()) is not { } version) return;
        SetVersion(entity, version, Convert.ToInt64(version.GetValue(entity) ?? 0L) + 1);
    }

    private static void SetVersion(object entity, PropertyInfo version, long value)
    {
        var t = Nullable.GetUnderlyingType(version.PropertyType) ?? version.PropertyType;
        version.SetValue(entity, t == typeof(int) ? (int)value : value);
    }

    /// <summary>A detached property-by-property copy of the stored entity, so the editor's binding
    /// never mutates the live stored instance.</summary>
    private static object CopyOf(object source, Type element)
    {
        var copy = New(element);
        foreach (var p in element.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            if (p.CanRead && p.CanWrite) p.SetValue(copy, p.GetValue(source));
        return copy;
    }

    private static bool ForceOverwrite(RunActionRqDto rq) =>
        string.Equals(StateString(GetState(rq.Parameters, "_forceOverwrite")), "true",
            StringComparison.OrdinalIgnoreCase);

    /// <summary>The conflict dialog (mirrors Java's OptimisticLock.conflictDialog): reload
    /// (discard my changes and see theirs) or overwrite (my version wins, explicitly — the button
    /// re-dispatches the save action with _forceOverwrite merged into its parameters). Emitted
    /// like any action-returned overlay: an Add fragment on the initiator.</summary>
    private static UIIncrementDto ConflictDialog(
        string text, string reloadActionId, string overwriteActionId,
        IReadOnlyDictionary<string, object?>? overwriteParameters, RunActionRqDto rq)
    {
        var parameters = new Dictionary<string, object?> { ["_forceOverwrite"] = true };
        foreach (var (key, value) in overwriteParameters ?? new Dictionary<string, object?>())
            parameters[key] = value;
        return MapResult(new Dialog
        {
            HeaderTitle = "Modificado por otro usuario",
            Width = "30rem",
            Content = new VerticalLayout
            {
                Content =
                [
                    new Text(text),
                    new HorizontalLayout
                    {
                        Style = "justify-content: flex-end; gap: 0.5rem;",
                        Content =
                        [
                            new Button("Recargar", reloadActionId),
                            new Button("Sobrescribir", overwriteActionId)
                            {
                                Primary = true,
                                Parameters = parameters,
                            },
                        ],
                    },
                ],
            },
        }, rq);
    }

    /// <summary>Opens a [Searchable] field's selector dialog: the selector Listing (with its
    /// Select column, own actions and OnLoad search) rides as the content of a Dialog emitted as
    /// an Add fragment; the host field id travels in the selector's initial data so the row pick
    /// can address it back (mirrors Java's CodeSearchFieldActionRunner).</summary>
    private UIIncrementDto FieldCodeSearch(Type hostType, RunActionRqDto rq)
    {
        var fieldId = rq.ActionId!["codesearch-".Length..];
        var property = ReflectionMapper.EditableProperties(hostType)
            .FirstOrDefault(p => Naming.CamelCase(p.Name) == fieldId);
        var selectorType = property?.Find<SearchableAttribute>()?.Selector;
        if (selectorType is null || ReflectionMapper.ListingTypes(selectorType) is not { } listing)
            return Error($"no selector found for field {fieldId}");

        var component = _mapper.MapListing(selectorType, listing.Filters, listing.Row, rq.ConsumedRoute ?? "")
            with { InitialData = new Dictionary<string, object?> { ["_fieldId"] = fieldId } };
        var dialog = new ClientSideComponentDto(
            new DialogMetadataDto(null, null, component), null, [], null, null, null);
        return UIIncrementDto.Of(fragments:
            [new UIFragmentDto(rq.InitiatorComponentId ?? "ux_main", dialog, null, null, "Add", null)]);
    }

    /// <summary>A selector dialog's row pick: rebuilds the clicked row, asks the ISelector for
    /// the (id, label) pair and writes it back into the host field via the event bus —
    /// value-changed sets the value, data-changed the display label, close-modal-requested
    /// dismisses the dialog (mirrors Java's Listing.handleActionOnRow("select")).</summary>
    private static UIIncrementDto SelectorRowSelected(object view, Type rowType, RunActionRqDto rq)
    {
        if (!rq.Parameters.TryGetValue("_clickedRow", out var raw)
            || raw is not JsonElement { ValueKind: JsonValueKind.Object } rowEl)
            return Error("action-on-row-select requires a _clickedRow parameter");
        var row = Activator.CreateInstance(rowType)!;
        BindState(row, rowEl.EnumerateObject().ToDictionary(x => x.Name, x => (object?)x.Value));

        var selected = (SelectedItem)view.GetType().GetMethod("Selected")!.Invoke(view, [row])!;
        var fieldId = StateString(GetState(rq.ComponentState, "_fieldId")) ?? "";
        return UIIncrementDto.Of(commands:
        [
            new UICommandDto(Target(rq), "DispatchEvent", new CustomEventDto("value-changed",
                new Dictionary<string, object?> { ["fieldId"] = fieldId, ["value"] = selected.Id })),
            new UICommandDto(Target(rq), "DispatchEvent", new CustomEventDto("data-changed",
                new Dictionary<string, object?> { ["key"] = fieldId + "-label", ["value"] = selected.Label })),
            new UICommandDto(Target(rq), "DispatchEvent", new CustomEventDto("close-modal-requested", null)),
        ]);
    }

    /// <summary>A declarative Listing's search: hydrates the TYPED filters from the component
    /// state — &lt;field&gt;_from/&lt;field&gt;_to keys assemble into DateRange/NumberRange, value
    /// lists (or comma-joined strings after a URL restore) into enum sets, blank/unparseable
    /// bounds and stale constants dropped (mirrors Java's FilterStateAssembler) — calls
    /// Search(searchText, filters) and sorts + paginates the returned rows.</summary>
    private static UIIncrementDto ListingSearch(object view, Type filtersType, Type rowType, RunActionRqDto rq)
    {
        var filters = AssembleFilters(filtersType, rq.ComponentState);
        var search = view.GetType().GetMethod("Search")!;
        var fetched = (System.Collections.IEnumerable)search.Invoke(view, [SearchText(rq), filters])!;
        return PageRows(fetched.Cast<object>().ToList(), ReflectionMapper.EditableProperties(rowType).ToList(), rq);
    }

    private static object AssembleFilters(Type filtersType, IReadOnlyDictionary<string, object?> state)
    {
        var invariant = System.Globalization.CultureInfo.InvariantCulture;
        var filters = Activator.CreateInstance(filtersType)!;
        string? Bound(string key) => state.TryGetValue(key, out var raw) ? StateString(raw) : null;
        foreach (var p in ReflectionMapper.EditableProperties(filtersType))
        {
            var key = Naming.CamelCase(p.Name);
            var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
            if (t == typeof(DateRange))
            {
                DateOnly? lower = DateOnly.TryParse(Bound(key + "_from") ?? "", invariant, out var l) ? l : null;
                DateOnly? upper = DateOnly.TryParse(Bound(key + "_to") ?? "", invariant, out var u) ? u : null;
                if (lower is not null || upper is not null) p.SetValue(filters, new DateRange(lower, upper));
            }
            else if (t == typeof(NumberRange))
            {
                decimal? lower = decimal.TryParse(Bound(key + "_from") ?? "", System.Globalization.NumberStyles.Any, invariant, out var l) ? l : null;
                decimal? upper = decimal.TryParse(Bound(key + "_to") ?? "", System.Globalization.NumberStyles.Any, invariant, out var u) ? u : null;
                if (lower is not null || upper is not null) p.SetValue(filters, new NumberRange(lower, upper));
            }
            else if (ReflectionMapper.EnumSetElementType(p) is { } el)
            {
                if (!state.TryGetValue(key, out var raw)) continue;
                var set = Activator.CreateInstance(typeof(HashSet<>).MakeGenericType(el))!;
                var add = set.GetType().GetMethod("Add")!;
                foreach (var v in MultiValues(raw))
                    if (Enum.TryParse(el, v, ignoreCase: true, out var constant)) add.Invoke(set, [constant]);
                p.SetValue(filters, set);
            }
            else if (state.TryGetValue(key, out var raw) && raw is not null)
            {
                var value = ConvertValue(raw, p.PropertyType);
                if (value is not null) p.SetValue(filters, value);
            }
        }
        return filters;
    }

    /// <summary>Sorts (Pageable.sort), paginates and serializes rows into the standard listing
    /// data fragment — shared by crud and declarative-listing searches.</summary>
    private static UIIncrementDto PageRows(List<object> items, List<PropertyInfo> props, RunActionRqDto rq)
    {
        var propByCamel = props.ToDictionary(p => Naming.CamelCase(p.Name), p => p);
        foreach (var spec in EnumerateSort(rq.ComponentState).AsEnumerable().Reverse())
        {
            if (!propByCamel.TryGetValue(spec.field, out var prop)) continue;
            items = (spec.descending
                ? items.OrderByDescending(it => prop.GetValue(it), SortKeyComparer.Instance)
                : items.OrderBy(it => prop.GetValue(it), SortKeyComparer.Instance)).ToList();
        }
        var total = items.Count;
        var page = ToInt(GetState(rq.ComponentState, "page"), 0);
        var size = ToInt(GetState(rq.ComponentState, "size"), 10);
        if (size <= 0) size = total == 0 ? 1 : total;
        var rows = items.Skip(page * size).Take(size).Select(item => RowDict(item, props)).ToList();
        var data = new { crud = new { page = new { content = rows, pageSize = size, pageNumber = page, totalElements = total } } };
        return UIIncrementDto.Of(fragments: [new UIFragmentDto(Target(rq), null, null, data, "Replace", null)]);
    }

    /// <summary>A row as a camelCase dict; a self-referential children list (tree layouts)
    /// recurses so every level of the hierarchy rides in the same payload.</summary>
    private static Dictionary<string, object?> RowDict(object item, List<PropertyInfo> props) =>
        props.ToDictionary(p => Naming.CamelCase(p.Name), p =>
        {
            if (ReflectionMapper.GridRowType(p) is { } childType
                && p.GetValue(item) is System.Collections.IEnumerable children)
            {
                var childProps = ReflectionMapper.EditableProperties(childType).ToList();
                return (object?)children.Cast<object>().Select(child => RowDict(child, childProps)).ToList();
            }
            return CellValue(p.GetValue(item));
        });

    private static UIIncrementDto CrudSearch(object instance, Type element, RunActionRqDto rq)
    {
        var props = ReflectionMapper.EditableProperties(element).ToList();
        var summarySpec = SummarySpecOf(props);
        // The [GroupBy] column is the implicit primary sort, so rows of the same group stay
        // contiguous in the listing (the user's own sort applies within groups; mirrors Java's
        // ListingSummarySpec.prependGroupSort).
        var sort = PrependGroupSort(EnumerateSort(rq.ComponentState).ToList(), summarySpec);

        // Database pushdown: an overridden Find runs search+filter+sort+paginate as one query
        // and returns the page with its real total — skip the in-memory pipeline entirely
        // ([Aggregate]/[GroupBy] summaries are still computed in memory over Fetch, the analogue
        // of Java's default CrudRepository.summaries over findAll()).
        var pageable = new Pageable(
            ToInt(GetState(rq.ComponentState, "page"), 0),
            ToInt(GetState(rq.ComponentState, "size"), 10),
            sort.Select(s => new SortSpec(s.field, s.descending)).ToList());
        var found = instance.GetType().GetMethod("Find")!
            .Invoke(instance, [SearchText(rq), rq.ComponentState, pageable]);
        if (found is not null)
        {
            var content = (System.Collections.IEnumerable)found.GetType().GetProperty("Content")!.GetValue(found)!;
            var totalElements = (long)found.GetType().GetProperty("TotalElements")!.GetValue(found)!;
            var pushedRows = content.Cast<object>().Select(item => RowDict(item, props)).ToList();
            var pushedCrud = new Dictionary<string, object?>
            {
                ["page"] = new { content = pushedRows, pageSize = pageable.Size, pageNumber = pageable.Page, totalElements },
            };
            AttachSummaries(pushedCrud, summarySpec,
                () => FilteredRows(instance, rq, props));
            var pushedData = new Dictionary<string, object?> { ["crud"] = pushedCrud };
            return UIIncrementDto.Of(fragments: [new UIFragmentDto(Target(rq), null, null, pushedData, "Replace", null)]);
        }

        var propByCamel = props.ToDictionary(p => Naming.CamelCase(p.Name), p => p);

        // filter
        var items = FilteredRows(instance, rq, props);

        // sort — Pageable.sort is a list of { field, direction:'ascending'|'descending' }; applied
        // last-spec-first so the first spec is the primary key.
        foreach (var sortSpec in sort.AsEnumerable().Reverse())
        {
            if (!propByCamel.TryGetValue(sortSpec.field, out var prop)) continue;
            var ordered = sortSpec.descending
                ? items.OrderByDescending(it => prop.GetValue(it), SortKeyComparer.Instance)
                : items.OrderBy(it => prop.GetValue(it), SortKeyComparer.Instance);
            items = ordered.ToList();
        }

        var total = items.Count;
        // paginate in memory
        var page = ToInt(GetState(rq.ComponentState, "page"), 0);
        var size = ToInt(GetState(rq.ComponentState, "size"), 10);
        if (size <= 0) size = total == 0 ? 1 : total;
        var window = items.Skip(page * size).Take(size);

        var rows = new List<Dictionary<string, object?>>();
        foreach (var item in window)
        {
            var row = new Dictionary<string, object?>();
            foreach (var p in props) row[Naming.CamelCase(p.Name)] = CellValue(p.GetValue(item));
            rows.Add(row);
        }
        var crudData = new Dictionary<string, object?>
        {
            ["page"] = new { content = rows, pageSize = size, pageNumber = page, totalElements = total },
        };
        AttachSummaries(crudData, summarySpec, () => items);
        var data = new Dictionary<string, object?> { ["crud"] = crudData };
        return UIIncrementDto.Of(fragments: [new UIFragmentDto(Target(rq), null, null, data, "Replace", null)]);
    }

    /// <summary>Fetch + the smart-search-bar filters: the WHOLE filtered result set the
    /// summaries aggregate over (not just the visible page).</summary>
    private static List<object> FilteredRows(object instance, RunActionRqDto rq, List<PropertyInfo> props)
    {
        var fetched = (System.Collections.IEnumerable)instance.GetType().GetMethod("Fetch")!.Invoke(instance, [SearchText(rq)])!;
        return fetched.Cast<object>().Where(item => MatchesFilters(item, props, rq.ComponentState)).ToList();
    }

    // ── Listing aggregates + row grouping ([Aggregate]/[GroupBy], mirrors Java's
    // ListingSummarySpec + CrudRepository.summaries) ─────────────────────────────

    /// <summary>What the row class asks to be summarized: the [Aggregate] columns
    /// (camelCase field id → function) and the [GroupBy] column, read once per request.</summary>
    private sealed record SummarySpec(
        List<(string Key, PropertyInfo Property, AggregateFunction Function)> Aggregates,
        PropertyInfo? GroupBy)
    {
        public bool IsEmpty => Aggregates.Count == 0 && GroupBy is null;

        public string? GroupKey => GroupBy is null ? null : Naming.CamelCase(GroupBy.Name);
    }

    private static SummarySpec SummarySpecOf(List<PropertyInfo> props) =>
        new(
            props.Select(p => (Property: p, Attribute: p.Find<AggregateAttribute>()))
                .Where(x => x.Attribute is not null)
                .Select(x => (Naming.CamelCase(x.Property.Name), x.Property, x.Attribute!.Function))
                .ToList(),
            props.FirstOrDefault(p => p.Find<GroupByAttribute>() != null));

    /// <summary>Prepends the group column to the sort (unless the user already sorts by it
    /// first), deduping any other occurrence of it.</summary>
    private static List<(string field, bool descending)> PrependGroupSort(
        List<(string field, bool descending)> sort, SummarySpec spec)
    {
        if (spec.GroupKey is not { } groupKey) return sort;
        if (sort.Count > 0 && sort[0].field == groupKey) return sort;
        var prepended = new List<(string field, bool descending)> { (groupKey, false) };
        prepended.AddRange(sort.Where(s => s.field != groupKey));
        return prepended;
    }

    /// <summary>Attaches the aggregation companion of the search next to the page: "aggregates"
    /// carries the totals of every [Aggregate] column over the WHOLE filtered result set (the
    /// listing's totals footer) and "groups" one summary per [GroupBy] group — its value (as
    /// text), row count and per-group aggregates, sorted case-insensitively by value (mirrors
    /// Java's ListingData.aggregates/groups filled by CrudRepository.summaries).</summary>
    private static void AttachSummaries(
        Dictionary<string, object?> crudData, SummarySpec spec, Func<List<object>> filteredRows)
    {
        if (spec.IsEmpty) return;
        var rows = filteredRows();
        crudData["aggregates"] = AggregateOver(rows, spec);
        crudData["groups"] = spec.GroupBy is null
            ? new List<Dictionary<string, object?>>()
            : rows.GroupBy(row => ValueOf(spec.GroupBy.GetValue(row)))
                .OrderBy(group => group.Key, StringComparer.OrdinalIgnoreCase)
                .Select(group => new Dictionary<string, object?>
                {
                    ["value"] = group.Key,
                    ["count"] = (long)group.Count(),
                    ["aggregates"] = AggregateOver(group.ToList(), spec),
                })
                .ToList();
    }

    // Java keys groups by String.valueOf(value) — a null group value becomes "null".
    private static string ValueOf(object? value) => value?.ToString() ?? "null";

    /// <summary>One aggregate per [Aggregate] column over <paramref name="rows"/>: count counts
    /// non-null values; sum/avg/min/max run over the numeric values as doubles (a column with no
    /// numeric values is omitted) — mirrors Java's CrudRepository.aggregateOver.</summary>
    private static Dictionary<string, object?> AggregateOver(List<object> rows, SummarySpec spec)
    {
        var totals = new Dictionary<string, object?>();
        foreach (var (key, property, function) in spec.Aggregates)
        {
            var values = rows.Select(property.GetValue).Where(value => value is not null).ToList();
            if (function == AggregateFunction.Count)
            {
                totals[key] = (long)values.Count;
                continue;
            }
            var numbers = values
                .Where(value => value is byte or sbyte or short or ushort or int or uint or long or ulong or float or double or decimal)
                .Select(value => Convert.ToDouble(value))
                .ToList();
            if (numbers.Count == 0) continue;
            totals[key] = function switch
            {
                AggregateFunction.Sum => numbers.Sum(),
                AggregateFunction.Avg => numbers.Average(),
                AggregateFunction.Min => numbers.Min(),
                AggregateFunction.Max => numbers.Max(),
                _ => null,
            };
        }
        return totals;
    }

    private static IEnumerable<(string field, bool descending)> EnumerateSort(Dictionary<string, object?>? state)
    {
        if (state is null || !state.TryGetValue("sort", out var raw) || raw is null) yield break;
        if (raw is System.Text.Json.JsonElement je && je.ValueKind == System.Text.Json.JsonValueKind.Array)
        {
            foreach (var el in je.EnumerateArray())
            {
                var field = el.TryGetProperty("field", out var f) ? f.GetString() ?? "" : "";
                var dir = el.TryGetProperty("direction", out var d) ? d.GetString() ?? "ascending" : "ascending";
                if (field.Length > 0) yield return (field, dir == "descending");
            }
        }
    }

    private static object? GetState(Dictionary<string, object?>? state, string key)
        => state is not null && state.TryGetValue(key, out var v) ? v : null;

    /// <summary>The id inside the calendar's <c>_clickedEvent</c> action parameter — a map
    /// {id, title, date, color} the frontend sends with every "openCalendarEvent" dispatch
    /// (mirrors Java reading httpRequest.runActionRq().parameters().get("_clickedEvent") as a Map).</summary>
    private static string? ClickedEventId(RunActionRqDto rq) => GetState(rq.Parameters, "_clickedEvent") switch
    {
        JsonElement { ValueKind: JsonValueKind.Object } el =>
            el.TryGetProperty("id", out var id) ? StateString(id) : null,
        IDictionary<string, object?> map => StateString(map.TryGetValue("id", out var id) ? id : null),
        _ => null,
    };

    private static int ToInt(object? v, int fallback)
    {
        if (v is null) return fallback;
        if (v is System.Text.Json.JsonElement je)
            return je.ValueKind == System.Text.Json.JsonValueKind.Number && je.TryGetInt32(out var n) ? n : fallback;
        return int.TryParse(v.ToString(), out var m) ? m : fallback;
    }

    /// <summary>None-safe, type-stable comparer: nulls first, numbers numerically, otherwise by
    /// case-insensitive string, so mixed columns never throw.</summary>
    private sealed class SortKeyComparer : IComparer<object?>
    {
        public static readonly SortKeyComparer Instance = new();
        public int Compare(object? a, object? b)
        {
            if (a is null && b is null) return 0;
            if (a is null) return -1;
            if (b is null) return 1;
            if (IsNumeric(a) && IsNumeric(b))
                return Convert.ToDouble(a).CompareTo(Convert.ToDouble(b));
            return string.Compare(a.ToString(), b.ToString(), StringComparison.OrdinalIgnoreCase);
        }
        private static bool IsNumeric(object o) => o is byte or sbyte or short or ushort or int or uint or long or ulong or float or double or decimal;
    }

    /// <summary>Applies the smart search bar's filter values (component state) over the fetched
    /// rows, mirroring the Java defaults: strings by case-insensitive containment, bools/numbers
    /// by equality, enums as IN over the multi-select values (list, or comma-joined after a URL
    /// restore), and &lt;field&gt;_from/&lt;field&gt;_to range bounds for temporals and
    /// [RangeFilter] numerics. A filter counts as applied when its key is present and non-blank.</summary>
    private static bool MatchesFilters(object item, List<PropertyInfo> props, IReadOnlyDictionary<string, object?> state)
    {
        foreach (var p in props)
        {
            var key = Naming.CamelCase(p.Name);
            var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
            var value = p.GetValue(item);

            var from = state.TryGetValue(key + "_from", out var rawFrom) ? StateString(rawFrom) : null;
            var to = state.TryGetValue(key + "_to", out var rawTo) ? StateString(rawTo) : null;
            if (!InRange(value, t, from, to)) return false;

            if (!state.TryGetValue(key, out var raw)) continue;
            if (t.IsEnum)
            {
                var wanted = MultiValues(raw);
                if (wanted.Count > 0 && !wanted.Contains(value?.ToString() ?? "")) return false;
                continue;
            }
            var text = StateString(raw);
            if (string.IsNullOrWhiteSpace(text)) continue;
            if (t == typeof(string))
            {
                if (!(value?.ToString() ?? "").Contains(text, StringComparison.OrdinalIgnoreCase)) return false;
            }
            else if (t == typeof(bool))
            {
                if (bool.TryParse(text, out var wanted) && !Equals(value, wanted)) return false;
            }
            else if (ReflectionMapper.IsNumeric(t))
            {
                if (decimal.TryParse(text, System.Globalization.NumberStyles.Any,
                        System.Globalization.CultureInfo.InvariantCulture, out var wanted)
                    && (value is null || Convert.ToDecimal(value) != wanted)) return false;
            }
            else if (!string.Equals(value?.ToString(), text, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
        }
        return true;
    }

    /// <summary>Range bounds compare at date granularity for temporals (the widget picks days)
    /// and as decimals for numerics; blank/unparseable bounds are ignored rather than fatal.</summary>
    private static bool InRange(object? value, Type t, string? from, string? to)
    {
        if (string.IsNullOrWhiteSpace(from) && string.IsNullOrWhiteSpace(to)) return true;
        if (value is null) return false;
        var invariant = System.Globalization.CultureInfo.InvariantCulture;
        if (ReflectionMapper.IsTemporal(t))
        {
            var day = value is DateOnly d ? d : DateOnly.FromDateTime((DateTime)value);
            if (!string.IsNullOrWhiteSpace(from) && DateOnly.TryParse(from, invariant, out var lower) && day < lower) return false;
            if (!string.IsNullOrWhiteSpace(to) && DateOnly.TryParse(to, invariant, out var upper) && day > upper) return false;
            return true;
        }
        if (ReflectionMapper.IsNumeric(t))
        {
            var v = Convert.ToDecimal(value);
            if (!string.IsNullOrWhiteSpace(from)
                && decimal.TryParse(from, System.Globalization.NumberStyles.Any, invariant, out var lower) && v < lower) return false;
            if (!string.IsNullOrWhiteSpace(to)
                && decimal.TryParse(to, System.Globalization.NumberStyles.Any, invariant, out var upper) && v > upper) return false;
        }
        return true;
    }

    private static string? StateString(object? raw) => raw switch
    {
        null => null,
        JsonElement { ValueKind: JsonValueKind.String } el => el.GetString(),
        JsonElement { ValueKind: JsonValueKind.Number } el => el.GetRawText(),
        JsonElement { ValueKind: JsonValueKind.True } => "true",
        JsonElement { ValueKind: JsonValueKind.False } => "false",
        JsonElement { ValueKind: JsonValueKind.Null or JsonValueKind.Undefined } => null,
        _ => raw.ToString(),
    };

    // multi-select values arrive as an array from a live client and comma-joined after a URL restore
    private static List<string> MultiValues(object? raw) => raw switch
    {
        JsonElement { ValueKind: JsonValueKind.Array } el =>
            el.EnumerateArray()
                .Select(e => e.ValueKind == JsonValueKind.String ? e.GetString() ?? "" : e.GetRawText())
                .Where(v => v != "").ToList(),
        _ => (StateString(raw) ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
    };

    private static object New(Type element) => Activator.CreateInstance(element)!;

    private static object GetOrNew(object crud, Type crudType, Type element, string? id) =>
        (id is not null ? crudType.GetMethod("Get")!.Invoke(crud, [id]) : null) ?? New(element);

    private static string? Delete(object crud, string id)
    {
        crud.GetType().GetMethod("Delete")!.Invoke(crud, [id]);
        return "Deleted";
    }

    private static List<string> RequiredMissing(object entity, Type element) =>
        ReflectionMapper.EditableProperties(element)
            .Where(p => p.Find<RequiredAttribute>() != null
                        && string.IsNullOrWhiteSpace(p.GetValue(entity)?.ToString()))
            .Select(p => p.Find<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name))
            .ToList();

    // ── Plain views ─────────────────────────────────────────────────────────────
    private UIIncrementDto RenderApp(Type appType, string title, RunActionRqDto rq, string? requestBaseUrl) =>
        UIIncrementDto.Of(
            commands: [new UICommandDto(Target(rq), "SetWindowTitle", title)],
            fragments: [new UIFragmentDto(Target(rq), _mapper.MapApp(appType, requestBaseUrl), null, null, "Replace", null)]);

    private UIIncrementDto Render(Type type, object instance, RunActionRqDto rq)
    {
        var route = string.IsNullOrEmpty(rq.ConsumedRoute) ? "_empty" : rq.ConsumedRoute!;
        return FragmentResponse(Title(type), _mapper.MapView(type, instance, route), rq,
            LookupLabels(type, instance, instance));
    }

    private static UIIncrementDto RunAction(Type type, object instance, RunActionRqDto rq)
    {
        var method = type.GetMethods(BindingFlags.Public | BindingFlags.Instance)
            .FirstOrDefault(m => !m.IsSpecialName && Naming.CamelCase(m.Name) == rq.ActionId);
        if (method is null) return Error($"Action not found: {rq.ActionId}");
        return MapResult(method.Invoke(instance, BuildArguments(method, rq)), rq);
    }

    /// <summary>Fills a method's parameters from the action request: a row-click's _clickedRow
    /// parameter is rebuilt into the parameter's type ([OnRowSelected] methods take the clicked
    /// row); anything unfillable is null (mirrors Java's RunMethodActionRunner.createParameters).</summary>
    private static object?[] BuildArguments(MethodInfo method, RunActionRqDto rq)
    {
        var parameters = method.GetParameters();
        if (parameters.Length == 0) return [];
        var clickedRow = rq.Parameters.TryGetValue("_clickedRow", out var raw)
                         && raw is JsonElement { ValueKind: JsonValueKind.Object } el
            ? el
            : (JsonElement?)null;
        return parameters.Select(p =>
        {
            // The action request itself can be injected (the ports' analogue of Java's
            // HttpRequest injection) — e.g. an undoable toast's undo action reads its
            // undoParameters from rq.Parameters.
            if (p.ParameterType == typeof(RunActionRqDto)) return rq;
            if (clickedRow is { } row && p.ParameterType is { IsClass: true } t && t != typeof(string))
            {
                var entity = Activator.CreateInstance(t)!;
                BindState(entity, row.EnumerateObject().ToDictionary(x => x.Name, x => (object?)x.Value));
                return (object?)entity;
            }
            return null;
        }).ToArray();
    }

    private static UIIncrementDto MapResult(object? result, RunActionRqDto? rq = null) => result switch
    {
        null => UIIncrementDto.Of(),
        Message msg => UIIncrementDto.Of(messages:
            [new MessageDto(msg.Variant.ToString().ToLowerInvariant(), "middle", msg.Title, msg.Text, msg.Duration,
                msg.UndoLabel, msg.UndoActionId, msg.UndoParameters)]),
        // Action-returned page banner(s) → UIIncrement.banners.
        PageBanner b => UIIncrementDto.Of(banners: [BannerOf(b)]),
        IEnumerable<PageBanner> bs => UIIncrementDto.Of(banners: bs.Select(BannerOf).Cast<object>().ToList()),
        // An overlay (drawer/dialog) → an ADD fragment on the initiator, so it stacks on top of
        // the page instead of replacing it (mirrors Java's FragmentDataSerializer.isOverlay).
        Drawer or Dialog => UIIncrementDto.Of(fragments:
            [new UIFragmentDto(rq?.InitiatorComponentId ?? "ux_main",
                ComponentMapper.Map((IComponent)result), null, null, "Add", null)]),
        // A route string → navigate; a UICommand → pass through (dispatchEvent / closeModal),
        // retargeting the "ux_main" placeholder at the initiator (the frontend drops commands
        // whose target matches no component id).
        string route when route.StartsWith('/') =>
            UIIncrementDto.Of(commands: [new UICommandDto(rq is null ? "ux_main" : Target(rq), "NavigateTo", route)]),
        UICommandDto cmd => UIIncrementDto.Of(commands:
            [cmd.TargetComponentId == "ux_main" && rq is not null ? cmd with { TargetComponentId = Target(rq) } : cmd]),
        _ => UIIncrementDto.Of(),
    };

    private static BannerDto BannerOf(PageBanner b) =>
        new(b.Theme.ToString().ToUpperInvariant(), b.Title, b.Description);

    // ── Helpers ──────────────────────────────────────────────────────────────────
    private static string Title(Type type) =>
        type.Find<TitleAttribute>()?.Value ?? Naming.Humanize(type.Name);

    private static UIIncrementDto FragmentResponse(string title, ComponentDto component, RunActionRqDto rq, object? data = null) =>
        UIIncrementDto.Of(
            commands: [new UICommandDto(Target(rq), "SetWindowTitle", title)],
            fragments: [new UIFragmentDto(Target(rq), component, null, data, "Replace", null)]);

    /// <summary>Fragments and commands address the component that initiated the request (the
    /// web frontend's top ux id is "_ux" — Java echoes the initiator the same way).</summary>
    private static string Target(RunActionRqDto rq) =>
        string.IsNullOrEmpty(rq.InitiatorComponentId) ? "ux_main" : rq.InitiatorComponentId!;

    /// <summary>Display labels for reference fields whose value is already set when the form
    /// renders: [Searchable] fields ask their selector, [Lookup] fields the view's
    /// ILookupLabelSupplier (falling back to a match among its IOptionsSupplier options). They
    /// ride as &lt;fieldId&gt;-label entries in the fragment data — where the renderer's combo
    /// looks before showing the raw id (mirrors Java's LookupLabelSupplier).</summary>
    private static Dictionary<string, object?>? LookupLabels(Type type, object instance, object supplierHost)
    {
        Dictionary<string, object?>? data = null;
        foreach (var p in ReflectionMapper.EditableProperties(type))
        {
            if (p.GetValue(instance)?.ToString() is not { Length: > 0 } id) continue;
            var fieldId = Naming.CamelCase(p.Name);
            string? label = null;
            if (p.Find<SearchableAttribute>() is { } searchable)
            {
                label = (Activator.CreateInstance(searchable.Selector) as ILookupLabelSupplier)
                    ?.Label(fieldId, id);
            }
            else if (p.Find<LookupAttribute>() is not null)
            {
                label = (supplierHost as ILookupLabelSupplier)?.Label(fieldId, id)
                        ?? (supplierHost as IOptionsSupplier)?.Options(fieldId)
                            .FirstOrDefault(o => o.Value == id)?.Label;
            }
            if (label is not null) (data ??= new Dictionary<string, object?>())[fieldId + "-label"] = label;
        }
        return data;
    }

    private static UIIncrementDto Navigate(string route, string? successText, RunActionRqDto rq) =>
        UIIncrementDto.Of(
            commands: [new UICommandDto(Target(rq), "NavigateTo", route)],
            messages: successText is null ? [] : [new MessageDto("success", "middle", "", successText, 3000)]);

    private static UIIncrementDto Error(string text) =>
        UIIncrementDto.Of(messages: [new MessageDto("error", "middle", "", text, 5000)]);

    private static readonly JsonSerializerOptions WebJson = new(JsonSerializerDefaults.Web);

    private static string? SearchText(RunActionRqDto rq) =>
        rq.ComponentState.TryGetValue("searchText", out var v) && v is JsonElement { ValueKind: JsonValueKind.String } el
            ? el.GetString()
            : null;

    private static object? CellValue(object? value) => value switch
    {
        null => null,
        DateOnly d => d.ToString("yyyy-MM-dd"),
        DateTime dt => dt.ToString("yyyy-MM-dd"),
        Enum e => e.ToString(),
        _ => value,
    };

    private static void BindState(object instance, IDictionary<string, object?> state)
    {
        foreach (var p in ReflectionMapper.EditableProperties(instance.GetType()))
        {
            var key = Naming.CamelCase(p.Name);
            if (!state.TryGetValue(key, out var raw) || raw is null) continue;
            var value = ConvertValue(raw, p.PropertyType);
            if (value is not null) p.SetValue(instance, value);
        }
    }

    private static object? ConvertValue(object raw, Type target)
    {
        target = Nullable.GetUnderlyingType(target) ?? target;
        if (raw is not JsonElement el) return raw;
        try
        {
            if (el.ValueKind is JsonValueKind.Null) return null;
            if (target == typeof(string)) return el.ValueKind == JsonValueKind.String ? el.GetString() : el.ToString();
            if (target == typeof(bool)) return el.GetBoolean();
            if (target == typeof(int)) return el.GetInt32();
            if (target == typeof(long)) return el.GetInt64();
            if (target == typeof(double)) return el.GetDouble();
            if (target == typeof(decimal)) return el.GetDecimal();
            if (target == typeof(DateOnly)) return DateOnly.Parse(el.GetString() ?? "");
            if (target == typeof(DateTime)) return DateTime.Parse(el.GetString() ?? "");
            if (target.IsEnum) return Enum.Parse(target, el.GetString() ?? "", ignoreCase: true);
            // Complex values (grid row lists…) arrive with camelCase keys — bind them as the web wire.
            return el.Deserialize(target, WebJson);
        }
        catch
        {
            return null;
        }
    }
}
