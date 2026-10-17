using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class Currency
{
    [Id] public string Code { get; set; } = "";
    public string Name { get; set; } = "";
}

[UI("currencies"), Title("Currencies")]
public class Currencies : Crud<Currency>
{
    public static readonly List<Currency> Store = [];
    public static IReadOnlyDictionary<string, object?>? LastFilters;

    public override IEnumerable<Currency> Fetch(string? search) => Store;
    public override Currency? Get(string id) => Store.FirstOrDefault(c => c.Code == id);
    public override void Save(Currency c) { Store.RemoveAll(x => x.Code == c.Code); Store.Add(c); }
    public override void Delete(string id) => Store.RemoveAll(c => c.Code == id);

    public override PageResult<Currency>? Find(
        string? searchText, IReadOnlyDictionary<string, object?> filters, Pageable pageable)
    {
        LastFilters = filters;
        return null;
    }
}

public class Unidentified { public string Name { get; set; } = ""; }

[UI("unidentified"), Title("Unidentified")]
public class Unidentifieds : Crud<Unidentified>
{
    public override IEnumerable<Unidentified> Fetch(string? search) => [];
}

/// <summary>M-A1: the entity id was hard-wired to a property literally named Id (an entity keyed
/// by Code got null ids and broken edits with no error), and the capability-listing search handed
/// Find an EMPTY filters dictionary instead of the component state.</summary>
public class CrudIdentityTests
{
    private static UIIncrementDto Run(Type crud, string route, string actionId,
        Dictionary<string, object?>? parameters = null, Dictionary<string, object?>? state = null) =>
        new SyncHandler(new MateuRegistry(crud.Assembly)).Handle(new RunActionRqDto
        {
            Route = route,
            ConsumedRoute = route,
            ServerSideType = crud.FullName,
            ActionId = actionId,
            InitiatorComponentId = "c1",
            Parameters = parameters ?? new(),
            ComponentState = state ?? new(),
        });

    private static JsonElement J(object value) => JsonSerializer.SerializeToElement(value);

    [Fact]
    public void An_id_marked_property_identifies_the_record()
    {
        Assert.Equal("EUR", Crud<Currency>.IdOf(new Currency { Code = "EUR" }));
        Assert.Equal("code", EntityIds.FieldName(typeof(Currency)));
    }

    [Fact]
    public void The_row_link_opens_the_record_by_its_marked_id()
    {
        var inc = Run(typeof(Currencies), "/currencies", "view", parameters: new() { ["code"] = J("EUR") });
        Assert.Equal("/currencies/EUR", inc.Commands.Single(c => c.Type == "NavigateTo").Data);
    }

    [Fact]
    public void Saving_and_deleting_use_the_marked_id()
    {
        Currencies.Store.Clear();
        Currencies.Store.AddRange([new() { Code = "EUR", Name = "Euro" }, new() { Code = "USD", Name = "Dollar" }]);

        Run(typeof(Currencies), "/currencies/EUR/edit", "save", state: new() { ["name"] = J("Euro (EU)") });
        Assert.Equal("Euro (EU)", Currencies.Store.Single(c => c.Code == "EUR").Name);

        Run(typeof(Currencies), "/currencies", "delete", state: new()
        {
            ["crud_selected_items"] = J(new[] { new { code = "USD", name = "Dollar" } }),
        });
        Assert.Equal(["EUR"], Currencies.Store.Select(c => c.Code));
    }

    [Fact]
    public void A_crud_without_an_id_is_refused_with_the_fix()
    {
        var error = Record.Exception(() => Run(typeof(Unidentifieds), "/unidentified", ""));
        var refused = Assert.IsType<InvalidOperationException>(
            error is System.Reflection.TargetInvocationException t ? t.InnerException : error);
        Assert.Contains("Unidentified has no id", refused.Message);
        Assert.Contains("[Id]", refused.Message);
    }

    [Fact]
    public void The_capability_search_hands_find_the_component_state()
    {
        var state = new Dictionary<string, object?> { ["name"] = J("Eu"), ["code_from"] = J("A") };
        new Currencies().Search(new SearchRequest("x") { FilterState = state });
        Assert.Same(state, Currencies.LastFilters);
    }
}
