package io.mateu.sample1.pages;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WelcomeBanner;

/** A plain form carrying the Welcome Banner element (e2e/tests/shared/page-anatomy.spec.ts). */
@UI("/arch/welcome-banner")
@Title("Front desk")
@WelcomeBanner(title = "Good morning, Ada", subtitle = "Three arrivals today")
public class WelcomeBannerPage {
  public String note = "";
}
