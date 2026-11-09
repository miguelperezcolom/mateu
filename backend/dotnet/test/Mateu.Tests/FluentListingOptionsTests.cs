using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class DetailedOrderLine
{
    public string Product { get; set; } = "";

    [Details]
    public string Notes { get; set; } = "";
}

[UI("grid-detail-custom")]
public class CustomisedGridDetailView
{
    [DetailForm(Position = "modal", Columns = 3, Style = "gap: 1rem;", Theme = "dense",
        MinHeightWhenDetailVisible = "30rem")]
    public List<DetailedOrderLine> Lines { get; set; } = [new() { Product = "Tea", Notes = "Green" }];
}

[UI("grid-detail-plain")]
public class PlainGridDetailView
{
    public List<ReadOnlyOrderLine> Lines { get; set; } = [new() { Product = "Tea", Quantity = 2 }];
}

/// <summary>The fluent listing's options and a grid field's row-detail customisation, which only
/// Java set before 3.0 GA. The full wire is pinned by the fluent-crudl-options and grid-field-detail
/// conformance cases; these pin each option and the defaults.</summary>
public class FluentListingOptionsTests
{
    private static readonly JsonSerializerOptions Web = new(JsonSerializerDefaults.Web);

    private static CrudMetadataDto Crud(ListingComponent l) =>
        Assert.IsType<CrudMetadataDto>(Assert.IsType<ClientSideComponentDto>(ComponentMapper.Map(l)).Metadata);

    [Fact]
    public void Every_fluent_listing_option_reaches_the_wire()
    {
        var crud = Crud(new ListingComponent
        {
            ListingType = "card",
            Toolbar = [new Button("Export", "export")],
            Size = 3,
            InitialPage = 2,
            Header = [new Text("Head")],
            Footer = [new Text("Foot")],
            PreSearch = [new Text("Start")],
            DetailPath = "notes",
            UseButtonForDetail = true,
            LazyColumnRendering = true,
            VaadinGridCellBackground = "#fafafa",
            VaadinGridCellPadding = "4px",
            SearchOnEnter = false,
            AutoFocusOnSearchText = false,
            FiltersLayout = "auto",
            GroupBy = "status",
            GroupActions = [new Button("Close", "closeGroup")],
            RowStatusField = "status",
            DragType = "order",
            RowsSelectionEnabled = true,
        });
        Assert.Equal("card", crud.CrudlType);
        Assert.Equal("export", Assert.Single(crud.Toolbar).ActionId);
        Assert.Equal(3, crud.Size);
        Assert.Equal(2, crud.InitialPage);
        Assert.IsType<TextMetadataDto>(Assert.IsType<ClientSideComponentDto>(Assert.Single(crud.Header!)).Metadata);
        Assert.Single(crud.Footer!);
        Assert.Single(crud.PreSearch!);
        Assert.Equal("notes", crud.DetailPath);
        Assert.True(crud.UseButtonForDetail);
        Assert.True(crud.LazyColumnRendering);
        Assert.Equal("#fafafa", crud.VaadinGridCellBackground);
        Assert.Equal("4px", crud.VaadinGridCellPadding);
        Assert.False(crud.SearchOnEnter);
        Assert.False(crud.AutoFocusOnSearchText);
        Assert.Equal("status", crud.GroupBy);
        Assert.Equal("closeGroup", Assert.Single(crud.GroupActions).ActionId);
        Assert.Equal("status", crud.RowStatusField);
        Assert.Equal("order", crud.DragType);
        Assert.True(crud.RowsSelectionEnabled);
    }

    [Fact]
    public void A_bare_fluent_listing_keeps_javas_defaults_and_sends_none_of_the_options()
    {
        var crud = Crud(new ListingComponent());
        Assert.Equal("table", crud.CrudlType);
        Assert.True(crud.SearchOnEnter);
        Assert.True(crud.AutoFocusOnSearchText);
        Assert.Equal("auto", crud.FiltersLayout);
        Assert.Null(crud.Header);
        Assert.Null(crud.Footer);
        Assert.Null(crud.PreSearch);
        var json = JsonSerializer.Serialize<ComponentMetadataDto>(crud, Web);
        foreach (var member in new[] { "\"size\"", "\"initialPage\"", "\"header\"", "\"footer\"",
                     "\"useButtonForDetail\"", "\"lazyColumnRendering\"", "\"vaadinGridCell" })
            Assert.DoesNotContain(member, json);
    }

    [Fact]
    public void Yaml_listings_read_the_same_options()
    {
        var listing = Assert.IsType<ListingComponent>(YamlComponentBuilder.Parse("""
            type: Listing
            listingType: card
            size: 3
            initialPage: 2
            header:
              - type: Text
                text: Head
            footer:
              - type: Text
                text: Foot
            preSearch:
              - type: Text
                text: Start
            detailPath: notes
            useButtonForDetail: true
            lazyColumnRendering: true
            vaadinGridCellBackground: "#fafafa"
            vaadinGridCellPadding: 4px
            searchOnEnter: false
            groupBy: status
            rowStatusField: status
            dragType: order
            rowsSelectionEnabled: true
            """));
        Assert.Equal("card", listing.ListingType);
        Assert.Equal(3, listing.Size);
        Assert.Equal(2, listing.InitialPage);
        Assert.IsType<Text>(Assert.Single(listing.Header));
        Assert.Single(listing.Footer);
        Assert.Single(listing.PreSearch);
        Assert.Equal("notes", listing.DetailPath);
        Assert.True(listing.UseButtonForDetail);
        Assert.True(listing.LazyColumnRendering);
        Assert.Equal("#fafafa", listing.VaadinGridCellBackground);
        Assert.Equal("4px", listing.VaadinGridCellPadding);
        Assert.False(listing.SearchOnEnter);
        Assert.True(listing.AutoFocusOnSearchText);
        Assert.Equal("status", listing.GroupBy);
        Assert.Equal("status", listing.RowStatusField);
        Assert.Equal("order", listing.DragType);
        Assert.True(listing.RowsSelectionEnabled);
    }

    private static JsonElement GridField(string route)
    {
        var inc = new SyncHandler(new MateuRegistry(typeof(CustomisedGridDetailView).Assembly))
            .Handle(new RunActionRqDto { Route = route, ConsumedRoute = route });
        JsonElement? found = null;
        void Walk(JsonElement n)
        {
            if (n.ValueKind == JsonValueKind.Object)
            {
                if (n.TryGetProperty("stereotype", out var s) && s.ValueKind == JsonValueKind.String
                    && s.GetString() == "grid")
                    found = n;
                foreach (var p in n.EnumerateObject()) Walk(p.Value);
            }
            else if (n.ValueKind == JsonValueKind.Array)
                foreach (var e in n.EnumerateArray()) Walk(e);
        }
        Walk(JsonSerializer.SerializeToElement(inc, Web));
        return Assert.IsType<JsonElement>(found);
    }

    [Fact]
    public void A_row_details_property_and_a_detail_form_customise_the_grid_field()
    {
        var grid = GridField("grid-detail-custom");
        Assert.Equal("notes", grid.GetProperty("detailPath").GetString());
        Assert.True(grid.GetProperty("useButtonForDetail").GetBoolean());
        Assert.Equal("modal", grid.GetProperty("formPosition").GetString());
        Assert.Equal(3, grid.GetProperty("formColumns").GetInt32());
        Assert.Equal("gap: 1rem;", grid.GetProperty("formStyle").GetString());
        Assert.Equal("dense", grid.GetProperty("formTheme").GetString());
        Assert.Equal("30rem", grid.GetProperty("minHeightWhenDetailVisible").GetString());
    }

    [Fact]
    public void Without_them_the_grid_field_keeps_the_defaults()
    {
        var grid = GridField("grid-detail-plain");
        Assert.False(grid.TryGetProperty("detailPath", out _));
        Assert.False(grid.TryGetProperty("useButtonForDetail", out _));
        Assert.False(grid.TryGetProperty("formStyle", out _));
        Assert.False(grid.TryGetProperty("formTheme", out _));
        Assert.Equal("right", grid.GetProperty("formPosition").GetString());
        Assert.Equal("16rem", grid.GetProperty("minHeightWhenDetailVisible").GetString());
    }
}
