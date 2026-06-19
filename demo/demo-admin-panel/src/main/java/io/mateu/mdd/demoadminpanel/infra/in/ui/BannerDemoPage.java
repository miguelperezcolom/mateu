package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.Banner;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.PageBanner;
import java.util.List;

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

    @Banner(theme = BannerTheme.SUCCESS, title = "Success")
    String successMessage() {
        return "Everything is working correctly.";
    }

    // Action-returned banners via toolbar buttons

    @Toolbar
    PageBanner showWarning() {
        return new PageBanner(BannerTheme.WARNING, "Warning", "This is a dynamic warning banner returned from an action.");
    }

    @Toolbar
    PageBanner showDanger() {
        return new PageBanner(BannerTheme.DANGER, "Danger", "This is a dynamic danger banner returned from an action.");
    }

    @Toolbar
    List<PageBanner> showMultiple() {
        return List.of(
            new PageBanner(BannerTheme.INFO, "Step 1 complete", "The first step was processed successfully."),
            new PageBanner(BannerTheme.WARNING, "Step 2 pending", "Please review the pending items before continuing.")
        );
    }
}
