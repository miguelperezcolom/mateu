using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// Searching: listings, crud search, filters, sort, paging, totals and grouping (Java: SearchActionHandler, SearchRequestBuilder, FilterStateAssembler, CrudStore.find/summaries).
public sealed partial class SyncHandler
{
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
    /// bounds and stale constants dropped (mirrors Java's FilterStateAssembler) — bundles them
    /// with the free text and the pageable into one SearchRequest (the capability-model search
    /// signature, mirrors Java's SearchRequestBuilder), calls Search(request) and sorts +
    /// paginates the returned rows when the listing didn't page them itself.</summary>
    private static UIIncrementDto ListingSearch(object view, Type filtersType, Type rowType, RunActionRqDto rq)
    {
        var request = new SearchRequest(
            SearchText(rq), AssembleFilters(filtersType, rq.ComponentState), null, PageableOf(rq));
        var found = view.GetType().GetMethod("Search", [typeof(SearchRequest)])!.Invoke(view, [request]);
        return EmitListingData(found, rowType, rq, view);
    }

    /// <summary>The Pageable of a listing request, read from the component state (page/size/sort
    /// — mirrors Java's SearchRequestBuilder.pageable).</summary>
    private static Pageable PageableOf(RunActionRqDto rq) =>
        new(ToInt(GetState(rq.ComponentState, "page"), 0),
            ToInt(GetState(rq.ComponentState, "size"), 10),
            EnumerateSort(rq.ComponentState).Select(s => new SortSpec(s.field, s.descending)).ToList());

    /// <summary>Emits a search's ListingData as the standard listing data fragment: an unpaged
    /// result (ListingData.From) is sorted + paginated by the engine; a paged one (a listing that
    /// ran the count + page queries itself) goes to the wire as-is with its real total.</summary>
    private static UIIncrementDto EmitListingData(object? found, Type rowType, RunActionRqDto rq, object? listing = null)
    {
        var props = ReflectionMapper.EditableProperties(rowType).ToList();
        if (found is null) return PageRows([], props, rq);
        var content = ((System.Collections.IEnumerable)found.GetType().GetProperty("Content")!.GetValue(found)!)
            .Cast<object>().ToList();
        var summaries = ListingSummaries(found, content, rowType, listing);
        if (found.GetType().GetProperty("TotalElements")!.GetValue(found) is not long total)
            return PageRows(content, props, rq, summaries);
        var page = ToInt(GetState(rq.ComponentState, "page"), 0);
        var size = ToInt(GetState(rq.ComponentState, "size"), 10);
        if (size <= 0) size = content.Count == 0 ? 1 : content.Count;
        var rows = content.Select(item => RowDict(item, props)).ToList();
        return CrudData(rows, size, page, total, summaries, rq);
    }

    /// <summary>The group/aggregate companion of a custom listing's search: the groups the listing
    /// computed itself, else counted groups synthesized from the rows it returned by the row
    /// class's [GroupBy] column — then the [GroupAction]s the listing vetoes per group (Java's
    /// Listing.handleAction: withSynthesizedGroups + GroupActions.applyVisibility).</summary>
    private static Dictionary<string, object?> ListingSummaries(object found, List<object> content, Type rowType, object? listing)
    {
        var extras = new Dictionary<string, object?>();
        var groups = found.GetType().GetProperty("Groups")?.GetValue(found) as IReadOnlyList<GroupSummary>;
        if (groups is not { Count: > 0 }) groups = GroupSummaries.Synthesize(content, rowType);
        groups = GroupSummaries.ApplyVisibility(listing, groups);
        if (found.GetType().GetProperty("Aggregates")?.GetValue(found) is IReadOnlyDictionary<string, object?> aggregates)
            extras["aggregates"] = aggregates;
        if (groups is { Count: > 0 })
            extras["groups"] = groups.Select(g =>
            {
                var group = new Dictionary<string, object?>
                {
                    ["value"] = g.Value,
                    ["count"] = g.Count,
                    ["aggregates"] = g.Aggregates ?? new Dictionary<string, object?>(),
                };
                if (g.HiddenActions is { Count: > 0 }) group["hiddenActions"] = g.HiddenActions;
                return group;
            }).ToList();
        return extras;
    }

    private static UIIncrementDto CrudData(List<Dictionary<string, object?>> rows, int size, int page, long total,
        Dictionary<string, object?>? extras, RunActionRqDto rq)
    {
        var crud = new Dictionary<string, object?>
        {
            ["page"] = new { content = rows, pageSize = size, pageNumber = page, totalElements = total },
        };
        if (extras is not null)
            foreach (var (key, value) in extras) crud[key] = value;
        var data = new Dictionary<string, object?> { ["crud"] = crud };
        return UIIncrementDto.Of(fragments: [new UIFragmentDto(Target(rq), null, null, data, "Replace", null)]);
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
    private static UIIncrementDto PageRows(List<object> items, List<PropertyInfo> props, RunActionRqDto rq,
        Dictionary<string, object?>? extras = null)
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
        return CrudData(rows, size, page, total, extras, rq);
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
}
