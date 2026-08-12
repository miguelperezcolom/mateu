using Mateu.Core;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// Partials — the .NET mirror of Java's PartialExpansionTest.
///
/// <para>A partial is a page-shaped thing with no page: one component, or a list of them, usable
/// anywhere a component is. The property that decides whether that sentence is true is that a
/// partial standing for several components <b>splices</b> into its parent rather than wrapping —
/// otherwise "anywhere a component is" quietly excludes forms and grids, the places reuse matters
/// most.</para>
///
/// <para>As in Java, partials are resolved while the tree is built and never reach the wire, so no
/// renderer has to learn the concept.</para>
/// </summary>
public class PartialTests
{
    private static readonly string SpecsDir = Path.Combine(AppContext.BaseDirectory, "specs", "ui");

    private static PartialRegistry Partials() => new(SpecsDir);

    private static IReadOnlyList<IComponent> ContentOf(IComponent? component) =>
        ((VerticalLayout)component!).Content;

    private static string Describe(IComponent component) => component switch
    {
        FormField field => field.FieldId,
        Text text => text.Content,
        _ => component.GetType().Name,
    };

    [Fact]
    public void A_multi_component_partial_splices_into_its_parent_instead_of_nesting()
    {
        // THE test. In a form, a wrapper would put two fields in one grid cell.
        var loader = new YamlSpecLoader(SpecsDir);

        var layout = loader.LoadSpec("partial-page")!.Layout;

        Assert.Equal(
            new[] { "name", "street", "city", "Prices include VAT." },
            ContentOf(layout).Select(Describe));
    }

    [Fact]
    public void A_partial_file_that_is_just_a_component_needs_no_envelope()
    {
        var tree = YamlComponentBuilder.Parse(
            "type: VerticalLayout\ncontent:\n  - type: Partial\n    ref: legal-notice\n", Partials());

        Assert.Equal("Prices include VAT.", Describe(Assert.Single(ContentOf(tree))));
    }

    [Fact]
    public void A_missing_ref_costs_the_partial_and_not_the_page()
    {
        // A typo in one ref must not take down every page that mentions it.
        var tree = YamlComponentBuilder.Parse(
            "type: VerticalLayout\ncontent:\n  - type: Text\n    text: still here\n"
            + "  - type: Partial\n    ref: no-such-thing\n", Partials());

        Assert.Equal("still here", Describe(Assert.Single(ContentOf(tree))));
    }

    [Fact]
    public void A_partial_cycle_is_dropped_rather_than_overflowing_the_stack()
    {
        var tree = YamlComponentBuilder.Parse(
            "type: VerticalLayout\ncontent:\n  - type: Partial\n    ref: loop-a\n", Partials());

        Assert.Empty(ContentOf(tree));
    }

    [Fact]
    public void A_partial_can_be_registered_in_code_and_wins_over_a_file_of_the_same_name()
    {
        var partials = Partials();
        partials.Register("legal-notice",
            [new Dictionary<object, object> { ["type"] = "Text", ["text"] = "Registered in code." }]);

        var tree = YamlComponentBuilder.Parse(
            "type: VerticalLayout\ncontent:\n  - type: Partial\n    ref: legal-notice\n", partials);

        Assert.Equal("Registered in code.", Describe(Assert.Single(ContentOf(tree))));
    }
}
