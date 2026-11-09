// The C# twin (Mateu.NET): return a PageBanner (replace) or PageBanners.Append(…).
using Mateu.Uidl;

[UI("night-audit"), Title("Night audit")]
public class NightAudit
{
    public int Checks { get; set; }

    [Button("Run audit (replace)")]
    public PageBanner Audit() => new(BannerTheme.Success, "Audit passed", "All 214 folios balance.");

    [Button("Add a finding (append)")]
    public PageBanners Finding()
    {
        Checks++;
        return PageBanners.Append(new PageBanner(BannerTheme.Warning, $"Finding {Checks}", $"Folio {1000 + Checks} is open."));
    }
}
