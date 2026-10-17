using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// The public helpers of Mateu.Uidl an app calls directly — the REST source descriptors and their
/// catalogue, the business-component catalogue, the Crud&lt;T&gt; capability defaults, the typed
/// filter ranges and ListingData — pinned against the Java records they mirror.
/// </summary>
public class UidlContractTests
{
    // ── REST sources ────────────────────────────────────────────────────────────────────────────

    [Fact]
    public void A_source_kind_round_trips_through_its_wire_name()
    {
        foreach (var kind in Enum.GetValues<RestSourceKind>())
            Assert.Equal(kind, RestSourceKinds.FromWire(kind.WireName()));
        Assert.Equal(["options", "rows", "action", "data"],
            Enum.GetValues<RestSourceKind>().Select(k => k.WireName()).ToArray());
        Assert.Null(RestSourceKinds.FromWire("table"));
        Assert.Null(RestSourceKinds.FromWire(null));
    }

    [Fact]
    public void A_reference_takes_the_endpoint_from_its_entry_and_keeps_what_it_declares()
    {
        var entry = new RestSourceEntry("countries", new RestDataSource
        {
            Url = "https://api.example.com/countries",
            Method = "POST",
            Headers = new Dictionary<string, string> { ["X-Api-Key"] = "${secret.KEY}" },
            Body = "{}",
            ItemsPath = "data",
            ValuePath = "code",
            LabelPath = "name",
            Proxy = true,
            Sample = new[] { "es" },
        });
        var byRef = RestDataSource.OfRef("  countries ") with { LabelPath = "officialName" };
        Assert.True(byRef.HasRef());
        Assert.Equal("countries", byRef.Ref);

        var resolved = byRef.ResolvedAgainst(entry);
        Assert.Equal("https://api.example.com/countries", resolved.Url);
        Assert.Equal("POST", resolved.Method);
        Assert.Equal("${secret.KEY}", resolved.Headers!["X-Api-Key"]);
        Assert.Equal("{}", resolved.Body);
        Assert.Equal("data", resolved.ItemsPath);
        Assert.Equal("code", resolved.ValuePath);
        Assert.Equal("officialName", resolved.LabelPath); // the surface's own path wins
        Assert.True(resolved.Proxy); // proxy is on when either side says so
        Assert.True(resolved.CarriesSample());
    }

    [Fact]
    public void A_descriptor_that_declares_everything_keeps_it_and_an_unknown_entry_changes_nothing()
    {
        var own = new RestDataSource
        {
            Url = "/mine", Method = "GET", Headers = new Dictionary<string, string> { ["A"] = "1" },
            Body = "b", ItemsPath = "i", ValuePath = "v", LabelPath = "l", Sample = 1,
        };
        var entry = new RestSourceEntry("x", new RestDataSource { Url = "/theirs", Method = "PUT", Sample = 2 });
        var resolved = own.ResolvedAgainst(entry);
        Assert.Equal(own, resolved);
        Assert.Same(own, own.ResolvedAgainst(null));
        Assert.False(new RestDataSource().HasRef());
        Assert.False(new RestDataSource().CarriesSample());
    }

    [Fact]
    public void An_entry_answers_its_own_sample_else_its_sources()
    {
        Assert.Equal(1, new RestSourceEntry("a", new RestDataSource { Sample = 2 }) { Sample = 1 }.EffectiveSample());
        Assert.Equal(2, new RestSourceEntry("a", new RestDataSource { Sample = 2 }).EffectiveSample());
        Assert.Null(new RestSourceEntry("a", new RestDataSource()).EffectiveSample());
    }

    [Theory]
    [InlineData("/api/countries", RestSourceProvenance.Generate)]
    [InlineData("api/countries", RestSourceProvenance.Generate)]
    [InlineData("https://api.example.com/countries", RestSourceProvenance.Existing)]
    [InlineData("  //cdn.example.com/x ", RestSourceProvenance.Existing)]
    [InlineData(null, RestSourceProvenance.Generate)]
    public void Auto_provenance_reads_the_url(string? url, RestSourceProvenance expected)
    {
        Assert.Equal(expected, new RestSourceEntry("s", new RestDataSource { Url = url }).EffectiveProvenance());
    }

    [Fact]
    public void A_declared_provenance_wins_and_the_catalogue_splits_what_we_owe_from_what_we_consume()
    {
        var catalogue = new RestSourceCatalog([
            new RestSourceEntry("ours", new RestDataSource { Url = "/api/ours" }),
            new RestSourceEntry("theirs", new RestDataSource { Url = "https://them.example.com" }),
            new RestSourceEntry("declared", new RestDataSource { Url = "https://them.example.com" })
                { Provenance = RestSourceProvenance.Generate },
        ]);
        Assert.Equal(["ours", "declared"], catalogue.ToImplement().Select(e => e.Name).ToArray());
        Assert.Equal(["theirs"], catalogue.Consumed().Select(e => e.Name).ToArray());
    }

    [Fact]
    public void An_authored_catalogue_replaces_derived_entries_by_name_and_keeps_their_order()
    {
        var derived = new RestSourceCatalog([
            new RestSourceEntry("a", new RestDataSource { Url = "/derived-a" }),
            new RestSourceEntry("b", new RestDataSource { Url = "/derived-b" }),
        ]);
        var authored = new RestSourceCatalog([
            new RestSourceEntry("b", new RestDataSource { Url = "/authored-b" }),
            new RestSourceEntry("c", new RestDataSource { Url = "/authored-c" }),
        ]);
        var merged = authored.MergedOver(derived);
        Assert.Equal(["a", "b", "c"], merged.Sources.Select(e => e.Name).ToArray());
        Assert.Equal("/authored-b", merged.Get(" b ")!.Source.Url);
        Assert.Null(merged.Get(""));
        Assert.Null(merged.Get("zzz"));
        Assert.Equal(authored.Sources, authored.MergedOver(null).Sources);
        Assert.True(RestSourceCatalog.Empty.HasNoSources());
        Assert.False(merged.HasNoSources());
    }

    [Fact]
    public void A_field_map_names_the_path_of_a_flat_field()
    {
        var entry = new RestSourceEntry("people", new RestDataSource())
        {
            Fields = new Dictionary<string, string> { ["city"] = "address.city", ["blank"] = " " },
        };
        Assert.Equal("address.city", entry.PathOf("city"));
        Assert.Equal("name", entry.PathOf("name"));
        Assert.Equal("blank", entry.PathOf("blank"));
    }

    [Fact]
    public void An_authored_component_catalogue_replaces_derived_entries_by_name()
    {
        var derived = new ComponentCatalog([new ComponentEntry("header", new Text("old")), new ComponentEntry("footer", null)]);
        var authored = new ComponentCatalog([new ComponentEntry("header", new Text("new"))]);
        var merged = authored.MergedOver(derived);
        Assert.Equal(["header", "footer"], merged.Components.Select(e => e.Name).ToArray());
        Assert.Equal("new", ((Text)merged.Get("header ")!.Component!).Content);
        Assert.Null(merged.Get(null));
        Assert.True(ComponentCatalog.Empty.HasNoComponents());
        Assert.False(authored.MergedOver(null).HasNoComponents());
    }

    // ── Crud<T>: the capability defaults ────────────────────────────────────────────────────────

    public class Item
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
    }

    public class NoIdItem
    {
        public string Name { get; set; } = "";
    }

    public class Items : Crud<Item>
    {
        public readonly List<Item> Store = [new() { Id = "1", Name = "One" }, new() { Id = "2", Name = "Two" }];
        public readonly List<string> Deleted = [];
        public readonly List<Item> Saved = [];
        public PageResult<Item>? Pushdown;

        public override IEnumerable<Item> Fetch(string? search) =>
            Store.Where(i => string.IsNullOrEmpty(search) || i.Name.Contains(search));

        public override PageResult<Item>? Find(string? searchText, IReadOnlyDictionary<string, object?> filters, Pageable pageable) => Pushdown;
        public override void Save(Item entity) => Saved.Add(entity);
        public override void Delete(string id) => Deleted.Add(id);
    }

    public class NoIdItems : Crud<NoIdItem>
    {
        public override IEnumerable<NoIdItem> Fetch(string? search) => [new() { Name = "x" }];
        public override void Save(NoIdItem entity) { }
    }

    [Fact]
    public void A_crud_views_and_edits_the_stored_entity_else_a_fresh_one()
    {
        var crud = new Items();
        Assert.Equal("Two", crud.View("2").Name);
        Assert.Equal("One", crud.Edit("1").Name);
        Assert.Equal("", crud.View("404").Id);
        Assert.Equal("", crud.Edit("404").Id);
        Assert.Equal("", crud.CreationForm().Id);
    }

    [Fact]
    public void Saving_or_creating_through_the_capabilities_persists_and_answers_the_id()
    {
        var crud = new Items();
        var edited = new Item { Id = "1", Name = "Uno" };
        Assert.Equal("1", ((IEditable<Item, string>)crud).Save(edited));
        Assert.Equal("3", ((ICreatable<Item, string>)crud).Create(new Item { Id = "3" }));
        Assert.Equal(["1", "3"], crud.Saved.Select(i => i.Id).ToArray());
        // an entity with no Id property and no [Id] cannot be identified: refused, never a null id
        var noId = Assert.Throws<InvalidOperationException>(
            () => ((ICreatable<NoIdItem, string>)new NoIdItems()).Create(new NoIdItem()));
        Assert.Contains("[Id]", noId.Message);
        Assert.Throws<InvalidOperationException>(() => Crud<NoIdItem>.IdOf(new NoIdItem()));
    }

    [Fact]
    public void Deleting_a_selection_deletes_every_id()
    {
        var crud = new Items();
        crud.DeleteAllById(["1", "2"]);
        Assert.Equal(["1", "2"], crud.Deleted.ToArray());
    }

    [Fact]
    public void A_crud_search_is_the_pushdown_page_when_find_answers_one_else_the_whole_fetch()
    {
        var crud = new Items();
        var unpaged = crud.Search(new SearchRequest("Tw"));
        Assert.False(unpaged.Paged);
        Assert.Equal(["2"], unpaged.Content.Select(i => i.Id).ToArray());

        crud.Pushdown = new PageResult<Item>([new Item { Id = "9" }], 42);
        var paged = crud.Search(new SearchRequest("Tw"));
        Assert.True(paged.Paged);
        Assert.Equal(42, paged.TotalElements);
        Assert.Equal(["9"], paged.Content.Select(i => i.Id).ToArray());
    }

    [Fact]
    public void Save_and_next_walks_the_listing_order()
    {
        var crud = new Items();
        Assert.Equal("2", crud.NextIdAfter("1"));
        Assert.Null(crud.NextIdAfter("2"));
        Assert.Null(crud.NextIdAfter("404"));
    }

    // ── Typed filter ranges and listing data ────────────────────────────────────────────────────

    [Fact]
    public void A_date_range_is_open_ended_on_a_missing_bound()
    {
        var d = new DateOnly(2026, 10, 17);
        Assert.True(new DateRange().IsEmpty);
        Assert.False(new DateRange(d).IsEmpty);
        Assert.False(new DateRange(null, d).IsEmpty);
        Assert.True(new DateRange().Contains(d));
        Assert.True(new DateRange(d, d).Contains(d));
        Assert.False(new DateRange(d.AddDays(1)).Contains(d));
        Assert.False(new DateRange(null, d.AddDays(-1)).Contains(d));
    }

    [Fact]
    public void A_number_range_is_open_ended_on_a_missing_bound()
    {
        Assert.True(new NumberRange().IsEmpty);
        Assert.False(new NumberRange(1).IsEmpty);
        Assert.False(new NumberRange(null, 1).IsEmpty);
        Assert.True(new NumberRange(1, 10).Contains(10));
        Assert.False(new NumberRange(1).Contains(0));
        Assert.False(new NumberRange(null, 5).Contains(6));
    }

    public class Sale
    {
        [GroupBy] public string Region { get; set; } = "";
        public decimal Amount { get; set; }
    }

    [Fact]
    public void Listing_data_synthesizes_counted_groups_unless_it_brings_its_own()
    {
        var rows = ListingData.Of(new Sale { Region = "N" }, new Sale { Region = "S" }, new Sale { Region = "N" });
        var groups = rows.WithSynthesizedGroups(typeof(Sale)).Groups!;
        Assert.Equal([("N", 2L), ("S", 1L)], groups.Select(g => (g.Value, g.Count)).ToArray());

        var own = rows.WithGroups([new GroupSummary("All", 3)]);
        Assert.Equal("All", own.WithSynthesizedGroups(typeof(Sale)).Groups!.Single().Value);
        Assert.Null(ListingData.From(new List<Sale>()).WithSynthesizedGroups(typeof(Sale)).Groups);
        Assert.Null(ListingData.Of(new Item()).WithSynthesizedGroups(typeof(Item)).Groups);
    }

    [Fact]
    public void A_search_request_defaults_to_one_unbounded_page_and_types_its_filters()
    {
        var request = new SearchRequest(null, new Item { Name = "x" });
        Assert.Equal("", request.SearchText);
        Assert.Equal(int.MaxValue, request.Pageable.Size);
        Assert.Empty(request.Criteria);
        Assert.Equal("x", request.Filters<Item>()!.Name);
        Assert.Null(request.Filters<Sale>());
        var criterion = new FilterCriterion("amount", FilterOperator.Between, [1, 2]);
        Assert.Equal(FilterOperator.Between, new SearchRequest("", null, [criterion]).Criteria[0].Operator);
    }

    [Fact]
    public void A_full_renderer_provides_every_capability_token()
    {
        Assert.Equal(8, Capabilities.All.Count);
        Assert.Contains(Capabilities.Notifications, Capabilities.All);
        Assert.Contains(Capabilities.HeaderActions, Capabilities.All);
    }
}
