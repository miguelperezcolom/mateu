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

    public UIIncrementDto Handle(RunActionRqDto rq)
    {
        // 1. App shell at the root route.
        if (string.IsNullOrEmpty(rq.ActionId)
            && registry.Resolve(rq.ServerSideType, rq.Route) is { } t0
            && t0.GetCustomAttribute<AppAttribute>() is { } app)
            return RenderApp(t0, app.Title);

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
            case "next": step++; break;
        }
        return FragmentResponse(Title(type), _mapper.MapWizard(type, wizard, route, step));
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
            "delete" => Navigate(baseRoute, id is null ? null : Delete(crud, id)),
            null or "" => mode switch
            {
                "new" => RenderEntity(crudType, element, New(element), "new", $"{baseRoute}/new"),
                "view" => RenderEntity(crudType, element, GetOrNew(crud, crudType, element, id), "view", $"{baseRoute}/{id}"),
                "edit" => RenderEntity(crudType, element, GetOrNew(crud, crudType, element, id), "edit", $"{baseRoute}/{id}/edit"),
                _ => RenderCrudList(crudType, crud, baseRoute),
            },
            _ => Error($"Action not found: {rq.ActionId}"),
        };
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

    private UIIncrementDto RenderCrudList(Type crudType, object crud, string baseRoute) =>
        FragmentResponse(Title(crudType), _mapper.MapView(crudType, crud, baseRoute));

    private UIIncrementDto RenderEntity(Type crudType, Type element, object entity, string mode, string route) =>
        FragmentResponse(Title(crudType), _mapper.MapEntityForm(crudType, element, entity, mode, route),
            LookupLabels(element, entity, Activator.CreateInstance(crudType)!));

    private UIIncrementDto CrudSave(object crud, Type crudType, Type element, string? id, RunActionRqDto rq, string baseRoute)
    {
        // Start from the stored entity (so untouched fields survive) and apply the edited fields.
        var entity = id is not null ? GetOrNew(crud, crudType, element, id) : New(element);
        BindState(entity, rq.ComponentState);
        if (id is not null) element.GetProperty("Id")?.SetValue(entity, id);

        var missing = RequiredMissing(entity, element);
        if (missing.Count > 0)
            return Error("Please fill: " + string.Join(", ", missing));

        crudType.GetMethod("Save")!.Invoke(crud, [entity]);
        return Navigate(baseRoute, "Saved");
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
        crudType.GetMethod("Save")!.Invoke(crud, [entity]);
        return UIIncrementDto.Of(messages: [new MessageDto("success", "middle", "", "Saved", 3000)]);
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
            new UICommandDto("ux_main", "DispatchEvent", new CustomEventDto("value-changed",
                new Dictionary<string, object?> { ["fieldId"] = fieldId, ["value"] = selected.Id })),
            new UICommandDto("ux_main", "DispatchEvent", new CustomEventDto("data-changed",
                new Dictionary<string, object?> { ["key"] = fieldId + "-label", ["value"] = selected.Label })),
            new UICommandDto("ux_main", "DispatchEvent", new CustomEventDto("close-modal-requested", null)),
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
        return UIIncrementDto.Of(fragments: [new UIFragmentDto("crud", null, null, data, "Replace", null)]);
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

        // Database pushdown: an overridden Find runs search+filter+sort+paginate as one query
        // and returns the page with its real total — skip the in-memory pipeline entirely.
        var pageable = new Pageable(
            ToInt(GetState(rq.ComponentState, "page"), 0),
            ToInt(GetState(rq.ComponentState, "size"), 10),
            EnumerateSort(rq.ComponentState).Select(s => new SortSpec(s.field, s.descending)).ToList());
        var found = instance.GetType().GetMethod("Find")!
            .Invoke(instance, [SearchText(rq), rq.ComponentState, pageable]);
        if (found is not null)
        {
            var content = (System.Collections.IEnumerable)found.GetType().GetProperty("Content")!.GetValue(found)!;
            var totalElements = (long)found.GetType().GetProperty("TotalElements")!.GetValue(found)!;
            var pushedRows = content.Cast<object>().Select(item => RowDict(item, props)).ToList();
            var pushedData = new { crud = new { page = new { content = pushedRows, pageSize = pageable.Size, pageNumber = pageable.Page, totalElements } } };
            return UIIncrementDto.Of(fragments: [new UIFragmentDto("crud", null, null, pushedData, "Replace", null)]);
        }

        var fetched = (System.Collections.IEnumerable)instance.GetType().GetMethod("Fetch")!.Invoke(instance, [SearchText(rq)])!;
        var propByCamel = props.ToDictionary(p => Naming.CamelCase(p.Name), p => p);

        // filter
        var items = fetched.Cast<object>().Where(item => MatchesFilters(item, props, rq.ComponentState)).ToList();

        // sort — Pageable.sort is a list of { field, direction:'ascending'|'descending' }; applied
        // last-spec-first so the first spec is the primary key.
        foreach (var spec in EnumerateSort(rq.ComponentState).AsEnumerable().Reverse())
        {
            if (!propByCamel.TryGetValue(spec.field, out var prop)) continue;
            var ordered = spec.descending
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
        var data = new { crud = new { page = new { content = rows, pageSize = size, pageNumber = page, totalElements = total } } };
        return UIIncrementDto.Of(fragments: [new UIFragmentDto("crud", null, null, data, "Replace", null)]);
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
    private UIIncrementDto RenderApp(Type appType, string title) =>
        UIIncrementDto.Of(
            commands: [new UICommandDto("ux_main", "SetWindowTitle", title)],
            fragments: [new UIFragmentDto("ux_main", _mapper.MapApp(appType), null, null, "Replace", null)]);

    private UIIncrementDto Render(Type type, object instance, RunActionRqDto rq)
    {
        var route = string.IsNullOrEmpty(rq.ConsumedRoute) ? "_empty" : rq.ConsumedRoute!;
        return FragmentResponse(Title(type), _mapper.MapView(type, instance, route),
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
            [new MessageDto(msg.Variant.ToString().ToLowerInvariant(), "middle", msg.Title, msg.Text, msg.Duration)]),
        // Action-returned page banner(s) → UIIncrement.banners.
        PageBanner b => UIIncrementDto.Of(banners: [BannerOf(b)]),
        IEnumerable<PageBanner> bs => UIIncrementDto.Of(banners: bs.Select(BannerOf).Cast<object>().ToList()),
        // An overlay (drawer/dialog) → an ADD fragment on the initiator, so it stacks on top of
        // the page instead of replacing it (mirrors Java's FragmentDataSerializer.isOverlay).
        Drawer or Dialog => UIIncrementDto.Of(fragments:
            [new UIFragmentDto(rq?.InitiatorComponentId ?? "ux_main",
                ComponentMapper.Map((IComponent)result), null, null, "Add", null)]),
        // A route string → navigate; a UICommand → pass through (dispatchEvent / closeModal).
        string route when route.StartsWith('/') =>
            UIIncrementDto.Of(commands: [new UICommandDto("ux_main", "NavigateTo", route)]),
        UICommandDto cmd => UIIncrementDto.Of(commands: [cmd]),
        _ => UIIncrementDto.Of(),
    };

    private static BannerDto BannerOf(PageBanner b) =>
        new(b.Theme.ToString().ToUpperInvariant(), b.Title, b.Description);

    // ── Helpers ──────────────────────────────────────────────────────────────────
    private static string Title(Type type) =>
        type.Find<TitleAttribute>()?.Value ?? Naming.Humanize(type.Name);

    private static UIIncrementDto FragmentResponse(string title, ComponentDto component, object? data = null) =>
        UIIncrementDto.Of(
            commands: [new UICommandDto("ux_main", "SetWindowTitle", title)],
            fragments: [new UIFragmentDto("ux_main", component, null, data, "Replace", null)]);

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

    private static UIIncrementDto Navigate(string route, string? successText) =>
        UIIncrementDto.Of(
            commands: [new UICommandDto("ux_main", "NavigateTo", route)],
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
