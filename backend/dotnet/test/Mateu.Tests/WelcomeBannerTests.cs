using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures (mirror the Java WelcomeBannerSyncTest fixtures) ─────────────────

/// <summary>A form with a fully specified [WelcomeBanner].</summary>
[UI("welcome-banner/full"), Title("Bookings"),
 WelcomeBanner(Title = "Find your flow", Subtitle = "Stays that match your rhythm")]
public class WelcomeBannerForm
{
    public string? Destination { get; set; }
}

/// <summary>[WelcomeBanner] without a title falls back to the view's [Title].</summary>
[UI("welcome-banner/titleless"), Title("Guestbook"), WelcomeBanner]
public class TitlelessWelcomeBannerForm
{
    public string? Name { get; set; }
}

/// <summary>A plain form without [WelcomeBanner]: no banner, the renderer keeps the accent strip.</summary>
[UI("welcome-banner/none"), Title("Plain")]
public class NoWelcomeBannerForm
{
    public string? Name { get; set; }
}

/// <summary>A banner with an overline: the short line above the title.</summary>
[UI("welcome-banner/overlined"), Title("Overlined"),
 WelcomeBanner(Overline = "Good morning", Title = "Front desk")]
public class OverlinedWelcomeBannerForm
{
    public string? Name { get; set; }
}

/// <summary>The Welcome archetype's hero carries HeroOverline.</summary>
[UI("welcome-banner/overlined-welcome")]
public class OverlinedWelcome : Welcome
{
    protected override string? HeroOverline => "Sales";
    protected override string? HeroTitle => "Quarterly review";
    public Button Start { get; } = new("Start", "start");
}

/// <summary>The Welcome archetype's hero defaults to the page's [Title] and [Subtitle].</summary>
[UI("welcome-banner/titled-welcome"), Title("Welcome aboard"), Subtitle("Start here")]
public class TitledWelcome : Welcome
{
    public Button Start { get; } = new("Start", "start");
}

/// <summary>An overridden HeroTitle wins over the declared [Title].</summary>
[UI("welcome-banner/overridden-welcome"), Title("Declared")]
public class OverriddenWelcome : Welcome
{
    protected override string? HeroTitle => "Overridden";
    public Button Start { get; } = new("Start", "start");
}

/// <summary>[WelcomeBanner] prepends a centered HeroSection (id "welcome-banner") to the page
/// content — the hero IS the banner, there is no new wire type. An empty Title falls back to the
/// view's [Title]. (Mirror of Java's WelcomeBannerSyncTest.)</summary>
public class WelcomeBannerTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(WelcomeBannerForm).Assembly));

    private static JsonElement RenderView(Type viewType) =>
        JsonSerializer.SerializeToElement(
            Handler().Handle(new RunActionRqDto { ServerSideType = viewType.FullName }), Json);

    [Fact]
    public void Welcome_banner_prepends_a_centered_hero_section_to_the_page_content()
    {
        var hero = FirstPageChild(RenderView(typeof(WelcomeBannerForm)));

        Assert.Equal("welcome-banner", hero.GetProperty("id").GetString());
        var metadata = hero.GetProperty("metadata");
        Assert.Equal("HeroSection", metadata.GetProperty("type").GetString());
        Assert.Equal("Find your flow", metadata.GetProperty("title").GetString());
        Assert.Equal("Stays that match your rhythm", metadata.GetProperty("subtitle").GetString());
        Assert.True(metadata.GetProperty("centered").GetBoolean());
    }

    [Fact]
    public void Welcome_banner_without_a_title_falls_back_to_the_view_title()
    {
        var metadata = FirstPageChild(RenderView(typeof(TitlelessWelcomeBannerForm)))
            .GetProperty("metadata");

        Assert.Equal("HeroSection", metadata.GetProperty("type").GetString());
        Assert.Equal("Guestbook", metadata.GetProperty("title").GetString());
        Assert.Equal(JsonValueKind.Null, metadata.GetProperty("subtitle").ValueKind);
        Assert.Equal(JsonValueKind.Null, metadata.GetProperty("image").ValueKind);
    }

    [Fact]
    public void Without_the_attribute_the_page_carries_no_welcome_banner()
    {
        var root = RenderView(typeof(NoWelcomeBannerForm));

        Assert.Null(ComponentOfType(root, "HeroSection"));
        Assert.DoesNotContain(Objects(root), o => o.TryGetProperty("id", out var id)
                                                  && id.GetString() == "welcome-banner");
    }

    [Fact]
    public void Welcome_banner_overline_travels_above_the_title()
    {
        var metadata = FirstPageChild(RenderView(typeof(OverlinedWelcomeBannerForm)))
            .GetProperty("metadata");
        Assert.Equal("Good morning", metadata.GetProperty("overline").GetString());
        Assert.Equal("Front desk", metadata.GetProperty("title").GetString());
    }

    [Fact]
    public void A_banner_without_overline_sends_none()
    {
        var metadata = FirstPageChild(RenderView(typeof(WelcomeBannerForm))).GetProperty("metadata");
        Assert.False(metadata.TryGetProperty("overline", out _));
    }

    [Fact]
    public void Welcome_archetype_hero_carries_its_overline()
    {
        var hero = ComponentOfType(RenderView(typeof(OverlinedWelcome)), "HeroSection");
        Assert.NotNull(hero);
        var metadata = hero!.Value.GetProperty("metadata");
        Assert.Equal("Sales", metadata.GetProperty("overline").GetString());
        Assert.Equal("Quarterly review", metadata.GetProperty("title").GetString());
    }

    // ── helpers (same walking approach as SectionFeatureTests) ────────────────

    [Fact]
    public void Welcome_archetype_hero_defaults_to_the_page_title_and_subtitle()
    {
        var metadata = ComponentOfType(RenderView(typeof(TitledWelcome)), "HeroSection")!.Value
            .GetProperty("metadata");
        Assert.Equal("Welcome aboard", metadata.GetProperty("title").GetString());
        Assert.Equal("Start here", metadata.GetProperty("subtitle").GetString());
    }

    [Fact]
    public void Welcome_archetype_overridden_hero_title_wins()
    {
        var metadata = ComponentOfType(RenderView(typeof(OverriddenWelcome)), "HeroSection")!.Value
            .GetProperty("metadata");
        Assert.Equal("Overridden", metadata.GetProperty("title").GetString());
    }

    private static JsonElement FirstPageChild(JsonElement root)
    {
        var page = ComponentOfType(root, "Page");
        Assert.NotNull(page);
        return page!.Value.GetProperty("children").EnumerateArray().First();
    }

    private static JsonElement? ComponentOfType(JsonElement root, string type) =>
        Objects(root)
            .Where(o => o.TryGetProperty("metadata", out var m)
                        && m.ValueKind == JsonValueKind.Object
                        && m.TryGetProperty("type", out var t)
                        && t.GetString() == type)
            .Cast<JsonElement?>()
            .FirstOrDefault();

    private static IEnumerable<JsonElement> Objects(JsonElement el)
    {
        switch (el.ValueKind)
        {
            case JsonValueKind.Object:
                yield return el;
                foreach (var property in el.EnumerateObject())
                foreach (var nested in Objects(property.Value))
                    yield return nested;
                break;
            case JsonValueKind.Array:
                foreach (var item in el.EnumerateArray())
                foreach (var nested in Objects(item))
                    yield return nested;
                break;
        }
    }
}
