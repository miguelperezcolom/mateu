package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.Banner;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.data.BannerTheme;

public class BannerDemoPage {

    @ReadOnly
    String name = "Mateu Framework";

    @ReadOnly
    String version = "0.0.1-MATEU";

    @Banner(theme = BannerTheme.INFO, title = "Information")
    String infoMessage() {
        return "This page demonstrates the @Banner annotation. Messages appear below the header.";
    }

    @Banner(theme = BannerTheme.SUCCESS, title = "Success")
    String successMessage() {
        return "Everything is working correctly.";
    }

    @Banner(theme = BannerTheme.WARNING, title = "Warning")
    String warningMessage() {
        return "Some features may be in preview and subject to change.";
    }

    @Banner(theme = BannerTheme.DANGER, title = "Danger")
    String dangerMessage() {
        return "Do not modify configuration files while the server is running.";
    }
}
