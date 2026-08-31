package com.example.demo.infra.in.ui.pages.tests;

import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.StaticView;
import io.mateu.uidl.annotations.Title;

/**
 * A fully-static screen: its content never varies. Marked {@code @StaticView} so the client caches
 * the whole response for the session and skips the round-trip on return visits.
 */
@Route("/static-about")
@Title("About Mateu")
@StaticView
@PlainText
public class StaticAbout {
    String product = "Mateu";
    String tagline = "Model-driven UI for Java.";
    String version = "3.0";
}
