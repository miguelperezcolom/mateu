package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Banner;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.data.PageBanners;
import java.util.List;

@Style(StyleConstants.CONTAINER)
public class BannerDemoPage {

    @ReadOnly
    String name = "Mateu Framework";

    @ReadOnly
    String version = "0.0.1-MATEU";

    // Static banners via @Banner annotation

    @Banner(theme = BannerTheme.INFO, title = "Information")
    String infoMessage() {
        return "This page demonstrates @Banner (static) and action-returned banners (dynamic).";
    }

    @Banner(theme = BannerTheme.SUCCESS, title = "Success", closeable = true)
    String successMessage() {
        return "This banner is closeable — use the × button to dismiss it.";
    }

    @Banner(theme = BannerTheme.WARNING, title = "Auto-dismiss", timeoutSeconds = 5)
    String autoMessage() {
        return "This banner disappears after 5 seconds.";
    }

    // Action-returned banners via toolbar buttons

    @Toolbar
    PageBanner showWarning() {
        return new PageBanner(BannerTheme.WARNING, "Warning", "This is a dynamic warning banner returned from an action.", false, 0);
    }

    @Toolbar
    PageBanner showDanger() {
        return new PageBanner(BannerTheme.DANGER, "Danger", "This is a dynamic danger banner returned from an action.", true, 0);
    }

    @Toolbar
    PageBanner showTimeout() {
        return new PageBanner(BannerTheme.INFO, "Auto-dismiss", "This action banner disappears after 4 seconds.", false, 4);
    }

    @Toolbar
    PageBanners showMultiple() {
        return PageBanners.replace(
            new PageBanner(BannerTheme.INFO, "Step 1 complete", "The first step was processed successfully.", false, 0),
            new PageBanner(BannerTheme.WARNING, "Step 2 pending", "Please review the pending items before continuing.", true, 0)
        );
    }

    @Toolbar
    PageBanners addStep() {
        return PageBanners.append(
            new PageBanner(BannerTheme.SUCCESS, "Step added", "This banner was appended to the existing ones.", true, 0)
        );
    }
}
