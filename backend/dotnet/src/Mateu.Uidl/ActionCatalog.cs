namespace Mateu.Uidl;

// ── Action catalogue (C# mirror of io.mateu.uidl.data.ActionCatalog + fluent Action/Step) ────────

// The flow steps are the existing FlowStep verbs (Navigate, Emit, CloseOverlay, RunAction,
// MarkClean, MarkDirty — Components.cs).

/// <summary>A client-side REST call an action makes instead of a server dispatch (mirrors
/// io.mateu.uidl.data.RestAction).</summary>
public sealed record CatalogRestAction(RestDataSource Source, string? SuccessMessage = null, string? ResultPath = null);

/// <summary>A named, CLIENT-RUNNABLE action of the catalogue: a flow (<see cref="Steps"/>) or a REST
/// call (<see cref="RestAction"/>). (Mirrors the fluent io.mateu.uidl.fluent.Action as the catalogue
/// uses it.)</summary>
public sealed record CatalogAction(string Id)
{
    /// <summary>What the action does, in words — documentation only, never on the wire.</summary>
    public string Description { get; init; } = "";
    public IReadOnlyList<FlowStep> Steps { get; init; } = [];
    public CatalogRestAction? RestAction { get; init; }

    /// <summary>Who may run it (authored <c>access:</c>; null = anybody). A caller who does not
    /// satisfy it never receives the entry, buttons naming it are disabled, and a call that reaches
    /// the server anyway answers 403 — the same as a page's own declared action. Never on the wire.</summary>
    public Access? Access { get; init; }

    /// <summary>True when the action runs in the browser: a non-empty flow or a REST call.</summary>
    public bool ClientRunnable() => Steps.Count > 0 || RestAction is not null;
}

/// <summary>The app's catalogue of named client-runnable actions, run by id from the shell menu or
/// any page. Authored (actions.yaml + any <c>type: Actions</c> file) merges OVER derived (suppliers),
/// keyed by id, an authored entry REPLACING the derived one outright. Ids are GLOBAL. An owner's own
/// action of the same id always wins. (Mirrors io.mateu.uidl.data.ActionCatalog.)</summary>
public sealed record ActionCatalog(IReadOnlyList<CatalogAction> Actions)
{
    public static readonly ActionCatalog Empty = new([]);

    public bool HasNoActions() => Actions.Count == 0;

    public CatalogAction? Get(string? id) =>
        string.IsNullOrWhiteSpace(id) ? null : Actions.FirstOrDefault(a => a.Id == id.Trim());

    public ActionCatalog MergedOver(ActionCatalog? derived)
    {
        var byId = new Dictionary<string, CatalogAction>();
        var order = new List<string>();
        foreach (var a in (derived?.Actions ?? []).Concat(Actions))
        {
            if (!byId.ContainsKey(a.Id)) order.Add(a.Id);
            byId[a.Id] = a;
        }
        return new ActionCatalog(order.Select(i => byId[i]).ToList());
    }
}

/// <summary>Implemented by a class (discovered in the scanned assemblies, parameterless constructor)
/// that contributes actions to the catalogue at runtime. Only client-runnable entries are kept; the
/// authored file wins over what a supplier contributes. (Mirrors Java's ActionCatalogSupplier.)</summary>
public interface IActionCatalogSupplier
{
    IReadOnlyList<CatalogAction> ActionCatalog();
}
