using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("banner-actions"), Title("Banner actions")]
public class BannerActions
{
    public string? Name { get; set; } = "Ann";

    [Button] public PageBanners Warn() => PageBanners.Append(new PageBanner(BannerTheme.Warning, "Heads up", "Check the dates"));

    [Button] public PageBanners Only() => PageBanners.Replace(new PageBanner(Title: "Only"));

    [Button] public List<PageBanner> Bare() => [new PageBanner(Title: "Bare")];

    /// <summary>The new state AND appended banners, in one answer.</summary>
    [Button] public object[] SaveAndTell() => [this, PageBanners.Append(new PageBanner(BannerTheme.Success, "Saved"))];
}

/// <summary>Java's <c>PageBanners</c> on .NET: <c>Append</c> accumulates over the banners earlier
/// actions showed (<c>appendBanners: true</c> on the increment), <c>Replace</c> — like a bare
/// <c>PageBanner</c> or a list — swaps them; inside a list with the new state the flag survives
/// (mirrors Java's MessageMapper.mapToAppendBanners and the Python port).</summary>
public class PageBannersTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(BannerActions).Assembly));

    private static UIIncrementDto Run(string actionId) => Handler().Handle(new RunActionRqDto
    {
        Route = "banner-actions", ConsumedRoute = "banner-actions", ActionId = actionId,
        ServerSideType = typeof(BannerActions).FullName, InitiatorComponentId = "pb_app",
        ComponentState = new() { ["name"] = JsonSerializer.SerializeToElement("Ann") },
    });

    [Fact]
    public void Append_carries_the_banner_and_the_append_flag()
    {
        var inc = Run("warn");
        var banner = Assert.IsType<BannerDto>(Assert.Single(inc.Banners));
        Assert.Equal("Heads up", banner.Title);
        Assert.True(inc.AppendBanners);
        Assert.Contains("\"appendBanners\":true", JsonSerializer.Serialize(inc, Json));
    }

    [Fact]
    public void Replace_is_the_default_mode()
    {
        var inc = Run("only");
        Assert.Equal("Only", Assert.IsType<BannerDto>(Assert.Single(inc.Banners)).Title);
        Assert.False(inc.AppendBanners);
    }

    [Fact]
    public void A_bare_banner_list_replaces_as_before()
    {
        var inc = Run("bare");
        Assert.Single(inc.Banners);
        Assert.False(inc.AppendBanners);
    }

    [Fact]
    public void Appended_banners_survive_inside_a_list_with_the_new_state()
    {
        var inc = Run("saveAndTell");
        Assert.Single(inc.Fragments); // the re-rendered form
        Assert.Equal("Saved", Assert.IsType<BannerDto>(Assert.Single(inc.Banners)).Title);
        Assert.True(inc.AppendBanners);
    }

    [Fact]
    public void The_factories_set_the_mode()
    {
        Assert.True(PageBanners.Append(new PageBanner()).Appending);
        Assert.False(PageBanners.Replace(new PageBanner()).Appending);
        Assert.Equal(2, PageBanners.Append(new PageBanner(), new PageBanner()).Banners.Count);
    }
}
