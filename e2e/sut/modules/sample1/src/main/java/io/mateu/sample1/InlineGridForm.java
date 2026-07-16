package io.mateu.sample1;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.util.ArrayList;
import java.util.List;

/**
 * A PLAIN form (no wizard, no CRUD orchestrator) hosting grid fields and a lookup — the
 * combination that historically only worked inside wizards. Covers: inline-editing grid where "+"
 * appends an in-place row, a detail-form grid whose add/create resolve the row type from the
 * field's generic type, a read-only grid, and a @Lookup without label= falling back to the raw id.
 */
@UI("/inline-grid-form")
@Title("Inline Grid Form")
public class InlineGridForm {

  String name = "";

  // No label supplier on purpose: the label must fall back to the raw id.
  @Lookup(search = SupplierOptions.class)
  String supplierId = "S1";

  @Label("Lines")
  @InlineEditing
  @Stereotype(FieldStereotype.grid)
  List<Line> lines = new ArrayList<>();

  @Label("Extras")
  @Stereotype(FieldStereotype.grid)
  List<Line> extras = new ArrayList<>();

  @Label("Snapshot")
  @ReadOnly
  @Stereotype(FieldStereotype.grid)
  List<Line> snapshot = new ArrayList<>();

  /** Reads the (inline-edited) lines back and republishes them, proving the state round-trip. */
  @Button
  public Object recalc() {
    snapshot = new ArrayList<>(lines);
    return List.of(new Message(lines.size() + " lines"), new State(this));
  }

  public static class Line {
    @Label("Concept")
    String concept = "";

    @Label("Qty")
    int qty;

    public Line() {}

    public String getConcept() {
      return concept;
    }

    public void setConcept(String concept) {
      this.concept = concept;
    }

    public int getQty() {
      return qty;
    }

    public void setQty(int qty) {
      this.qty = qty;
    }
  }

  /** Instantiated by no-args constructor when no DI bean exists — framework-agnostic. */
  public static class SupplierOptions implements LookupOptionsSupplier {

    @Override
    public ListingData<Option> search(
        String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
      return ListingData.of(
          List.of(new Option("S1", "Supplier One"), new Option("S2", "Supplier Two")));
    }
  }
}
