using System.Text.Json.Nodes;

namespace Mateu.Core.Mcp;

/// <summary>
/// Projects a serialized UIIncrementDto (the wire) into a flat, agent-friendly screen — the C#
/// twin of the sidecar's projection.mjs and the Java McpProjection. All hosts walk the SAME
/// serialized wire, so they produce the SAME projection (parity by construction). The derivation
/// rules are normative (doc/.../reference/wire-specification.md § Agent operability). Part of the
/// agent-operability plane (design/riu-agent-operability-plan.md, P4).
///
/// <para>Pure (no I/O). A System.Text.Json.Nodes node has a single parent, so any node copied from
/// the source into the output is <c>DeepClone()</c>d.</para>
/// </summary>
public static class McpProjection
{
    /// <summary>The server encodes the root/empty route as "_empty"; treat it as "".</summary>
    public static string NormalizeRoute(string? route)
    {
        if (route is null) return "";
        var r = route.TrimStart('/');
        return r == "_empty" ? "" : r;
    }

    public static JsonObject Project(JsonNode? increment)
    {
        var inc = increment as JsonObject ?? new JsonObject();
        var commands = inc["commands"] as JsonArray ?? new JsonArray();
        var messages = inc["messages"] as JsonArray ?? new JsonArray();
        var fragments = inc["fragments"] as JsonArray ?? new JsonArray();

        JsonObject? serverSide = null, page = null, crudl = null, state = null;
        var fieldNodes = new List<JsonObject>();
        var buttonsByAction = new List<KeyValuePair<string, string?>>();
        var buttonSeen = new HashSet<string>();

        foreach (var fragEl in fragments)
        {
            if (fragEl is not JsonObject fragment) continue;
            if (state is null && fragment["state"] is JsonObject st) state = st;
            var root = fragment["component"] ?? fragment;
            DeepVisit(root, node =>
            {
                if (Str(node["type"]) == "ServerSide" && serverSide is null) serverSide = node;
                var t = MdType(node);
                var md = node["metadata"] as JsonObject;
                if (t == "FormField" && md is { } mf && mf["fieldId"] is not null) fieldNodes.Add(mf);
                else if (t == "Page" && page is null) page = md;
                else if (t == "Crudl" && crudl is null) crudl = md;
                else if (t == "Button" && md is { } mb && mb["actionId"] is not null)
                {
                    var aid = Str(mb["actionId"])!;
                    if (buttonSeen.Add(aid)) buttonsByAction.Add(new(aid, Str(mb["label"])));
                }
            });
        }

        var values = state ?? serverSide?["initialData"] as JsonObject ?? new JsonObject();

        // Fields (deduped by id, declaration order).
        var fields = new JsonArray();
        var seenField = new HashSet<string>();
        foreach (var md in fieldNodes)
        {
            var fid = Str(md["fieldId"])!;
            if (!seenField.Add(fid)) continue;
            var f = new JsonObject
            {
                ["id"] = fid,
                ["label"] = Str(md["label"]) ?? fid,
                ["dataType"] = Str(md["dataType"]) ?? "string",
                ["stereotype"] = Str(md["stereotype"]) ?? "regular",
                ["required"] = Bool(md["required"]),
                ["readOnly"] = Bool(md["readOnly"]),
            };
            if (values.ContainsKey(fid)) f["value"] = values[fid]?.DeepClone();
            if (md["options"] is JsonArray opts && opts.Count > 0)
            {
                var arr = new JsonArray();
                foreach (var oEl in opts)
                {
                    if (oEl is not JsonObject o) continue;
                    arr.Add(new JsonObject
                    {
                        ["value"] = o["value"]?.DeepClone(),
                        ["label"] = Str(o["label"]) ?? o["value"]?.ToString() ?? "",
                    });
                }
                f["options"] = arr;
            }
            fields.Add(f);
        }

        // Actions: ids the component claims (RBAC already applied server-side), labels from buttons.
        var actions = new JsonArray();
        var seenAction = new HashSet<string>();
        if (serverSide?["actions"] is JsonArray declared)
        {
            foreach (var aEl in declared)
            {
                if (aEl is not JsonObject a) continue;
                var id = Str(a["id"]);
                if (id is null || !seenAction.Add(id)) continue;
                var ao = new JsonObject { ["id"] = id, ["label"] = Label(buttonsByAction, id) ?? id };
                var shortcut = Str(a["shortcut"]);
                if (!string.IsNullOrEmpty(shortcut)) ao["shortcut"] = shortcut;
                if (Bool(a["confirmationRequired"])) ao["confirmationRequired"] = true;
                var href = Str(a["href"]);
                if (!string.IsNullOrEmpty(href)) ao["href"] = href;
                actions.Add(ao);
            }
        }
        foreach (var kv in buttonsByAction)
        {
            if (seenAction.Add(kv.Key))
                actions.Add(new JsonObject { ["id"] = kv.Key, ["label"] = kv.Value ?? kv.Key });
        }

        string? title = CommandData(commands, "SetWindowTitle");
        if (title is null && page is not null) title = Str(page["pageTitle"]) ?? Str(page["title"]);
        if (title is null && crudl is not null) title = Str(crudl["title"]);

        var outObj = new JsonObject
        {
            ["route"] = serverSide is not null ? NormalizeRoute(Str(serverSide["route"])) : null,
            ["serverSideType"] = serverSide is not null ? Str(serverSide["serverSideType"]) : null,
            ["pageType"] = (serverSide is not null ? Str(serverSide["pageType"]) : null)
                           ?? (page is not null ? Str(page["pageType"]) : null),
            ["wireVersion"] = Str(inc["wireVersion"]),
            ["title"] = title,
            ["subtitle"] = (page is not null ? Str(page["subtitle"]) : null)
                           ?? (crudl is not null ? Str(crudl["subtitle"]) : null),
            ["fields"] = fields,
            ["actions"] = actions,
            ["state"] = values.DeepClone(),
        };

        if (crudl is not null)
        {
            var columns = new JsonArray();
            if (crudl["columns"] is JsonArray cols)
                foreach (var cEl in cols)
                {
                    var md = (cEl as JsonObject)?["metadata"] as JsonObject ?? cEl as JsonObject;
                    var cid = Str(md?["id"]) ?? Str(md?["fieldId"]);
                    var label = Str(md?["caption"]) ?? Str(md?["label"]);
                    if (cid is not null || label is not null)
                        columns.Add(new JsonObject { ["id"] = cid, ["label"] = label });
                }
            var filters = new JsonArray();
            if (crudl["filters"] is JsonArray fs)
                foreach (var fEl in fs)
                {
                    if (fEl is not JsonObject fo) continue;
                    filters.Add(new JsonObject
                    {
                        ["id"] = Str(fo["fieldId"]),
                        ["label"] = Str(fo["label"]) ?? Str(fo["fieldId"]),
                        ["dataType"] = Str(fo["dataType"]) ?? "string",
                    });
                }
            outObj["listing"] = new JsonObject
            {
                ["title"] = Str(crudl["title"]),
                ["searchable"] = Bool(crudl["searchable"]),
                ["columns"] = columns,
                ["filters"] = filters,
            };
        }

        if (messages.Count > 0)
        {
            var ms = new JsonArray();
            foreach (var mEl in messages)
            {
                if (mEl is not JsonObject m) continue;
                ms.Add(new JsonObject
                {
                    ["text"] = Str(m["text"]) ?? Str(m["message"]) ?? "",
                    ["type"] = Str(m["type"]) ?? "info",
                });
            }
            outObj["messages"] = ms;
        }

        var notable = new JsonArray();
        foreach (var cEl in commands)
        {
            if (cEl is not JsonObject c) continue;
            var type = Str(c["type"]);
            if (type is not null && type != "SetWindowTitle")
                notable.Add(new JsonObject { ["type"] = type, ["data"] = c["data"]?.DeepClone() });
        }
        if (notable.Count > 0) outObj["commands"] = notable;

        return outObj;
    }

    static string? Label(List<KeyValuePair<string, string?>> buttons, string id)
    {
        foreach (var kv in buttons)
            if (kv.Key == id) return kv.Value;
        return null;
    }

    static string? CommandData(JsonArray commands, string type)
    {
        foreach (var cEl in commands)
            if (cEl is JsonObject c && Str(c["type"]) == type) return Str(c["data"]);
        return null;
    }

    static string? MdType(JsonObject node) =>
        node["metadata"] is JsonObject md ? Str(md["type"]) : null;

    static void DeepVisit(JsonNode? node, Action<JsonObject> fn)
    {
        if (node is JsonObject obj)
        {
            fn(obj);
            foreach (var kv in obj) DeepVisit(kv.Value, fn);
        }
        else if (node is JsonArray arr)
        {
            foreach (var item in arr) DeepVisit(item, fn);
        }
    }

    static string? Str(JsonNode? n) => n is JsonValue v && v.TryGetValue<string>(out var s) ? s : null;

    static bool Bool(JsonNode? n) => n is JsonValue v && v.TryGetValue<bool>(out var b) && b;
}
