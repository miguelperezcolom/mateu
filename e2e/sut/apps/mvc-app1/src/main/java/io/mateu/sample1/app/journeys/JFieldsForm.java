package io.mateu.sample1.app.journeys;

import io.mateu.uidl.annotations.BulletedList;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Notice;
import io.mateu.uidl.annotations.PhotoCapture;
import io.mateu.uidl.annotations.SeparatorBefore;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import java.util.List;

/**
 * Fields the shared suite does not walk (tests/journeys/fields.spec.ts): a tab strip that opens on
 * its second tab ({@code @Tab(open = true)}), a read-only bulleted list, a separator outside and
 * inside a tab, a notice whose text is the field's value, and a photo taken with the (fake) camera.
 */
@UI("/j/fields")
@Title("Journey fields")
public class JFieldsForm {

  String booking = "BK-1001";

  @SeparatorBefore
  String desk = "Front desk";

  @Tab("Guest")
  String guestName = "Ada";

  // KNOWN GAP: @SeparatorBefore inside a @Tab is dropped (TabFormLayoutBuilder never emits it);
  // fields.spec.ts pins it as a fixme.
  @Tab("Guest")
  @SeparatorBefore
  String guestEmail = "ada@example.com";

  @Tab(value = "Preferences", open = true)
  @BulletedList
  List<String> preferences = List.of("Quiet room", "Late check-out", "No feathers");

  @Tab(value = "Preferences", open = true)
  @Notice(theme = "warning")
  String complaints = "2 pending complaints";

  @Tab("Photo")
  @PhotoCapture
  String photo;

  @Button
  public Message describe() {
    return new Message(
        "guest="
            + guestName
            + "; photo="
            + (photo == null || photo.isBlank()
                ? "none"
                : photo.substring(0, Math.min(15, photo.length()))));
  }
}
