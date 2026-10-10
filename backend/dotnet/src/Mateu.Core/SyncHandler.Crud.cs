using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Crud<T>: list / detail / edit / new / save / delete, bulk actions, export, inline row update and optimistic locking (Java: crud action handlers, FilteredAutoCrud, OptimisticLock).
public sealed partial class SyncHandler
{
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
        ActionGuard.EnsureViewVisible(crudType);
        var crud = Activator.CreateInstance(crudType)!;
        var (mode, id) = ParseCrudRoute(baseRoute, rq.Route);

        // The row editing actions of a list property of the entity form (Java resolves the list on
        // the crud's entity class: FieldCrudActionRunner.getViewModelClass).
        if (FieldCrudTarget(element, rq.ActionId) is { } fieldCrud)
            return HandleFieldCrud(fieldCrud.Property, fieldCrud.FieldId, fieldCrud.Suffix, rq);
        // A [Lookup] field on the entity form searches its options through the crud view.
        if (rq.ActionId?.StartsWith("search-") == true) return FieldSearch(crud, rq);
        // A [Searchable] field on the entity form opens its selector dialog.
        if (rq.ActionId?.StartsWith("codesearch-") == true) return FieldCodeSearch(element, rq);

        return rq.ActionId switch
        {
            "search" => CrudSearch(crud, element, rq),
            "create" or "save" => CrudSave(crud, crudType, element, id, rq, baseRoute),
            // the edit drawer's "Save and next" (CrudDisplay.SaveAndNext): the id rides the route
            // of the drawer's form, or its state
            "save-and-next" => CrudSave(crud, crudType, element, id ?? RowId(rq, element), rq, baseRoute),
            "update-row" => UpdateRow(crud, crudType, element, rq),
            // CrudDisplay: a Disabled (or Off) New/Delete cannot be forced from the client either
            "delete" or "new" when !Allowed(DisplayOf(crud), rq.ActionId!) =>
                Error($"Action not available: {rq.ActionId}"),
            "delete" => Navigate(baseRoute, id is null ? null : Delete(crud, id), rq),
            // Crud.CsvExportable / ExcelExportable / PdfExportable: only a crud that offers the
            // export answers its export-* action (the id is wire input).
            { } exportId when ExportKind(crud, exportId) is { } kind => Export(kind, crud, element, rq),
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
        // Only a [ListToolbarButton] method is a bulk row action — never Save/Delete/any public
        // method of the crud (security: the actionId comes from the wire).
        var method = ActionGuard.ResolveRowAction(crudType, name);
        if (method is null) return Error($"Action not found: {rq.ActionId}");
        ActionGuard.EnsureMayInvoke(crudType, method, rq.ActionId);
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

    private static CrudDisplay DisplayOf(object crud) =>
        (crud as ICrudAffordances)?.Display ?? CrudDisplay.Defaults;

    private static bool Allowed(CrudDisplay display, string actionId) => actionId switch
    {
        "new" => display.Create.Enabled(),
        "delete" => display.Delete.Enabled(),
        _ => true,
    };

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
        Type crudType, Type element, object entity, string mode, string route, RunActionRqDto rq, object crud) =>
        UIIncrementDto.Of(fragments: [CrudDrawerFragment(crudType, element, entity, mode, route, rq, crud)]);

    /// <summary>The create/edit drawer as an Add fragment. It always carries the same id
    /// (crud-edit-drawer): re-sending it while it is open refreshes it in place — how "Save and
    /// next" moves it on to the next record (<paramref name="initialData"/> = that record) and how a
    /// failed save shows its <paramref name="errorMessage"/> as a danger Notice over the form with
    /// what was typed (mirrors Java's CrudDrawerBuilder).</summary>
    private UIFragmentDto CrudDrawerFragment(
        Type crudType, Type element, object entity, string mode, string route, RunActionRqDto rq, object crud,
        object? initialData = null, string? errorMessage = null)
    {
        ComponentDto form = _mapper.MapEntityForm(crudType, element, entity, mode, route, crud as ICrudAffordances);
        if (errorMessage is not null)
            form = new ClientSideComponentDto(new VerticalLayoutMetadataDto(), null,
            [
                new ClientSideComponentDto(
                    new NoticeMetadataDto(errorMessage, "danger", null, null, null, FullWidth: true),
                    "crud-drawer-error", [], null, null, null),
                form,
            ], "width: 100%;", null, null);
        var width = crudType.GetProperty("EditDrawerWidth")?.GetValue(crud) as string ?? "36rem";
        var drawer = new ClientSideComponentDto(
            new DrawerMetadataDto("crud-edit-drawer", mode == "new" ? "New" : "Edit", form)
                { Width = width, InitialData = initialData },
            "crud-edit-drawer", [], null, null, null);
        return new UIFragmentDto(Target(rq), drawer, null,
            LookupLabels(element, entity, Activator.CreateInstance(crudType)!), "Add", null);
    }

    // ── Capability listings (IListing + declared capabilities; mirrors Java's CapabilityCrud) ──

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

        var saveAndNext = rq.ActionId == "save-and-next";
        if (saveAndNext && (!EditInDrawer(crud) || !DisplayOf(crud).SaveAndNext.Enabled()))
            return UIIncrementDto.Of();
        try
        {
            crudType.GetMethod("Save")!.Invoke(crud, [entity]);
        }
        catch (TargetInvocationException failure)
            when (failure.InnerException is not null and not MateuForbiddenException
                  && EditInDrawer(crud) && DisplayOf(crud).ErrorBanner.Shown())
        {
            // drawer mode: a failed save keeps the drawer open and shows WHY inside it (the Redwood
            // create-edit-drawer error banner) with the values the user typed, and announces it
            // assertively — nothing takes focus (mirrors Java's PersistActionHandler).
            var message = string.IsNullOrWhiteSpace(failure.InnerException.Message)
                ? "The record could not be saved"
                : failure.InnerException.Message;
            var mode = id is null ? "new" : "edit";
            var route = id is null ? $"{baseRoute}/new" : $"{baseRoute}/{id}/edit";
            return UIIncrementDto.Of(
                commands: [UICommandDto.AnnounceAssertive(message) with { TargetComponentId = Target(rq) }],
                fragments: [CrudDrawerFragment(crudType, element, entity, mode, route, rq, crud,
                    _mapper.EntityState(element, entity), message)]);
        }
        if (saveAndNext
            && (element.GetProperty("Id")?.GetValue(entity)?.ToString() ?? id) is { } savedId
            && (crud as ICrudAffordances)?.NextIdAfter(savedId) is { } nextId)
        {
            // the drawer stays open and is re-sent with the same id for the next row — the Add
            // fragment of an open overlay refreshes it in place — while the listing refreshes
            // through the same saved event the close would have emitted
            var next = GetOrNew(crud, crudType, element, nextId);
            return UIIncrementDto.Of(
                commands:
                [
                    UICommandDto.MarkAsClean() with { TargetComponentId = Target(rq) },
                    UICommandDto.DispatchEvent(SavedInDrawerEvent) with { TargetComponentId = Target(rq) },
                    new UICommandDto(Target(rq), "RunAction",
                        new { actionId = "search", targetComponentId = Target(rq) }),
                ],
                messages: [new MessageDto("success", "middle", "", "Saved", 3000)],
                fragments: [CrudDrawerFragment(crudType, element, next, "edit", $"{baseRoute}/{nextId}/edit", rq,
                    crud, _mapper.EntityState(element, next))]);
        }
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
}
