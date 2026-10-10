using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Capability listings: the CapabilityCrud bridge serving only the declared routes/buttons (Java: CapabilityCrud).
public sealed partial class SyncHandler
{
    private (CapabilityProfile Profile, string BaseRoute)? ResolveCapability(RunActionRqDto rq)
    {
        if (!string.IsNullOrEmpty(rq.ServerSideType)
            && registry.Resolve(rq.ServerSideType, null) is { } byName
            && CapabilityProfile.Of(byName) is { } p1)
            return (p1, "/" + (byName.GetCustomAttribute<UIAttribute>()?.Route.Trim('/') ?? ""));

        if (registry.ResolveByPrefix(rq.Route) is { } pref && CapabilityProfile.Of(pref.Type) is { } p2)
            return (p2, "/" + pref.BaseRoute);

        return null;
    }

    private UIIncrementDto HandleCapabilityListing(CapabilityProfile profile, string baseRoute, RunActionRqDto rq)
    {
        ActionGuard.EnsureViewVisible(profile.ListingType);
        var listing = Activator.CreateInstance(profile.ListingType)!;
        var (mode, id) = ParseCrudRoute(baseRoute, rq.Route);

        // Reference fields on the detail/edit/create forms keep working like on cruds.
        if (rq.ActionId?.StartsWith("search-") == true) return FieldSearch(listing, rq);
        if (rq.ActionId?.StartsWith("codesearch-") == true) return FieldCodeSearch(profile.EditorType, rq);
        // A listing that opted into an export answers it with the whole filtered result set.
        if (ExportKind(listing, rq.ActionId) is { } export)
        {
            var all = new SearchRequest(
                profile.Searchable ? SearchText(rq) : null,
                profile.FiltersType is { } filtersType ? AssembleFilters(filtersType, rq.ComponentState) : null,
                null,
                new Pageable(0, int.MaxValue, PageableOf(rq).Sort));
            return ExportRows(export, profile.ListingInterface.GetMethod("Search")!.Invoke(listing, [all]),
                profile.RowType, rq);
        }

        return rq.ActionId switch
        {
            "search" => CapabilitySearch(profile, listing, rq),
            // Editable without navigable: rows open the EDITOR in a drawer over the listing (the
            // "editable listing" idiom — there is no view page in this mode).
            "view" or "edit" when profile.EditInDrawer && CapabilityRowId(rq, profile) is { } drawerId =>
                CapabilityEditDrawer(profile, listing, drawerId, baseRoute, rq),
            "new" when profile.EditInDrawer && profile.CanCreate =>
                CapabilityCreateDrawer(profile, listing, baseRoute, rq),
            // Navigable: the row click navigates to the read-only detail route.
            "view" when profile.CanView && CapabilityRowId(rq, profile) is { } viewId =>
                UIIncrementDto.Of(commands: [new UICommandDto(Target(rq), "NavigateTo", $"{baseRoute}/{viewId}")]),
            "edit" when profile.CanEdit && CapabilityRowId(rq, profile) is { } editId =>
                UIIncrementDto.Of(commands: [new UICommandDto(Target(rq), "NavigateTo", $"{baseRoute}/{editId}/edit")]),
            "new" when profile.CanCreate =>
                UIIncrementDto.Of(commands: [new UICommandDto(Target(rq), "NavigateTo", $"{baseRoute}/new")]),
            "save" when profile.CanEdit => CapabilitySave(profile, listing, baseRoute, rq),
            "create" when profile.CanCreate => CapabilityCreate(profile, listing, baseRoute, rq),
            "delete" when profile.CanDelete => CapabilityDelete(profile, listing, rq),
            "cancel-new" or "cancel-edit" or "cancel-view" when profile.EditInDrawer =>
                UIIncrementDto.Of(commands: [UICommandDto.CloseModal() with { TargetComponentId = Target(rq) }]),
            "cancel-new" or "cancel-edit" or "cancel-view" =>
                UIIncrementDto.Of(commands: [new UICommandDto(Target(rq), "NavigateTo", baseRoute)]),
            null or "" => mode switch
            {
                "new" when profile.CanCreate => CapabilityEntity(
                    profile, profile.FormType, CapabilityCreationForm(profile, listing),
                    "new", $"{baseRoute}/new", rq),
                "view" when profile.CanView && id is not null => CapabilityEntity(
                    profile, profile.DetailType, CapabilityView(profile, listing, id),
                    "view", $"{baseRoute}/{id}", rq),
                "edit" when profile.CanEdit && profile.CanView && id is not null => CapabilityEntity(
                    profile, profile.EditorType, CapabilityEdit(profile, listing, id),
                    "edit", $"{baseRoute}/{id}/edit", rq),
                _ => FragmentResponse(Title(profile.ListingType),
                    _mapper.MapCapabilityListing(profile, baseRoute), rq),
            },
            { } aid when aid.StartsWith("action-on-row-") => CapabilityActionOnRows(profile, listing, rq),
            _ => Error($"Action not found: {rq.ActionId}"),
        };
    }

    private static UIIncrementDto CapabilitySearch(CapabilityProfile profile, object listing, RunActionRqDto rq)
    {
        // Free text only when the listing declared ISearchable; typed filters only when it
        // declared IFilterable (mirrors Java's SearchRequestBuilder).
        var request = new SearchRequest(
            profile.Searchable ? SearchText(rq) : null,
            profile.FiltersType is { } filtersType ? AssembleFilters(filtersType, rq.ComponentState) : null,
            null,
            PageableOf(rq));
        var found = profile.ListingInterface.GetMethod("Search")!.Invoke(listing, [request]);
        return EmitListingData(found, profile.RowType, rq, listing);
    }

    private static object CapabilityView(CapabilityProfile profile, object listing, string id) =>
        profile.NavigableInterface!.GetMethod("View")!.Invoke(listing, [ToId(id, profile.IdType)])!;

    private static object CapabilityEdit(CapabilityProfile profile, object listing, string id) =>
        profile.EditableInterface!.GetMethod("Edit")!.Invoke(listing, [ToId(id, profile.IdType)])!;

    private static object CapabilityCreationForm(CapabilityProfile profile, object listing) =>
        profile.CreatableInterface!.GetMethod("CreationForm")!.Invoke(listing, [])!;

    private UIIncrementDto CapabilityEntity(
        CapabilityProfile profile, Type formType, object entity, string mode, string route, RunActionRqDto rq) =>
        FragmentResponse(Title(profile.ListingType),
            _mapper.MapCapabilityForm(profile.ListingType, formType, entity,
                readOnly: mode == "view", CapabilityToolbar(profile, mode), route), rq);

    /// <summary>Only the buttons the declared capabilities allow: the view page offers Edit only
    /// when editable; edit/create forms offer Cancel + Save.</summary>
    private static List<ButtonDto> CapabilityToolbar(CapabilityProfile profile, string mode)
    {
        if (mode == "view")
        {
            var toolbar = new List<ButtonDto> { new("Back to list", "cancel-view") };
            if (profile.CanEdit) toolbar.Add(new ButtonDto("Edit", "edit"));
            return toolbar;
        }
        return
        [
            new("Cancel", mode == "new" ? "cancel-new" : "cancel-edit"),
            new("Save", mode == "new" ? "create" : "save") { ButtonStyle = "primary" },
        ];
    }

    private UIIncrementDto CapabilityEditDrawer(
        CapabilityProfile profile, object listing, string id, string baseRoute, RunActionRqDto rq) =>
        CapabilityDrawer(profile, profile.EditorType, CapabilityEdit(profile, listing, id),
            "edit", $"{baseRoute}/{id}/edit", rq);

    private UIIncrementDto CapabilityCreateDrawer(
        CapabilityProfile profile, object listing, string baseRoute, RunActionRqDto rq) =>
        CapabilityDrawer(profile, profile.FormType, CapabilityCreationForm(profile, listing),
            "new", $"{baseRoute}/new", rq);

    /// <summary>The editable-listing drawer: the capability form riding as the content of a
    /// Drawer emitted as an Add fragment over the listing (same shape as the crud's
    /// EditInDrawer).</summary>
    private UIIncrementDto CapabilityDrawer(
        CapabilityProfile profile, Type formType, object entity, string mode, string route, RunActionRqDto rq)
    {
        var form = _mapper.MapCapabilityForm(
            profile.ListingType, formType, entity, readOnly: false, CapabilityToolbar(profile, mode), route);
        var drawer = new ClientSideComponentDto(
            new DrawerMetadataDto("crud-edit-drawer", mode == "new" ? "New" : "Edit", form)
                { Width = "36rem" },
            "crud-edit-drawer", [], null, null, null);
        return UIIncrementDto.Of(fragments:
            [new UIFragmentDto(Target(rq), drawer, null, null, "Add", null)]);
    }

    private UIIncrementDto CapabilitySave(
        CapabilityProfile profile, object listing, string baseRoute, RunActionRqDto rq)
    {
        var editor = New(profile.EditorType);
        BindState(editor, rq.ComponentState);
        var id = profile.EditableInterface!.GetMethod("Save")!.Invoke(listing, [editor]);
        return CapabilityPersisted(profile, baseRoute, id, rq);
    }

    private UIIncrementDto CapabilityCreate(
        CapabilityProfile profile, object listing, string baseRoute, RunActionRqDto rq)
    {
        var form = New(profile.FormType);
        BindState(form, rq.ComponentState);
        var id = profile.CreatableInterface!.GetMethod("Create")!.Invoke(listing, [form]);
        return CapabilityPersisted(profile, baseRoute, id, rq);
    }

    /// <summary>After a save/create: drawer mode closes the drawer emitting the saved event and
    /// re-runs the search in place (no navigation — same contract as the crud's EditInDrawer);
    /// otherwise navigate back to the detail (navigable) or the listing.</summary>
    private static UIIncrementDto CapabilityPersisted(
        CapabilityProfile profile, string baseRoute, object? id, RunActionRqDto rq)
    {
        if (profile.EditInDrawer)
            return UIIncrementDto.Of(
                commands:
                [
                    UICommandDto.CloseModal(SavedInDrawerEvent) with { TargetComponentId = Target(rq) },
                    new UICommandDto(Target(rq), "RunAction",
                        new { actionId = "search", targetComponentId = Target(rq) }),
                ],
                messages: [new MessageDto("success", "middle", "", "Saved", 3000)]);
        return Navigate(profile.CanView && id is not null ? $"{baseRoute}/{id}" : baseRoute, "Saved", rq);
    }

    private static UIIncrementDto CapabilityDelete(CapabilityProfile profile, object listing, RunActionRqDto rq)
    {
        var idField = Naming.CamelCase(profile.RowType.GetProperty("Id")?.Name ?? "Id");
        var ids = (System.Collections.IList)Activator.CreateInstance(
            typeof(List<>).MakeGenericType(profile.IdType))!;
        if (GetState(rq.ComponentState, "crud_selected_items")
            is JsonElement { ValueKind: JsonValueKind.Array } selected)
            foreach (var rowEl in selected.EnumerateArray())
                if (rowEl.ValueKind == JsonValueKind.Object
                    && rowEl.TryGetProperty(idField, out var idEl)
                    && StateString(idEl) is { } raw)
                    ids.Add(ToId(raw, profile.IdType));
        profile.DeletableInterface!.GetMethod("DeleteAllById")!.Invoke(listing, [ids]);
        var refreshed = CapabilitySearch(profile, listing, rq);
        return UIIncrementDto.Of(
            fragments: refreshed.Fragments,
            messages: [new MessageDto("success", "middle", "", "Deleted", 3000)]);
    }

    /// <summary>A [ListToolbarButton] bulk action on the listing: same dispatch as on cruds —
    /// the selected rows rebuilt as typed row objects fill a List&lt;TRow&gt; parameter; a
    /// null/void result re-runs the capability search.</summary>
    private static UIIncrementDto CapabilityActionOnRows(CapabilityProfile profile, object listing, RunActionRqDto rq)
    {
        var name = rq.ActionId!["action-on-row-".Length..];
        var method = ActionGuard.ResolveRowAction(profile.ListingType, name);
        if (method is null) return Error($"Action not found: {rq.ActionId}");
        ActionGuard.EnsureMayInvoke(profile.ListingType, method, rq.ActionId);
        var result = method.Invoke(listing, BuildBulkArguments(method, rq));
        return result is null ? CapabilitySearch(profile, listing, rq) : MapResult(result, rq);
    }

    /// <summary>The record id of a row action, from the action parameters or the component state
    /// (under the row type's camelCased Id property).</summary>
    private static string? CapabilityRowId(RunActionRqDto rq, CapabilityProfile profile)
    {
        var idField = Naming.CamelCase(profile.RowType.GetProperty("Id")?.Name ?? "Id");
        return StateString(GetState(rq.Parameters, idField))
            ?? StateString(GetState(rq.ComponentState, idField));
    }

    /// <summary>Maps the raw route/state id into the listing's declared TId (mirrors Java's
    /// CrudIdConverter for the well-known scalar id types).</summary>
    private static object ToId(string raw, Type idType)
    {
        var t = Nullable.GetUnderlyingType(idType) ?? idType;
        if (t == typeof(string)) return raw;
        if (t == typeof(int)) return int.Parse(raw, System.Globalization.CultureInfo.InvariantCulture);
        if (t == typeof(long)) return long.Parse(raw, System.Globalization.CultureInfo.InvariantCulture);
        if (t == typeof(Guid)) return Guid.Parse(raw);
        if (t.IsEnum) return Enum.Parse(t, raw, ignoreCase: true);
        return Convert.ChangeType(raw, t, System.Globalization.CultureInfo.InvariantCulture);
    }
}
