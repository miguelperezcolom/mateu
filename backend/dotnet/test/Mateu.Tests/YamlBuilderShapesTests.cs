using Mateu.Core;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// YAML layouts as authors write them, built into the fluent tree the wire is mapped from: a form
/// header's toolbar and buttons (styled, disabled, or navigating through a RouteLink), a record
/// switcher with bare options, a listing whose rows come from a catalogue name and whose status
/// column carries tones, a horizontal layout's default spacing, and a display component built
/// generically from its properties.
/// </summary>
public class YamlBuilderShapesTests
{
    [Fact]
    public void A_form_header_carries_its_toolbar_buttons_and_record_switcher()
    {
        var form = Assert.IsType<Form>(YamlComponentBuilder.Parse("""
            layout:
              type: Form
              title: Booking
              toolbar:
                - label: Save
                  actionId: save
                  buttonStyle: primary
                - label: Open guest
                  actionable:
                    type: RouteLink
                    route: /guests/1
              buttons:
                - label: Delete
                  actionId: delete
                  disabled: true
              recordSwitcher:
                value: b1
                options: [b1, b2]
                type: context
              content:
                - type: Text
                  text: hi
            """));
        Assert.Equal("primary", form.Toolbar[0].ButtonStyle);
        Assert.Equal("save", form.Toolbar[0].ActionId);
        Assert.Equal("/guests/1", form.Toolbar[1].Route);
        Assert.True(form.Buttons.Single().Disabled);
        Assert.Equal(["b1", "b2"], form.RecordSwitcher!.Options.Select(o => o.Label).ToArray());
        Assert.Equal(SwitcherType.Context, form.RecordSwitcher.Type);
        Assert.IsType<Text>(form.Content.Single());
    }

    [Fact]
    public void A_listing_reads_its_rows_from_a_catalogue_name_and_tones_its_status_column()
    {
        var listing = Assert.IsType<ListingComponent>(YamlComponentBuilder.Parse("""
            type: Listing
            title: Orders
            rowsSource: orders
            columns:
              - id: status
                dataType: status
                tones: { open: success, late: danger }
              - id: ref
            """));
        Assert.Equal("orders", listing.RowsSource!.Ref);
        Assert.Equal("danger", listing.Columns[0].Tones!["late"]);
        Assert.Null(listing.Columns[1].Tones);
        Assert.Equal("ref", listing.Columns[1].Label);
    }

    [Fact]
    public void A_listing_without_a_usable_source_has_none()
    {
        var listing = Assert.IsType<ListingComponent>(YamlComponentBuilder.Parse("type: Listing\nrowsSource: [1, 2]\n"));
        Assert.Null(listing.RowsSource);
        Assert.Empty(listing.Columns);
    }

    [Fact]
    public void A_horizontal_layout_spaces_its_children_unless_told_not_to()
    {
        var spaced = Assert.IsType<HorizontalLayout>(YamlComponentBuilder.Parse(
            "type: HorizontalLayout\ncontent:\n  - type: Text\n    text: a\n"));
        Assert.True(spaced.Spacing);
        Assert.Single(spaced.Content);
        var tight = Assert.IsType<HorizontalLayout>(YamlComponentBuilder.Parse("type: HorizontalLayout\nspacing: false\ncontent: nope\n"));
        Assert.False(tight.Spacing);
        Assert.Empty(tight.Content);
    }

    [Fact]
    public void A_display_component_is_built_from_its_properties()
    {
        var metric = Assert.IsType<MetricCard>(YamlComponentBuilder.Parse("""
            type: MetricCard
            title: Revenue
            value: "1200"
            trend: up
            actionId: openRevenue
            """));
        Assert.Equal("Revenue", metric.Title);
        Assert.Equal(MetricTrend.Up, metric.Trend);
        Assert.Equal("openRevenue", metric.ActionId);
    }

    [Fact]
    public void A_text_without_text_is_blank_and_a_blank_document_is_nothing()
    {
        Assert.Equal("", Assert.IsType<Text>(YamlComponentBuilder.Parse("type: Text\n")).Content);
        Assert.Null(YamlComponentBuilder.Parse("  "));
    }
}
