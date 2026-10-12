package io.mateu.sample1;

import io.mateu.uidl.annotations.Badge;
import io.mateu.uidl.annotations.BulletedList;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.FileUpload;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Multiline;
import io.mateu.uidl.annotations.Notice;
import io.mateu.uidl.annotations.PhotoCapture;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.SeparatorBefore;
import io.mateu.uidl.annotations.Signature;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Text;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.TreeSelect;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.UploadableImage;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.TextSize;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import io.mateu.uidl.interfaces.OptionsSupplier;
import java.util.List;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

/**
 * Walkthrough fixture for the fields that are more than an input: choices fed by the view (lookup,
 * tree select, multi-choice of enum constants), capture fields, read-only presentations (plain
 * text, badge, bulleted list, notice, sized text), and a separator. {@code echo} prints what the
 * server received, so a widget that displays one thing and commits another is caught.
 */
@UI("/walk-special")
@Title("Special fields walk")
@Getter
@Setter
public class SpecialFieldsWalkForm
    implements LookupOptionsSupplier, LookupLabelSupplier, OptionsSupplier {

  /** Remote search-as-you-type combo; the pre-set id shows its label, never the raw id. */
  @Lookup String supplier = "a2";

  @TreeSelect(leavesOnly = true)
  String zone = "mca";

  @Stereotype(FieldStereotype.multiSelect)
  Set<Amenity> amenities = Set.of(Amenity.WIFI);

  @Stereotype(FieldStereotype.checkbox)
  List<Amenity> extras = List.of(Amenity.POOL);

  @Stereotype(FieldStereotype.markdown)
  String markdown = "**bold** text";

  @Stereotype(FieldStereotype.html)
  String html = "<em>emphasis</em>";

  @UploadableImage String avatar;

  @Signature String signature;

  @PhotoCapture String photo;

  @FileUpload(accept = ".csv")
  String attachment;

  @SeparatorBefore @PlainText String code = "R-001";

  @PlainText @Multiline String longText = "A long text that wraps over several lines when it does not fit.";

  @ReadOnly String locked = "cannot edit";

  @Badge boolean vip = true;

  @BulletedList List<String> preferences = List.of("Quiet room", "Late checkout");

  @Notice(theme = "warning")
  String warning = "2 pending complaints";

  @Notice String hiddenNotice = "";

  @Text(size = TextSize.xs)
  String caption = "Small print";

  @Button
  public Message echo() {
    return new Message(
        "echo: supplier="
            + supplier
            + " zone="
            + zone
            + " amenities="
            + (amenities == null ? null : new java.util.TreeSet<>(amenities))
            + " extras="
            + extras
            + " avatar="
            + (avatar == null ? null : avatar.substring(0, Math.min(15, avatar.length())))
            + " signature="
            + (signature == null ? null : signature.substring(0, Math.min(15, signature.length())))
            + " attachment="
            + (attachment == null ? null : attachment.substring(0, Math.min(15, attachment.length())))
            + " code="
            + code
            + " locked="
            + locked
            + " vip="
            + vip);
  }

  @Override
  public ListingData<Option> search(
      String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
    var all =
        List.of(new Option("a1", "Alpha Foods"), new Option("a2", "Acme"), new Option("b1", "Beta"));
    var text = searchText == null ? "" : searchText.toLowerCase();
    return ListingData.of(all.stream().filter(o -> o.label().toLowerCase().contains(text)).toList());
  }

  @Override
  public String label(String fieldName, Object id, HttpRequest httpRequest) {
    return switch (String.valueOf(id)) {
      case "a1" -> "Alpha Foods";
      case "a2" -> "Acme";
      case "b1" -> "Beta";
      default -> null;
    };
  }

  @Override
  public boolean supports(Class<?> fieldType, String fieldName, Class<?> formType) {
    return "zone".equals(fieldName);
  }

  @Override
  public List<Option> options(String fieldName, HttpRequest httpRequest) {
    return List.of(
        new Option(
            "es", "Spain", List.of(new Option("mca", "Mallorca"), new Option("men", "Menorca"))),
        new Option("pt", "Portugal"));
  }

  public enum Amenity {
    WIFI,
    POOL,
    SPA,
    GYM
  }
}
