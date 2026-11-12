using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Mateu.AspNetCore.Testing;

/// <summary>A message (toast) the UI showed.</summary>
public sealed record MateuMessage(string Variant, string Title, string Text)
{
    /// <summary>Whether its variant is <c>error</c>.</summary>
    public bool IsError => string.Equals(Variant, "error", StringComparison.OrdinalIgnoreCase);

    /// <inheritdoc />
    public override string ToString() => (Variant.Length > 0 ? Variant + ": " : "") + (Title.Length > 0 ? Title + " — " : "") + Text;
}

/// <summary>A command the server sent (NavigateTo, SetWindowTitle, CloseModal…), already applied.</summary>
public sealed record MateuCommand(string Type, JsonNode? Data);

/// <summary>
/// One browser tab on a Mateu UI, with no browser: what is on screen and the gestures a user makes
/// on it. Every gesture sends the request a renderer would send and applies the answer as the
/// renderers do — following an app shell to its home, a crud to its listing, a navigation to its
/// target, running the listing's first search and stacking dialogs and drawers over the page.
/// Client-side rules, browser REST sources and scripts are not run. Not thread-safe.
/// EXPERIMENTAL (3.0).
/// </summary>
public sealed class MateuScreen
{
    private const int MaxDepth = 40;

    private readonly MateuTest _mateu;
    private readonly ClaimsPrincipal? _user;
    private readonly List<Frame> _frames = [new Frame()];
    private readonly List<MateuMessage> _messages = [];
    private readonly List<MateuCommand> _commands = [];
    private readonly JsonObject _appState = new();
    private readonly Stack<List<Action>> _later = new();
    private JsonObject _app = new();
    private string _title = "";
    private int _depth;

    internal MateuScreen(MateuTest mateu, ClaimsPrincipal? user)
    {
        _mateu = mateu;
        _user = user;
    }

    // ── what is on screen ─────────────────────────────────────────────────────────────

    /// <summary>The route the tab is on, as the address bar would show it.</summary>
    public string Route { get; private set; } = "";

    /// <summary>The window title (SetWindowTitle), else the page header's title.</summary>
    public string Title => _title.Length > 0 ? _title : PageTitle;

    /// <summary>The title of the page header, empty when none.</summary>
    public string PageTitle =>
        Json.Collect(Top.Component, n => Json.Str(n["type"]) is "Page" or "Form" or "App" or "Crud"
                                         && Json.Str(n["title"]).Length > 0)
            .Select(n => Json.Str(n["title"])).FirstOrDefault() ?? "";

    /// <summary>The menu labels of the app shell around the screen ("Group > Entry" inside a group).</summary>
    public IReadOnlyList<string> Menu
    {
        get
        {
            var out_ = new List<string>();
            void Walk(JsonNode? options, string prefix)
            {
                foreach (var option in Json.Items(options))
                {
                    var label = prefix + Json.Str(option?["label"]);
                    var children = Json.Items(option?["submenus"]).Concat(Json.Items(option?["children"])).ToList();
                    if (children.Count == 0) out_.Add(label);
                    else Walk(new JsonArray(children.Select(c => c?.DeepClone()).ToArray()), label + " > ");
                }
            }
            Walk(_app["menu"], "");
            return out_;
        }
    }

    /// <summary>The fields on screen (the top dialog or drawer when one is open), in order; a
    /// listing's filters are not among them.</summary>
    public IReadOnlyList<MateuField> Fields
    {
        get
        {
            var frame = Top;
            var filters = new HashSet<JsonNode>(ReferenceEqualityComparer.Instance);
            foreach (var crud in CrudsOf(frame))
            foreach (var f in Json.Items(crud["metadata"]?["filters"]))
                if (f is not null) filters.Add(f);
            return Json.Collect(frame.Component, n => Json.Str(n["type"]) == "FormField" && Json.Str(n["fieldId"]).Length > 0)
                .Where(n => !filters.Contains(n))
                .Select(n => new MateuField(this, frame, n)).ToList();
        }
    }

    /// <summary>A field, by id or label; fails listing the fields there are.</summary>
    public MateuField Field(string idOrLabel) =>
        FindField(idOrLabel) ?? throw new MateuTestException(
            $"No field \"{idOrLabel}\" on {Where}. Fields: {string.Join(", ", Fields.Select(f => f.Id))}");

    /// <summary>Whether a field is on screen (false for one the caller may not see).</summary>
    public bool HasField(string idOrLabel) => FindField(idOrLabel) is not null;

    private MateuField? FindField(string idOrLabel)
    {
        var all = Fields;
        return all.FirstOrDefault(f => f.Id == idOrLabel)
               ?? all.FirstOrDefault(f => string.Equals(f.Label, idOrLabel, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>The buttons on screen (toolbar, form buttons, listing toolbar), in order.</summary>
    public IReadOnlyList<MateuButton> Buttons
    {
        get
        {
            var frame = Top;
            var nodes = Json.Collect(frame.Component, n => Json.Str(n["type"]) == "Button").ToList();
            foreach (var n in Json.Collect(frame.Component, n => n["actionId"] is not null && n["label"] is not null
                                                                && n["type"] is null && n["fieldId"] is null))
                if (!nodes.Contains(n, ReferenceEqualityComparer.Instance)) nodes.Add(n);
            return nodes.Select(n => new MateuButton(this, frame, n)).ToList();
        }
    }

    /// <summary>A button, by label, id or action id; fails listing the buttons there are.</summary>
    public MateuButton Button(string labelOrAction) =>
        FindButton(labelOrAction) ?? throw new MateuTestException(
            $"No button \"{labelOrAction}\" on {Where}. Buttons: {string.Join(", ", Buttons.Select(b => b.ToString()))}");

    /// <summary>Whether a button is on screen.</summary>
    public bool HasButton(string labelOrAction) => FindButton(labelOrAction) is not null;

    private MateuButton? FindButton(string labelOrAction)
    {
        var all = Buttons;
        return all.FirstOrDefault(b => b.Label == labelOrAction)
               ?? all.FirstOrDefault(b => string.Equals(b.Label, labelOrAction, StringComparison.OrdinalIgnoreCase))
               ?? all.FirstOrDefault(b => string.Equals(b.ActionId, labelOrAction, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>The listing on screen; fails when there is none.</summary>
    public MateuListing Listing()
    {
        var crud = CrudsOf(Top).FirstOrDefault() ?? throw new MateuTestException("No listing on " + Where);
        return new MateuListing(this, Top, crud);
    }

    /// <summary>Whether the screen shows a listing.</summary>
    public bool HasListing => CrudsOf(Top).Any();

    private static IEnumerable<JsonObject> CrudsOf(Frame frame) =>
        Json.Collect(frame.Component, n => Json.Str(n["metadata"]?["type"]) == "Crud");

    /// <summary>Whether this text is shown on screen: a title, label, text, value, cell or message.</summary>
    public bool Shows(string text) =>
        Title.Contains(text) || _messages.Any(m => m.Text.Contains(text) || m.Title.Contains(text))
                             || Json.ContainsText(Top.Component, text) || Json.ContainsText(Top.State, text)
                             || Json.ContainsText(Top.Data, text);

    /// <summary>The messages (toasts) the last gesture produced.</summary>
    public IReadOnlyList<MateuMessage> Messages => _messages.ToList();

    /// <summary>The last message of the last gesture; fails when it produced none.</summary>
    public MateuMessage LastMessage =>
        _messages.Count > 0 ? _messages[^1] : throw new MateuTestException("The last gesture showed no message, on " + Where);

    /// <summary>The commands the server sent for the last gesture, already applied.</summary>
    public IReadOnlyList<MateuCommand> Commands => _commands.ToList();

    /// <summary>Whether a dialog or drawer is open over the page.</summary>
    public bool HasOverlay => _frames.Count > 1;

    /// <summary>The title of the dialog or drawer open over the page ("" when none).</summary>
    public string OverlayTitle => HasOverlay ? Top.OverlayTitle : "";

    /// <summary>Closes the top dialog or drawer the way its ✕ does (nothing is sent).</summary>
    public MateuScreen CloseOverlay()
    {
        if (!HasOverlay) throw new MateuTestException("No dialog or drawer is open on " + Where);
        _frames.RemoveAt(_frames.Count - 1);
        return this;
    }

    /// <summary>The state the screen sends with its next action (a copy).</summary>
    public JsonObject State => (JsonObject)Top.State.DeepClone();

    /// <summary>The component tree on screen, as the wire JSON.</summary>
    public JsonObject Component => Top.Component;

    // ── gestures ──────────────────────────────────────────────────────────────────────

    /// <summary>Goes to a route, like typing it in the address bar (overlays close).</summary>
    public MateuScreen Navigate(string route)
    {
        StartGesture();
        GoTo(route);
        return this;
    }

    /// <summary>Runs an action of the screen by id, as a button or trigger would.</summary>
    public MateuScreen Run(string actionId, IDictionary<string, object?>? parameters = null)
    {
        StartGesture();
        Dispatch(Top, actionId, Json.Object(parameters));
        return this;
    }

    internal void StartGesture()
    {
        _messages.Clear();
        _commands.Clear();
    }

    // ── the client ────────────────────────────────────────────────────────────────────

    internal Frame Top => _frames[^1];

    internal string Where => Route.Length == 0 ? "the root" : Route;

    private void GoTo(string route)
    {
        _frames.RemoveRange(1, _frames.Count - 1);
        var page = new Frame();
        _frames[0] = page;
        Route = route;
        // a fresh load, as a browser landing on the URL sends it
        Load(page, route, "_empty", "");
    }

    internal void Dispatch(Frame frame, string actionId, JsonObject parameters)
    {
        if (_later.Count > 0)
        {
            _later.Peek().Add(() => DispatchNow(frame, actionId, parameters));
            return;
        }
        DispatchNow(frame, actionId, parameters);
    }

    private void DispatchNow(Frame frame, string actionId, JsonObject parameters)
    {
        var action = frame.Action(actionId);
        if (action?["restAction"] is JsonObject)
            throw new NotSupportedException($"\"{actionId}\" calls a REST endpoint from the browser: the harness does not call it");
        var target = frame.TargetFor(actionId);
        Send(frame, Request(target.Route, target.ConsumedRoute, target.ServerSideType,
            frame.ComponentId, (JsonObject)frame.State.DeepClone(), parameters, actionId));
    }

    private void Load(Frame frame, string route, string consumedRoute, string serverSideType)
    {
        if (_later.Count > 0)
        {
            _later.Peek().Add(() => LoadNow(frame, route, consumedRoute, serverSideType));
            return;
        }
        LoadNow(frame, route, consumedRoute, serverSideType);
    }

    private void LoadNow(Frame frame, string route, string consumedRoute, string serverSideType)
    {
        frame.Route = route;
        frame.ConsumedRoute = consumedRoute;
        frame.ServerSideType = serverSideType;
        Send(frame, Request(route, consumedRoute, serverSideType, frame.ComponentId,
            (JsonObject)frame.Seed.DeepClone(), new JsonObject(), ""));
    }

    private JsonObject Request(string route, string consumedRoute, string serverSideType, string componentId,
        JsonObject state, JsonObject parameters, string actionId) => new()
    {
        ["route"] = route,
        ["consumedRoute"] = consumedRoute,
        ["serverSideType"] = serverSideType.Length == 0 ? null : serverSideType,
        ["initiatorComponentId"] = componentId.Length == 0 ? "ux" : componentId,
        ["componentState"] = state,
        ["appState"] = _appState.DeepClone(),
        ["parameters"] = parameters,
        ["actionId"] = actionId,
    };

    private void Send(Frame frame, JsonObject rq)
    {
        if (++_depth > MaxDepth)
        {
            _depth = 0;
            throw new MateuTestException($"The UI keeps loading (more than {MaxDepth} chained requests) on {Where}");
        }
        try
        {
            var answer = _mateu.Exchange(rq, _user);
            var followUps = new List<Action>();
            _later.Push(followUps);
            try
            {
                Apply(frame, answer);
            }
            finally
            {
                _later.Pop();
            }
            foreach (var next in followUps) next();
        }
        finally
        {
            _depth--;
        }
    }

    private void Apply(Frame frame, JsonObject answer)
    {
        foreach (var fragment in Json.Items(answer["fragments"]))
            if (fragment is JsonObject f) ApplyFragment(frame, f);
        foreach (var m in Json.Items(answer["messages"]))
            _messages.Add(new MateuMessage(Json.Str(m?["variant"]), Json.Str(m?["title"]), Json.Str(m?["text"])));
        if (answer["appState"] is JsonObject state)
            foreach (var (k, v) in state) _appState[k] = v?.DeepClone();
        foreach (var c in Json.Items(answer["commands"]))
        {
            var command = new MateuCommand(Json.Str(c?["type"]), c?["data"]?.DeepClone());
            _commands.Add(command);
            ApplyCommand(frame, command);
        }
    }

    private void ApplyCommand(Frame frame, MateuCommand command)
    {
        switch (command.Type)
        {
            case "SetWindowTitle":
                _title = Json.Str(command.Data);
                break;
            case "NavigateTo":
                var target = command.Data is JsonObject o ? Json.Str(o["route"]) : Json.Str(command.Data);
                if (target.Length > 0) GoTo(target);
                break;
            case "PushStateToHistory":
                var route = Json.Str(command.Data);
                if (route.Length > 0) Route = route;
                break;
            case "CloseModal":
                if (_frames.Count > 1) _frames.Remove(_frames.Contains(frame) && frame != _frames[0] ? frame : _frames[^1]);
                break;
            case "RunAction":
                var data = command.Data as JsonObject;
                var actionId = data is null ? Json.Str(command.Data) : Json.Str(data["actionId"]);
                if (actionId.Length > 0)
                    Dispatch(_frames.Contains(frame) ? frame : Top, actionId,
                        data?["parameters"] is JsonObject p ? (JsonObject)p.DeepClone() : new JsonObject());
                break;
        }
    }

    private void ApplyFragment(Frame frame, JsonObject fragment)
    {
        var component = fragment["component"] as JsonObject;
        var state = fragment["state"] as JsonObject ?? new JsonObject();
        var data = fragment["data"] as JsonObject;
        if (component is null)
        {
            if (data is { Count: > 0 })
            {
                foreach (var (k, v) in data) frame.Data[k] = v?.DeepClone();
                return;
            }
            if (state["_route"] is not null && state["_componentRoute"] is not null)
            {
                // a crud moving between its own routes (list, /new, /{id}, /{id}/edit)
                var @base = Json.Str(state["_componentRoute"]);
                if (@base.Length == 0) @base = frame.ConsumedRoute;
                var inner = Json.Str(state["_route"]);
                var full = inner == "list" ? @base : @base + inner;
                var sst = frame.OrchestratorServerSideType.Length > 0 ? frame.OrchestratorServerSideType : frame.ServerSideType;
                Route = full;
                var next = new Frame { OrchestratorServerSideType = sst, OrchestratorRoute = @base };
                Json.Merge(next.Seed, frame.Seed);
                Replace(frame, next);
                Load(next, full, @base, sst);
                return;
            }
            Json.Merge(frame.State, state);
            return;
        }
        var metadata = component["metadata"] as JsonObject ?? new JsonObject();
        var kind = Json.Str(metadata["type"]);
        if (Json.Str(fragment["action"]) == "Add" && kind is "Dialog" or "Drawer")
        {
            var overlay = new Frame
            {
                Opener = frame, Route = frame.Route, ConsumedRoute = frame.ConsumedRoute,
                ServerSideType = frame.ServerSideType, ComponentId = frame.ComponentId,
                OverlayTitle = Json.Str(metadata["headerTitle"]), Component = component,
            };
            overlay.Actions.AddRange(frame.Actions);
            if (metadata["initialData"] is JsonObject initial) Json.Merge(overlay.State, initial);
            Json.Merge(overlay.State, state);
            _frames.Add(overlay);
            var innerSs = Json.Collect(component, n => Json.Str(n["type"]) == "ServerSide" && n != component).FirstOrDefault();
            if (innerSs is not null) overlay.Adopt(innerSs);
            return;
        }
        Render(frame, component, state, data);
    }

    private void Replace(Frame old, Frame next)
    {
        var i = _frames.IndexOf(old);
        if (i >= 0) _frames[i] = next;
    }

    private void Render(Frame frame, JsonObject component, JsonObject state, JsonObject? data)
    {
        var metadata = component["metadata"] as JsonObject ?? new JsonObject();
        var serverSide = Json.Str(component["type"]) == "ServerSide";
        if (!serverSide && Json.Str(metadata["type"]) == "App")
        {
            FollowHome(frame, metadata, new JsonObject());
            return;
        }
        if (!serverSide)
        {
            frame.Component = component;
            Json.Merge(frame.State, state);
            return;
        }
        var children = Json.Items(component["children"]).ToList();
        if (children.Count == 0)
        {
            // a component announced, loaded on its own
            var next = new Frame { ComponentId = Json.Str(component["id"]) };
            Json.Merge(next.Seed, frame.Seed);
            Replace(frame, next);
            Load(next, Json.Str(component["route"]), frame.ConsumedRoute, Json.Str(component["serverSideType"]));
            return;
        }
        if (children[0] is JsonObject first && Json.Str(first["type"]) == "ClientSide"
                                            && Json.Str(first["metadata"]?["type"]) == "App")
        {
            // a crud's (or an island's) chrome-less shell: what it shows is its home
            var seed = component["initialData"] is JsonObject init ? (JsonObject)init.DeepClone() : new JsonObject();
            Json.Merge(seed, state);
            FollowHome(frame, (JsonObject)first["metadata"]!, seed);
            return;
        }
        frame.Adopt(component);
        Json.Merge(frame.State, state);
        if (data is not null) Json.Merge(frame.Data, data);
        foreach (var t in Json.Items(component["triggers"]))
        {
            if (!string.Equals(Json.Str(t?["type"]), "OnLoad", StringComparison.OrdinalIgnoreCase)) continue;
            if (t?["timeoutMillis"] is JsonValue v && v.TryGetValue<int>(out var ms) && ms > 0) continue;
            var actionId = Json.Str(t?["actionId"]);
            if (actionId.Length == 0) continue;
            if (actionId == "search") frame.SeedSearch();
            Dispatch(frame, actionId, new JsonObject());
        }
    }

    private void FollowHome(Frame frame, JsonObject app, JsonObject seed)
    {
        if (Json.Str(app["variant"]) != "MEDIATOR" || _app.Count == 0) _app = (JsonObject)app.DeepClone();
        var route = Json.Str(app["homeRoute"]);
        var consumed = Json.Str(app["homeConsumedRoute"]);
        var sst = Json.Str(app["homeServerSideType"]);
        if (sst.Length == 0) sst = Json.Str(app["serverSideType"]);
        if (route.Length == 0 && sst.Length == 0) return;
        if (++frame.Hops > 8) throw new MateuTestException("The app shell keeps redirecting on " + Where);
        var next = new Frame { Hops = frame.Hops };
        Json.Merge(next.Seed, seed);
        Replace(frame, next);
        Load(next, route, consumed, sst);
    }

    /// <summary>One place a component is drawn: the page, or a dialog/drawer over it.</summary>
    internal sealed class Frame
    {
        public string Route = "", ConsumedRoute = "", ServerSideType = "", ComponentId = "";
        public string OrchestratorServerSideType = "", OrchestratorRoute = "", OverlayTitle = "";
        public Frame? Opener;
        public int Hops;
        public JsonObject Component = new();
        public JsonObject ServerSide = new();
        public readonly JsonObject State = new(), Data = new(), Seed = new();
        public readonly List<JsonObject> Actions = [];

        public void Adopt(JsonObject serverSide)
        {
            ServerSide = serverSide;
            if (Component.Count == 0 || Opener is null) Component = serverSide;
            var id = Json.Str(serverSide["id"]);
            if (id.Length > 0) ComponentId = id;
            var sst = Json.Str(serverSide["serverSideType"]);
            if (sst.Length > 0) ServerSideType = sst;
            var route = Json.Str(serverSide["route"]);
            if (route.Length > 0 && Opener is null && Route.Length == 0) Route = route;
            Actions.Clear();
            foreach (var a in Json.Items(serverSide["actions"]))
                if (a is JsonObject o) Actions.Add(o);
            if (serverSide["initialData"] is JsonObject initial)
            {
                Json.Merge(State, initial);
                if (initial["_componentRoute"] is not null && sst.Length > 0 && OrchestratorServerSideType.Length == 0)
                {
                    OrchestratorServerSideType = sst;
                    OrchestratorRoute = Json.Str(initial["_componentRoute"]);
                }
            }
        }

        public JsonObject? Action(string actionId) => Actions.FirstOrDefault(a => Json.Str(a["id"]) == actionId);

        private bool Owns(string actionId) => Actions.Any(a =>
        {
            var id = Json.Str(a["id"]);
            return id == actionId || (id.EndsWith('*') && actionId.StartsWith(id[..^1]));
        });

        /// <summary>Where an action goes: this component, or — unowned — its opener / orchestrator.</summary>
        public Frame TargetFor(string actionId)
        {
            var bubbles = !Owns(actionId) || Action(actionId)?["bubble"]?.GetValueKind() == JsonValueKind.True;
            if (bubbles && Opener is not null)
                return new Frame { Route = Opener.Route, ConsumedRoute = Opener.ConsumedRoute, ServerSideType = Opener.ServerSideType };
            if (bubbles && OrchestratorServerSideType.Length > 0 && OrchestratorServerSideType != ServerSideType
                && Route.StartsWith(OrchestratorRoute))
                return new Frame { Route = Route, ConsumedRoute = ConsumedRoute, ServerSideType = OrchestratorServerSideType };
            return this;
        }

        public void SeedSearch()
        {
            State["page"] ??= 0;
            State["size"] ??= 10;
            State["sort"] ??= new JsonArray();
            State["searchText"] ??= "";
        }
    }
}

/// <summary>A failed expectation of a test against a <see cref="MateuScreen"/> (no such field,
/// a disabled button pressed…). The message says what there is instead.</summary>
public sealed class MateuTestException(string message) : Exception(message);

/// <summary>Small helpers over the wire JSON.</summary>
internal static class Json
{
    public static string Str(JsonNode? node) => node switch
    {
        null => "",
        JsonValue v when v.GetValueKind() == JsonValueKind.String => v.GetValue<string>(),
        JsonValue v => v.ToJsonString(),
        _ => node.ToJsonString(),
    };

    public static IEnumerable<JsonNode?> Items(JsonNode? node) => node is JsonArray a ? a : [];

    public static IEnumerable<JsonObject> Collect(JsonNode? root, Func<JsonObject, bool> accept)
    {
        var out_ = new List<JsonObject>();
        void Walk(JsonNode? n)
        {
            switch (n)
            {
                case JsonObject o:
                    if (accept(o)) out_.Add(o);
                    foreach (var (_, v) in o) Walk(v);
                    break;
                case JsonArray a:
                    foreach (var v in a) Walk(v);
                    break;
            }
        }
        Walk(root);
        return out_;
    }

    public static void Merge(JsonObject into, JsonObject from)
    {
        foreach (var (k, v) in from) into[k] = v?.DeepClone();
    }

    public static JsonObject Object(IDictionary<string, object?>? values)
    {
        var o = new JsonObject();
        if (values is null) return o;
        foreach (var (k, v) in values) o[k] = ToNode(v);
        return o;
    }

    public static JsonNode? ToNode(object? value) => value switch
    {
        null => null,
        JsonNode n => n.DeepClone(),
        Enum e => e.ToString(),
        _ => JsonSerializer.SerializeToNode(value, MateuExtensions.Json),
    };

    public static bool ContainsText(JsonNode? node, string text) => node switch
    {
        JsonObject o => o.Any(kv => kv.Key is not ("id" or "type" or "serverSideType") && !kv.Key.EndsWith("Id")
                                    && ContainsText(kv.Value, text)),
        JsonArray a => a.Any(v => ContainsText(v, text)),
        JsonValue v when v.GetValueKind() == JsonValueKind.String => v.GetValue<string>().Contains(text),
        JsonValue v => v.GetValueKind() is not (JsonValueKind.True or JsonValueKind.False) && v.ToJsonString() == text,
        _ => false,
    };
}
