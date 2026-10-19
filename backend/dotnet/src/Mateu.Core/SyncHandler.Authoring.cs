using System.Text.Json.Nodes;
using Mateu.Core.Authoring;
using Mateu.Dtos;

namespace Mateu.Core;

/// <summary>The authoring reserved action <c>__validate__</c> (mirrors Java's
/// RunActionUseCase.handleValidate + UidlValidationService): validates arbitrary YAML definition TEXT
/// (<c>parameters._yaml</c>) against the generated schema and THIS app's catalogues, answering the
/// report on <c>appData._validation</c> — what the MCP tool <c>mateu_validate_uidl</c> (native
/// endpoint and sidecar alike) is built on. It renders nothing and changes nothing, and runs through
/// the ordinary request path, so the caller's identity and the route's access rules apply.</summary>
internal sealed partial class SyncHandler
{
    /// <summary>The reserved action id.</summary>
    public const string ValidateAction = "__validate__";

    /// <summary>The <c>appData</c> key the report rides on.</summary>
    public const string ValidationKey = "_validation";

    /// <summary>The parameter carrying the YAML text (shared with <c>__preview__</c>).</summary>
    public const string YamlParameter = "_yaml";

    /// <summary>Kinds the YAML loader turns into a component tree (the ones a load failure can hit).</summary>
    private static readonly HashSet<string> LoadedKinds = ["component", "envelope"];

    private UIIncrementDto ValidateResponse(RunActionRqDto rq)
    {
        var yaml = rq.Parameters.TryGetValue(YamlParameter, out var raw) ? StateString(raw) ?? "" : "";
        return UIIncrementDto.Of() with
        {
            AppData = new Dictionary<string, object?> { [ValidationKey] = ValidateDefinition(yaml) },
        };
    }

    /// <summary>The validation report of <paramref name="yaml"/> over this app: the semantic checks
    /// resolve against its catalogues, and a definition the structural pass finds no error in is also
    /// handed to the real YAML loader — so "valid" never means "and then the page answers Not found".</summary>
    internal JsonObject ValidateDefinition(string yaml)
    {
        var report = UidlValidator.Default.Validate(yaml, AuthoringContext());
        if (report["valid"]?.GetValue<bool>() == true
            && report["kind"] is JsonValue kind && kind.TryGetValue<string>(out var k) && LoadedKinds.Contains(k))
        {
            var (_, problem) = YamlComponentBuilder.ParseReporting(yaml, _yaml.Partials, _fieldTypes);
            if (problem is not null)
            {
                ((JsonArray)report["errors"]!).Add(new JsonObject
                {
                    ["code"] = "load_failed",
                    ["message"] = "The definition could not be loaded: " + problem,
                    ["path"] = "$",
                });
                report["valid"] = false;
            }
        }
        return report;
    }

    /// <summary>What this app knows, for the validator's semantic checks.</summary>
    internal ValidationContext AuthoringContext() => new(
        name => Safe(() => _restSources.Catalog.Get(name) is not null),
        name => Safe(() => _yaml.Partials.Resolve(name).Count > 0),
        name => Safe(() => _components.Catalog.Get(name) is not null),
        name => Safe(() => _actionCatalog.Catalog.Get(name) is not null),
        name => Safe(() => _fieldTypes.Catalog.Get(name) is not null));

    // a catalogue that cannot be read is not the author's mistake: do not flag the reference
    private static bool Safe(Func<bool> check)
    {
        try
        {
            return check();
        }
        catch (Exception)
        {
            return true;
        }
    }
}
