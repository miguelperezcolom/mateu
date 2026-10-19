using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>The generic fluent building blocks ported from Java (M-A5): Element, Tooltip,
/// ConfirmDialog, Details, SplitLayout, Breadcrumbs, Icon and Notification. The full wire shape is
/// pinned by the generic-components conformance case; these tests pin the defaults and the ids
/// Java's mappers give them.</summary>
public class GenericComponentsTests
{
    [Fact]
    public void A_confirm_dialog_defaults_its_confirm_text_and_opened_condition()
    {
        var dto = ComponentMapper.Map(new ConfirmDialog { Header = "Sure?" });
        var meta = Assert.IsType<ConfirmDialogMetadataDto>(dto.Metadata);
        Assert.Equal("Save", meta.ConfirmText);
        Assert.Equal("true", meta.OpenedCondition);
        Assert.Empty(dto.Children); // a header-only dialog has no content child
        Assert.Equal("fieldId", dto.Id);
    }

    /// <summary>An image carries its text alternative to the wire (Java's ImageDto.alt).</summary>
    [Fact]
    public void An_image_carries_its_alt_text()
    {
        var meta = Assert.IsType<ImageMetadataDto>(ComponentMapper.Map(new Image { Src = "/logo.png", Alt = "Company logo" }).Metadata);
        Assert.Equal("Company logo", meta.Alt);
        Assert.Null(Assert.IsType<ImageMetadataDto>(ComponentMapper.Map(new Image { Src = "/logo.png" }).Metadata).Alt);
    }

    [Fact]
    public void An_element_is_keyed_by_its_own_id_attribute_else_a_stable_hash()
    {
        Assert.Equal("plan", ComponentMapper.Map(new Element("x-el")
        {
            Attributes = new Dictionary<string, string> { ["id"] = "plan" },
        }).Id);
        var first = ComponentMapper.Map(new Element("x-el") { Content = "a" }).Id;
        Assert.Equal(first, ComponentMapper.Map(new Element("x-el") { Content = "a" }).Id);
        Assert.NotEqual(first, ComponentMapper.Map(new Element("x-el") { Content = "b" }).Id);
        // FNV-1a of the definition: the very id the Python port computes for the same element
        Assert.Equal("element-95a0641d", ComponentMapper.Map(new Element("x-el")).Id);
    }

    [Fact]
    public void The_ids_java_hardcodes_default_to_field_id_unless_the_component_names_one()
    {
        IComponent[] components =
        [
            new Icon("vaadin:plus"), new Notification("Saved"), new Breadcrumbs("Here"),
            new Tooltip("t") { Wrapped = new Text("w") }, new Details { Summary = new Text("s") },
        ];
        foreach (var c in components) Assert.Equal("fieldId", ComponentMapper.Map(c).Id);
        Assert.Equal("mine", ComponentMapper.Map(new Icon("vaadin:plus") { Id = "mine" }).Id);
    }

    [Fact]
    public void A_split_layout_without_orientation_sends_null_and_its_two_panes_as_children()
    {
        var dto = ComponentMapper.Map(new SplitLayout(new Text("m"), new Text("d")));
        Assert.Null(Assert.IsType<SplitLayoutMetadataDto>(dto.Metadata).Orientation);
        Assert.Equal(["m", "d"], dto.Children.Select(c =>
            ((TextMetadataDto)((ClientSideComponentDto)c).Metadata).Text));
    }
}
