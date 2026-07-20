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

    // ── helpers (same walking approach as SectionFeatureTests) ────────────────

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
