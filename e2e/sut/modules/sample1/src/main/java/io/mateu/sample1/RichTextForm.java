package io.mateu.sample1;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

/**
 * Fixture for the editable rich text field. Its editor is Mateu's own (on Tiptap / ProseMirror), which replaced
 * vaadin-rich-text-editor (commercially licensed): the value is HTML, and a value in the old
 * editor's Delta JSON still opens.
 */
@UI("/rich-text")
@Title("Rich text")
@Getter
@Setter
public class RichTextForm {

  @Stereotype(FieldStereotype.richText)
  String notes = "<p>Guest prefers a <strong>quiet</strong> room</p>";

  /** What the old Vaadin editor used to store for "Hi" in bold. */
  @Stereotype(FieldStereotype.richText)
  String legacy = "[{\"insert\":\"Hi\",\"attributes\":{\"bold\":true}},{\"insert\":\"\\n\"}]";

  @Button
  public Message show() {
    return new Message("notes=" + notes);
  }
}
