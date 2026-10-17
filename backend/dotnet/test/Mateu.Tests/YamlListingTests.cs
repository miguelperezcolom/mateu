using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>A YAML page authored as DATA with no view model behind it — the yaml starter's pages.
/// Until 2026-10-17 this server built eight YAML component types and rendered the starter's own
/// <c>products.yaml</c> (a <c>type: Listing</c> over a REST source) as "Unsupported component", and
/// its <c>home.yaml</c> button (an <c>actionable: RouteLink</c>) with nowhere to go. Same wire shape
/// as Java's definition-only listing (the <c>ft-orders</c> expander golden).</summary>
public class YamlListingTests
{
    // starters/yaml/src/main/resources/specs/ui/products.yaml, as shipped
    private const string Products = """
        pageType: collection
        type: Listing
        title: Products
        pageSize: 10
        searchable: true
        filters:
          - type: FormField
            id: status
            label: Status
            stereotype: select
            options:
              - {value: AVAILABLE, label: Available}
              - {value: OUT_OF_STOCK, label: Out of stock}
              - {value: DISCONTINUED, label: Discontinued}
        rowsSource:
          ref: products
        columns:
          - {type: GridColumn, id: id, label: Id, identifier: true, sortable: true}
          - {type: GridColumn, id: name, label: Name, sortable: true}
          - {type: GridColumn, id: price, label: Price, sortable: true}
          - {type: GridColumn, id: status, label: Status, dataType: status, sortable: true}
        """;

    // starters/yaml/src/main/resources/specs/ui/home.yaml, as shipped
    private const string Home = """
        type: VerticalLayout
        fullWidth: true
        horizontalAlignment: STRETCH
        content:
          - type: HeroSection
            title: My app
            subtitle: Every screen here is declared as data.
            centered: true
            content:
              - type: Button
                label: Browse products
                buttonStyle: primary
                actionable:
                  type: RouteLink
                  route: products
        """;

    [Fact]
    public void A_yaml_listing_over_a_rest_source_is_a_client_side_crud()
    {
        var tree = YamlComponentBuilder.Parse(Products);
        var listing = Assert.IsType<ListingComponent>(tree);
        var crud = Assert.IsType<ClientSideComponentDto>(ComponentMapper.Map(listing));
        var meta = Assert.IsType<CrudMetadataDto>(crud.Metadata);

        Assert.Equal("Products", meta.Title);
        Assert.True(meta.Searchable);
        Assert.Equal(10, meta.PageSize);
        Assert.Equal("products", meta.RowsSource!.Ref); // the renderer fetches the rows itself
        Assert.Equal("fill", crud.Sizing);

        Assert.Equal(["id", "name", "price", "status"], meta.Columns.Select(c => c.Metadata.Id));
        Assert.All(meta.Columns, c => Assert.True(c.Metadata.Sortable));
        Assert.True(meta.Columns[0].Metadata.Identifier);
        Assert.Equal("status", meta.Columns[3].Metadata.DataType);
        Assert.True(meta.Columns[1].Metadata.AutoWidth);

        var filter = Assert.IsType<FormFieldMetadataDto>(Assert.Single(meta.Filters));
        Assert.Equal("status", filter.FieldId);
        Assert.Equal("select", filter.Stereotype);
        Assert.Equal(["AVAILABLE", "OUT_OF_STOCK", "DISCONTINUED"], filter.Options!.Select(o => o.Value));
    }

    [Fact]
    public void A_button_whose_actionable_is_a_route_link_navigates()
    {
        var tree = YamlComponentBuilder.Parse(Home);
        var hero = Assert.IsType<HeroSection>(Assert.Single(Assert.IsType<VerticalLayout>(tree).Content));
        var button = Assert.IsType<Button>(Assert.Single(hero.Content));
        Assert.Equal("products", button.Route);
        Assert.Equal("", button.ActionId);

        var dto = Assert.IsType<ButtonMetadataDto>(ComponentMapper.Map(button).Metadata);
        Assert.Equal("products", dto.Route);
        Assert.Equal("primary", dto.ButtonStyle);
    }

    [Fact]
    public void An_inline_rows_source_and_an_unknown_type_keep_their_old_behaviour()
    {
        var inline = Assert.IsType<ListingComponent>(YamlComponentBuilder.Parse("""
            type: Listing
            rowsSource: {url: https://api.example.com/items, itemsPath: results, proxy: true}
            columns:
              - {type: GridColumn, id: name}
            """));
        Assert.Equal("", inline.RowsSource!.Ref);
        Assert.Equal("https://api.example.com/items", inline.RowsSource.Url);
        Assert.Equal("results", inline.RowsSource.ItemsPath);
        Assert.True(inline.RowsSource.Proxy);
        Assert.Equal("name", inline.Columns[0].Label); // a label defaults to the id

        var unknown = Assert.IsType<Text>(YamlComponentBuilder.Parse("type: Nonsense"));
        Assert.Equal("Unsupported component: Nonsense", unknown.Content);
    }
}
