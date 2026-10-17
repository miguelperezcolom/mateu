using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public class BadgedBooking
{
    [HeaderBadge("success", Label = "VIP")] public bool Vip { get; set; } = true;
    [HeaderBadge("warning")] public bool Overbooked { get; set; } = true;
    [HeaderBadge("error")] public bool Cancelled { get; set; }
    [HeaderBadge] public string? Status { get; set; } = "Confirmed";
    [HeaderBadge] public string? Empty { get; set; }
    public string Guest { get; set; } = "Ana";

    [Hidden] public string? Secret { get; set; } = "s";
    [Hidden("")] public string? AlsoSecret { get; set; } = "t";
    [Hidden("!state.guest")] public string? Conditional { get; set; }

    [Kpi("Nights"), Kpi("Stay length")] public int Nights { get; set; } = 3;
    [Kpi("Total"), Kpi("Amount due")] public string Total() => "120 €";
}

/// <summary>M-A6: [HeaderBadge] had no Label and showed a bool as a "True"/"False" chip (Java's
/// @BadgeInHeader shows its label while true, nothing while false); [Hidden] required an argument
/// and [Hidden("")] did nothing; only the first of several [Kpi] was read.</summary>
public class HeaderFeaturesParityTests
{
    private static string Json() => System.Text.Json.JsonSerializer.Serialize(
        new ReflectionMapper().MapView(typeof(BadgedBooking), new BadgedBooking(), "/b"),
        new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.Web));

    private static PageMetadataDto Page() =>
        FindPage(new ReflectionMapper().MapView(typeof(BadgedBooking), new BadgedBooking(), "/b"))!;

    private static PageMetadataDto? FindPage(ComponentDto? component)
    {
        if (component is ClientSideComponentDto { Metadata: PageMetadataDto page }) return page;
        var children = component switch
        {
            ClientSideComponentDto c => c.Children,
            ServerSideComponentDto s => s.Children,
            _ => null,
        };
        return children?.Select(FindPage).FirstOrDefault(p => p is not null);
    }

    [Fact]
    public void A_bool_badge_shows_its_label_while_true_and_nothing_while_false()
    {
        var badges = Page().Badges.Select(b => (b.Text, b.Color)).ToList();
        Assert.Contains(("VIP", "success"), badges);
        Assert.Contains(("Overbooked", "warning"), badges);
        Assert.Contains(("Confirmed", "normal"), badges);
        Assert.DoesNotContain(badges, b => b.Text is "True" or "False" || b.Color == "error");
        Assert.Equal(3, badges.Count);
    }

    [Fact]
    public void Header_badge_properties_are_not_form_fields()
    {
        var json = Json();
        Assert.DoesNotContain("\"fieldId\":\"vip\"", json);
        Assert.DoesNotContain("\"fieldId\":\"status\"", json);
        Assert.Contains("\"fieldId\":\"guest\"", json);
    }

    [Fact]
    public void Hidden_without_an_expression_always_hides()
    {
        var rules = new List<System.Text.Json.JsonElement>();
        void Walk(System.Text.Json.JsonElement e)
        {
            if (e.ValueKind == System.Text.Json.JsonValueKind.Object)
            {
                if (e.TryGetProperty("fieldAttribute", out var a) && a.GetString() == "hidden") rules.Add(e);
                foreach (var p in e.EnumerateObject()) Walk(p.Value);
            }
            else if (e.ValueKind == System.Text.Json.JsonValueKind.Array)
                foreach (var i in e.EnumerateArray()) Walk(i);
        }
        Walk(System.Text.Json.JsonDocument.Parse(Json()).RootElement);
        string? HiddenWhen(string field) =>
            rules.SingleOrDefault(r => r.GetProperty("fieldName").GetString() == field)
                is { ValueKind: System.Text.Json.JsonValueKind.Object } r
                ? r.GetProperty("expression").GetString() : null;
        Assert.Equal("true", HiddenWhen("secret"));
        Assert.Equal("true", HiddenWhen("alsoSecret"));
        Assert.Equal("!state.guest", HiddenWhen("conditional"));
    }

    [Fact]
    public void Every_kpi_is_read()
    {
        var kpis = Page().Kpis.Select(k => (k.Title, k.Text)).ToList();
        Assert.Equal(
            [("Nights", "3"), ("Stay length", "3"), ("Total", "120 €"), ("Amount due", "120 €")], kpis);
    }
}
