package io.mateu.explorer.examples.behaviour.stereotyperichtext;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;

/**
 * Three editors for formatted text, all in a String field:
 *
 * <ul>
 *   <li>{@code richText} — a WYSIWYG editor; the value is HTML;
 *   <li>{@code markdown} — the Markdown source with a Preview;
 *   <li>{@code html} — the HTML source with a Preview.
 * </ul>
 *
 * Whatever comes from data is sanitised before it is drawn.
 */
@Title("Article")
public class ArticleEditor {

  @Stereotype(FieldStereotype.richText)
  String body = "<p>Rooms with a <strong>sea view</strong> are booked first.</p>";

  @Stereotype(FieldStereotype.markdown)
  String summary = "**Two** nights, *half board*.\n\n- airport transfer\n- late check-out";

  @Stereotype(FieldStereotype.html)
  String footer = "<em>Prices include VAT.</em>";

  @Button
  Message save() {
    return Message.success("Body as stored: " + body);
  }
}
