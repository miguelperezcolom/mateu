using System.Reflection;
using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// The grid-field crud: the row editing actions of a LIST property — add / create / select / save /
// remove / move / prev / next / cancel — answered on the form's own state (Java: FieldCrudActionRunner,
// CrudFieldActionDispatcher and the crudfieldhandlers package).
public sealed partial class SyncHandler
{
    private static readonly JsonSerializerOptions RowJson = new(JsonSerializerDefaults.Web);

    /// <summary>The list property and suffix an action id addresses (<c>guests_add</c> → Guests,
    /// "_add"), or null when the id is not a row-editing action of a list property of
    /// <paramref name="type"/>.</summary>
    private static (PropertyInfo Property, string FieldId, string Suffix)? FieldCrudTarget(Type type, string? actionId)
    {
        if (string.IsNullOrEmpty(actionId)) return null;
        var underscore = actionId.IndexOf('_');
        if (underscore <= 0) return null;
        var fieldId = actionId[..underscore];
        var suffix = actionId[underscore..];
        if (!ReflectionMapper.ListActionSuffixes.Contains(suffix)) return null;
        var property = ReflectionMapper.EditableProperties(type).FirstOrDefault(p =>
            Naming.CamelCase(p.Name) == fieldId && ReflectionMapper.ListElementType(p.PropertyType) is not null);
        return property is null ? null : (property, fieldId, suffix);
    }

    /// <summary>Dispatches a row-editing action. The rows travel in the component state as
    /// <c>state[fieldId]</c>; the detail form's own values arrive as <c>parameters.initiatorState</c>
    /// (its buttons bubble to this form). Visibility of the detail panel rides in
    /// <c>_show_detail[fieldId]</c> / <c>_editing[fieldId]</c>, which the grid renderer reads.</summary>
    private UIIncrementDto HandleFieldCrud(PropertyInfo property, string fieldId, string suffix, RunActionRqDto rq)
    {
        var rowType = ReflectionMapper.ListElementType(property.PropertyType)!;
        var showDetail = MapOf(GetState(rq.ComponentState, "_show_detail"));
        var editing = MapOf(GetState(rq.ComponentState, "_editing"));
        var rows = RowsOf(GetState(rq.ComponentState, fieldId));

        UIIncrementDto Stated(Dictionary<string, object?> state, params UIFragmentDto[] more) =>
            UIIncrementDto.Of(fragments: [new UIFragmentDto(Target(rq), null, state, null, "Replace", null), .. more]);

        Dictionary<string, object?> NewState()
        {
            var state = new Dictionary<string, object?>(rq.ComponentState)
            {
                ["_show_detail"] = showDetail,
                ["_editing"] = editing,
            };
            return state;
        }

        switch (suffix)
        {
            case "_create":
            case "_create-and-stay":
            {
                var andStay = suffix == "_create-and-stay";
                showDetail[fieldId] = andStay;
                editing[fieldId] = !andStay;
                var item = RowFrom(rowType, InitiatorState(rq));
                rows.Add(item);
                EnsureRowNumbers(rows);
                var state = NewState();
                state[fieldId] = rows;
                return andStay
                    ? Stated(state, DetailForm(property, fieldId, rowType, "New", NewRow(rowType), null,
                        RowEditorButtons(fieldId, "_create", another: true), [], rq))
                    : Stated(state);
            }
            case "_add":
            {
                // Inline-editing grids render no detail form: "+" appends an empty row, edited in
                // place (Java: AddActionHandler, the InlineEditing branch).
                if (property.Find<InlineEditingAttribute>() != null)
                {
                    showDetail[fieldId] = false;
                    editing[fieldId] = false;
                    var empty = NewRow(rowType);
                    empty["_rowNumber"] = Guid.NewGuid().ToString();
                    rows.Add(empty);
                    var inlineState = NewState();
                    inlineState[fieldId] = rows;
                    return Stated(inlineState);
                }
                showDetail[fieldId] = true;
                editing[fieldId] = false;
                return Stated(NewState(), DetailForm(property, fieldId, rowType, "New", NewRow(rowType), null,
                    RowEditorButtons(fieldId, "_create", another: true), [], rq));
            }
            case "_select":
            {
                showDetail[fieldId] = true;
                editing[fieldId] = true;
                var rowNumber = StateString(GetState(rq.Parameters, "_rowNumber"));
                var position = rows.FindIndex(r => StateString(r.GetValueOrDefault("_rowNumber")) == rowNumber);
                var data = position >= 0 ? new Dictionary<string, object?>(rows[position]) : NewRow(rowType);
                data["_position"] = $"{position + 1}/{rows.Count}";
                return Stated(NewState(), DetailForm(property, fieldId, rowType, "Edit", data,
                    new Text("${state['_position']}"), RowEditorButtons(fieldId, "_save", another: false),
                    [new ButtonDto("Prev", fieldId + "_prev"), new ButtonDto("Next", fieldId + "_next")], rq));
            }
            case "_selected":
            {
                var state = NewState();
                if (RowsOf(GetState(rq.ComponentState, fieldId + "_selected_items")).FirstOrDefault() is { } values)
                {
                    foreach (var (key, value) in values) state[fieldId + "-" + key] = value;
                    var position = rows.FindIndex(r => SameRowNumber(r, values));
                    state[fieldId + "_position"] = $"{position + 1}/{rows.Count}";
                }
                return Stated(state);
            }
            case "_prev":
            case "_next":
            {
                var rowNumber = StateString(InitiatorState(rq).GetValueOrDefault("_rowNumber"));
                var current = rows.FindIndex(r => StateString(r.GetValueOrDefault("_rowNumber")) == rowNumber);
                var direction = suffix == "_next" ? 1 : -1;
                if (direction < 0 && current <= 0) return Error("This is the first item. No previous item to select.");
                if (direction > 0 && (current < 0 || current >= rows.Count - 1)) return Error("No more items");
                var next = current + direction;
                var data = new Dictionary<string, object?>(rows[next])
                {
                    ["_position"] = $"{next + 1}/{rows.Count}",
                };
                return UIIncrementDto.Of(fragments:
                    [new UIFragmentDto(fieldId + "-container", null, data, null, "Replace", null)]);
            }
            case "_save":
            {
                showDetail[fieldId] = false;
                editing[fieldId] = false;
                var edited = InitiatorState(rq);
                var row = rows.FirstOrDefault(r => SameRowNumber(r, edited));
                if (row is not null)
                    foreach (var (key, value) in edited) row[key] = value;
                var state = NewState();
                state[fieldId] = rows;
                return Stated(state);
            }
            case "_remove":
            {
                showDetail[fieldId] = false;
                var state = NewState();
                if (GetState(rq.ComponentState, fieldId + "_selected_items") is { } selectedRaw)
                {
                    var selected = RowsOf(selectedRaw);
                    state[fieldId] = rows.Where(r => !selected.Any(s => SameRow(s, r))).ToList();
                }
                return Stated(state);
            }
            case "_move-up":
            case "_move-down":
            {
                showDetail[fieldId] = false;
                var state = NewState();
                if (GetState(rq.ComponentState, fieldId + "_selected_items") is { } selectedRaw)
                {
                    var selected = RowsOf(selectedRaw);
                    bool IsSelected(Dictionary<string, object?> r) => selected.Any(s => SameRow(s, r));
                    if (suffix == "_move-up")
                    {
                        // bubble upward; a group of selected rows moves together
                        for (var i = 1; i < rows.Count; i++)
                            if (IsSelected(rows[i]) && !IsSelected(rows[i - 1]))
                                (rows[i - 1], rows[i]) = (rows[i], rows[i - 1]);
                    }
                    else
                    {
                        for (var i = rows.Count - 2; i >= 0; i--)
                            if (IsSelected(rows[i]) && !IsSelected(rows[i + 1]))
                                (rows[i + 1], rows[i]) = (rows[i], rows[i + 1]);
                    }
                    state[fieldId] = rows;
                }
                return Stated(state);
            }
            default: // _cancel
                showDetail[fieldId] = false;
                editing[fieldId] = false;
                return Stated(NewState());
        }
    }

    /// <summary>The row detail form: a ServerSide component of the ROW type (its buttons carry no
    /// action of the row, so they bubble to the hosting form, which claims them and receives the
    /// row's values as initiatorState) rendered into the grid's <c>&lt;field&gt;-container</c>
    /// (Java: CrudFieldHandlerHelper.buildDetailForm + RunActionUseCase.wrap).</summary>
    private UIFragmentDto DetailForm(PropertyInfo property, string fieldId, Type rowType, string verb,
        Dictionary<string, object?> data, IComponent? header, IReadOnlyList<ButtonDto> buttons,
        IReadOnlyList<ButtonDto> toolbar, RunActionRqDto rq)
    {
        var container = fieldId + "-container";
        var form = _mapper.MapRowEditor(rowType, DetailTitle(verb, rowType), data,
            header is null ? null : ComponentMapper.Map(header), toolbar, buttons, rq.Route ?? "");
        return new UIFragmentDto(container, form, data, null, "Replace", container);
    }

    /// <summary>A row editor's actions, at the foot of its form: Save first and primary, "Save and
    /// add another" when creating, Cancel last and tertiary (Java: rowEditorButtons).</summary>
    private static List<ButtonDto> RowEditorButtons(string fieldId, string saveSuffix, bool another)
    {
        var buttons = new List<ButtonDto> { new("Save", fieldId + saveSuffix) { ButtonStyle = "primary" } };
        if (another) buttons.Add(new ButtonDto("Save and add another", fieldId + "_create-and-stay"));
        buttons.Add(new ButtonDto("Cancel", fieldId + "_cancel") { ButtonStyle = "tertiary" });
        return buttons;
    }

    /// <summary>"New room" / "Edit room": the verb and the row's name as a person says it, a
    /// [Title] on the row class winning (Java: CrudFieldHandlerHelper.detailTitle).</summary>
    internal static string DetailTitle(string verb, Type rowType)
    {
        if (rowType.Find<TitleAttribute>()?.Value is { Length: > 0 } title) return $"{verb} {title}";
        var name = System.Text.RegularExpressions.Regex.Replace(rowType.Name, "(ViewModel|View|Dto|DTO|Form|Row)$", "");
        if (name.Length == 0) name = rowType.Name;
        name = System.Text.RegularExpressions.Regex.Replace(name, "([a-z0-9])([A-Z])", "$1 $2");
        name = System.Text.RegularExpressions.Regex.Replace(name, "([A-Z])([A-Z][a-z])", "$1 $2");
        return $"{verb} {name.ToLowerInvariant()}";
    }

    private static Dictionary<string, object?> InitiatorState(RunActionRqDto rq) =>
        MapOf(GetState(rq.Parameters, "initiatorState"));

    /// <summary>A row instance built from wire values (camelCase keys), as a wire dict — so the
    /// row keeps its declared defaults for whatever the editor did not send.</summary>
    private static Dictionary<string, object?> RowFrom(Type rowType, Dictionary<string, object?> values)
    {
        if (rowType == typeof(string) || rowType.IsPrimitive) return new Dictionary<string, object?>(values);
        var instance = Activator.CreateInstance(rowType)!;
        var state = values.ToDictionary(kv => kv.Key, kv => (object?)JsonSerializer.SerializeToElement(kv.Value));
        BindState(instance, state);
        var row = MapOf(JsonSerializer.SerializeToNode(instance, RowJson));
        if (values.TryGetValue("_rowNumber", out var rowNumber)) row["_rowNumber"] = rowNumber;
        return row;
    }

    private static Dictionary<string, object?> NewRow(Type rowType) =>
        rowType == typeof(string) || rowType.IsPrimitive || rowType.IsAbstract
            ? new Dictionary<string, object?>()
            : MapOf(JsonSerializer.SerializeToNode(Activator.CreateInstance(rowType), RowJson));

    private static void EnsureRowNumbers(List<Dictionary<string, object?>> rows)
    {
        foreach (var row in rows)
            if (!row.ContainsKey("_rowNumber")) row["_rowNumber"] = Guid.NewGuid().ToString();
    }

    private static bool SameRowNumber(Dictionary<string, object?> a, Dictionary<string, object?> b) =>
        a.TryGetValue("_rowNumber", out var x) && b.TryGetValue("_rowNumber", out var y)
        && StateString(x) == StateString(y);

    /// <summary>Selected-row identity: the row number when both carry one, else value equality.</summary>
    private static bool SameRow(Dictionary<string, object?> a, Dictionary<string, object?> b) =>
        a.ContainsKey("_rowNumber") && b.ContainsKey("_rowNumber")
            ? SameRowNumber(a, b)
            : JsonNode.DeepEquals(JsonSerializer.SerializeToNode(a), JsonSerializer.SerializeToNode(b));

    /// <summary>A wire object (JsonElement, JsonNode or dictionary) as a mutable dictionary.</summary>
    private static Dictionary<string, object?> MapOf(object? raw)
    {
        var node = raw switch
        {
            null => null,
            JsonNode n => n,
            JsonElement el => JsonNode.Parse(el.GetRawText()),
            _ => JsonSerializer.SerializeToNode(raw),
        };
        var map = new Dictionary<string, object?>();
        if (node is JsonObject obj)
            foreach (var (key, value) in obj) map[key] = value?.DeepClone();
        return map;
    }

    /// <summary>A wire list of row objects as mutable dictionaries (non-object items are skipped).</summary>
    private static List<Dictionary<string, object?>> RowsOf(object? raw)
    {
        var node = raw switch
        {
            null => null,
            JsonNode n => n,
            JsonElement el => JsonNode.Parse(el.GetRawText()),
            _ => JsonSerializer.SerializeToNode(raw),
        };
        return node is JsonArray array
            ? array.OfType<JsonObject>().Select(o => MapOf(o)).ToList()
            : [];
    }
}
