using Mateu.Core;
using Mateu.Uidl;
using Xunit;
using Xunit.Abstractions;

namespace Mateu.Tests;

/// <summary>A YAML page that fills a design-system page template (<c>template:</c> on a
/// <c>type: Form</c>) renders on the .NET server EXACTLY as on the Java reference: the Java YAML
/// fixtures (backend/shared/core/src/test/resources/specs/ui) through the .NET sync handler, held to
/// the Java goldens of PageTemplateSyncTest (the same goldens the browser expander is pinned on) —
/// the window title command and the whole first fragment component, normalised like the corpus.</summary>
public class YamlPageTemplatesTests(ITestOutputHelper output)
{
    public static TheoryData<string> Pages => new()
    {
        "item-overview-page", "item-overview-photo", "welcome-page", "dashboard-page",
        "general-overview-page", "collection-detail-page", "collection-detail-empty", "foldout-page",
        "multimedia-page", "create-edit-page", "guided-process-page", "data-management-page",
        "hero-search-page",
    };

    /// <summary>The ONLY wire paths allowed to differ, each with its reason. None is a template gap;
    /// a listed path that starts to match fails, so the list can only shrink.</summary>
    private static readonly Dictionary<string, (string Reason, string[] Paths)> Allowed = new()
    {
        ["multimedia-page"] = (
            "the page's content is a `type: Card` with a COMPONENT title (`title: {type: Text, container: h3}`) "
            + "and no variants: the .NET fluent Card has a string title and always-outlined variants — a Card gap, "
            + "not a template one (the banner and every template part match)",
            ["$.component.children[1].metadata.title", "$.component.children[1].metadata.variants"]),
    };

    [Theory, MemberData(nameof(Pages))]
    public void The_templated_page_matches_the_java_golden(string page)
    {
        var diffs = YamlGoldenHarness.Diffs(YamlGoldenHarness.Expected(page), YamlGoldenHarness.Actual(page));
        foreach (var d in diffs.Take(60)) output.WriteLine(d);
        if (Allowed.TryGetValue(page, out var allowed))
        {
            foreach (var path in allowed.Paths)
                Assert.True(diffs.Any(d => d.StartsWith(path, StringComparison.Ordinal)),
                    $"'{page}' now matches at {path} — remove it from the allow-list ({allowed.Reason})");
            diffs = diffs.Where(d => !allowed.Paths.Any(p => d.StartsWith(p, StringComparison.Ordinal))).ToList();
        }
        Assert.True(diffs.Count == 0, $"'{page}' diverges from {page}.golden.json:\n  " + string.Join("\n  ", diffs.Take(40)));
    }

    [Fact]
    public void A_seeded_templated_page_is_the_templates_kind_of_page()
    {
        // page-type-template/:id seeds the route's id, so the page is wrapped; with no `pageType:` the
        // template says which kind it is (Java's SeededYamlPage.declaredPageType → PageTypeResolver.ofTemplate)
        var handler = new SyncHandler(new MateuRegistry(typeof(YamlPageTemplatesTests).Assembly),
            specsDir: YamlGoldenHarness.JavaSpecs);
        var increment = handler.Handle(new Mateu.Dtos.RunActionRqDto { Route = "page-type-template/4", ConsumedRoute = "page-type-template/4" });
        var page = Assert.IsType<Mateu.Dtos.ServerSideComponentDto>(increment.Fragments![0].Component);
        Assert.Equal("collection", page.PageType);
    }

    [Fact]
    public void Every_template_has_its_page_type()
    {
        var expected = new Dictionary<Type, string>
        {
            [typeof(CollectionDetailPage)] = "collection", [typeof(DataManagementPage)] = "collection",
            [typeof(DashboardLandingPage)] = "dashboard", [typeof(Mateu.Uidl.WelcomePage)] = "landing",
            [typeof(HeroSearchPage)] = "landing", [typeof(ItemOverviewPage)] = "detail",
            [typeof(GeneralOverviewPage)] = "detail", [typeof(FoldoutPage)] = "detail",
            [typeof(MultimediaContentPage)] = "detail", [typeof(GuidedProcessPage)] = "process",
            [typeof(AdvancedCreateEditPage)] = "form",
        };
        var all = typeof(IFormTemplate).Assembly.GetTypes()
            .Where(t => !t.IsAbstract && typeof(IFormTemplate).IsAssignableFrom(t)).ToList();
        Assert.Equal(expected.Keys.Select(t => t.Name).Order(), all.Select(t => t.Name).Order());
        foreach (var (type, pageType) in expected)
            Assert.Equal(pageType, PageTemplateLayout.PageTypeOf((IFormTemplate)Activator.CreateInstance(type)!));
    }

    [Fact]
    public void An_unknown_template_leaves_a_free_page()
    {
        var page = YamlComponentBuilder.Parse("type: Form\ntitle: T\ntemplate: {type: Banana}\ncontent:\n  - {type: Text, text: Hi}\n")!;
        var form = Assert.IsType<Form>(page);
        Assert.Null(form.Template);
        var dto = (Mateu.Dtos.ClientSideComponentDto)ComponentMapper.Map(form);
        Assert.Null(((Mateu.Dtos.FormMetadataDto)dto.Metadata).Template);
        Assert.Single(dto.Children);
    }

    [Fact]
    public void A_template_slot_action_is_advertised()
    {
        // a button in a slot runs an action of the page like one in the content
        var form = new Form
        {
            Template = new ItemOverviewPage { Footer = [new Button("Archive", "archive")] },
        };
        Assert.Contains("archive", ComponentMapper.CollectActionIds(form));
    }

    [Fact]
    public void A_fluent_form_fills_a_template_too()
    {
        var form = new Form
        {
            Title = "Hello",
            Toolbar = [new Button("Go", "go")],
            Template = new Mateu.Uidl.WelcomePage { BackgroundColor = "ocean" },
        };
        var dto = (Mateu.Dtos.ClientSideComponentDto)ComponentMapper.Map(form);
        var meta = (Mateu.Dtos.FormMetadataDto)dto.Metadata;
        Assert.True(meta.NoHeader);
        Assert.Empty(meta.Toolbar);
        Assert.Equal("WelcomePage", meta.Template!.Type);
        var hero = (Mateu.Dtos.ClientSideComponentDto)dto.Children[0];
        Assert.Equal("welcome", hero.Id);
        Assert.Equal("ocean", ((Mateu.Dtos.HeroSectionMetadataDto)hero.Metadata).Tone);
    }
}
