# The Python twin (mateu-ui): return a PageBanner (replace) or PageBanners.append(...).
from mateu_ui.uidl import BannerTheme, PageBanner, PageBanners, button, title, ui


@ui("night-audit")
@title("Night audit")
class NightAudit:
    checks: int = 0

    @button("Run audit (replace)")
    def audit(self) -> PageBanner:
        return PageBanner(BannerTheme.SUCCESS, "Audit passed", "All 214 folios balance.")

    @button("Add a finding (append)")
    def finding(self) -> PageBanners:
        self.checks += 1
        return PageBanners.append(
            PageBanner(BannerTheme.WARNING, f"Finding {self.checks}", f"Folio {1000 + self.checks} is open.")
        )
