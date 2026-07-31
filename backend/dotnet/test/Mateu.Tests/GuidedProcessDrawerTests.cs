using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Views under test ──────────────────────────────────────────────────────────

/// <summary>A multi-step wizard served inside a drawer (Java: GuidedProcessDrawerSyncTest's
/// SignupWizard).</summary>
[UI("gpd-wizard"), Title("Sign up")]
public class SignupWizard : Wizard
{
    [Step(1)] public string? Name { get; set; } = "Ada";
    [Step(2)] public int Age { get; set; } = 30;

    public override Message Complete() => new("done");
}

/// <summary>A host page whose action opens the wizard in a drawer via EmbeddedView (Java:
/// GuidedProcessDrawerSyncTest's Host).</summary>
[UI("gpd-host"), Title("Host")]
public class GpdHost
{
    // [Action]-equivalent: RunAction dispatches any public method by camelCased name.
    public Drawer OpenWizard() => new()
    {
        Id = "gpd",
        HeaderTitle = "Sign up",
        Size = DrawerSize.M,
        Content = new EmbeddedView(new SignupWizard()),
    };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

/// <summary>Guided Process Drawer (Redwood template): a multi-step <see cref="Wizard"/> served
/// inside a <see cref="Drawer"/> via <see cref="EmbeddedView"/>, which embeds the wizard as an
/// INDEPENDENT server-side component so its step navigation routes back to itself (and doesn't
/// bubble to the host). Mirrors Java's GuidedProcessDrawerSyncTest.</summary>
public class GuidedProcessDrawerTests
{
    private static SyncHandler Handler() => new(new MateuRegistry(typeof(GpdHost).Assembly));

    private static IEnumerable<ClientSideComponentDto> Walk(ComponentDto node)
    {
        if (node is ServerSideComponentDto server)
        {
            foreach (var child in server.Children ?? [])
                foreach (var found in Walk(child)) yield return found;
            yield break;
        }
        if (node is not ClientSideComponentDto client) yield break;
        yield return client;
        // A Card nests its content in the metadata (CardMetadataDto.Content), not in Children —
        // the wizard's step form lives inside a Card, so descend into it too.
        if (client.Metadata is CardMetadataDto { Content: { } cardContent })
            foreach (var found in Walk(cardContent)) yield return found;
        foreach (var child in client.Children ?? [])
            foreach (var found in Walk(child)) yield return found;
    }

    [Fact]
    public void The_wizard_is_embedded_as_an_independent_server_side_component_inside_the_drawer()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "/gpd-host", ActionId = "openWizard",
            ServerSideType = typeof(GpdHost).FullName, InitiatorComponentId = "cmp-1",
        });

        // the drawer arrives as an Add fragment carrying a DrawerMetadataDto
        var fragment = Assert.Single(inc.Fragments);
        Assert.Equal("Add", fragment.Action);
        var drawer = Assert.IsType<DrawerMetadataDto>(
            Assert.IsType<ClientSideComponentDto>(fragment.Component).Metadata);

        // the drawer's content is the wizard embedded as an INDEPENDENT ServerSideComponent, routed
        // to its own type (so its step actions dispatch back to the wizard, not the host)
        var embedded = Assert.IsType<ServerSideComponentDto>(drawer.Content);
        Assert.Equal(typeof(SignupWizard).FullName, embedded.ServerSideType);

        // and it carries its first step's field + the "next" button
        var fieldIds = Walk(embedded)
            .Where(c => c.Metadata is FormFieldMetadataDto)
            .Select(c => ((FormFieldMetadataDto)c.Metadata).FieldId)
            .ToList();
        Assert.Contains("name", fieldIds);

        var actionIds = Walk(embedded)
            .Where(c => c.Metadata is ButtonMetadataDto)
            .Select(c => ((ButtonMetadataDto)c.Metadata).ActionId)
            .ToList();
        Assert.Contains("next", actionIds);
    }

    [Fact]
    public void Next_advances_the_embedded_wizard_to_its_second_step()
    {
        // dispatch "next" against the wizard's own serverSideType (as the embedded component would),
        // carrying the first step's state — it advances to the age step.
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "/gpd-wizard", ActionId = "next",
            ServerSideType = typeof(SignupWizard).FullName, InitiatorComponentId = "cmp-1",
            ComponentState = new Dictionary<string, object?>
            {
                ["__step"] = JsonSerializer.SerializeToElement(1),
                ["name"] = JsonSerializer.SerializeToElement("Ada"),
            },
        });

        var server = inc.Fragments
            .Select(f => f.Component)
            .OfType<ServerSideComponentDto>()
            .First();
        var fieldIds = Walk(server)
            .Where(c => c.Metadata is FormFieldMetadataDto)
            .Select(c => ((FormFieldMetadataDto)c.Metadata).FieldId)
            .ToList();
        Assert.Contains("age", fieldIds);
    }
}
