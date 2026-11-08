package io.mateu.explorer.examples.behaviour.pagewidth;

import io.mateu.uidl.annotations.Notice;
import io.mateu.uidl.annotations.PageTemplate;
import io.mateu.uidl.annotations.PageType;
import io.mateu.uidl.annotations.Title;

/**
 * No width declared, but the page TYPE is declared: {@code COLLECTION} (and {@code DASHBOARD})
 * default to full width; {@code FORM}, {@code PROCESS} and {@code LANDING} to fixed. Without
 * {@code @PageTemplate} the type is inferred from the shape (archetype, listing, metric cards…),
 * and a plain form is {@code FORM}.
 */
@Title("Typed as a collection")
@PageTemplate(PageType.COLLECTION)
public class CollectionTypedPage {

  @Notice(fullWidth = true)
  String band = "No @PageWidth here: the COLLECTION type alone makes the page full width.";

  String name = "Ada Lovelace";
}
