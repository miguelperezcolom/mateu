package io.mateu.uidl;

public class StyleConstants {
  public static final String CONTAINER = "max-width:900px;margin: auto;display: block;";
  public static final String FULL_WIDTH = "width: 100%;";
  public static final String FULL_WIDTH_WITH_PADDING =
      "width: 100%;padding-left: 2rem;padding-right: 2rem;box-sizing: border-box;";

  /**
   * High-density Lumo preset. Overrides the Lumo size/spacing/font custom properties on the page
   * container; because CSS custom properties inherit through shadow DOM, every component inside is
   * condensed. Applied automatically by the {@code @Compact} annotation, or usable directly via
   * {@code @Style}.
   */
  public static final String COMPACT =
      // The big win: kill the form-layout's generous inter-row gap (Vaadin default ~1em).
      "--vaadin-form-layout-row-spacing:0.2rem;--vaadin-form-layout-label-spacing:0.05rem;"
          // Card chrome (independent of --lumo-space-*, default ~16px each).
          + "--vaadin-card-padding:0.2rem 0.7rem;--vaadin-card-gap:0.15rem;"
          // Smaller control heights and spacing (but NOT font size — keep text legible).
          + "--lumo-size-xl:2.2rem;--lumo-size-l:1.8rem;--lumo-size-m:1.35rem;"
          + "--lumo-size-s:1.2rem;--lumo-size-xs:1.05rem;"
          + "--lumo-space-xl:0.9rem;--lumo-space-l:0.45rem;--lumo-space-m:0.3rem;"
          + "--lumo-space-s:0.18rem;--lumo-space-xs:0.1rem;"
          + "--lumo-line-height-m:1.15;"
          // Compress field labels (consumed by mateu-field's --mateu-label-* hooks).
          + "--mateu-label-font-size:var(--lumo-font-size-xs);--mateu-label-padding-bottom:1px;"
          + "--mateu-label-line-height:1.1;";
}
