package io.mateu.explorer.examples.behaviour.editablegridfield;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.State;
import java.util.ArrayList;
import java.util.List;

/**
 * A {@code List} of rows is a GRID field, part of the form's state. {@code @InlineEditing} edits
 * the cells in place ("+" appends a row); without it, rows open in a detail form. The edited rows
 * come back to the server with the rest of the form.
 */
@Title("Quote")
public class QuoteForm {

  String customer = "Acme";

  @Label("Lines")
  @InlineEditing
  @Stereotype(FieldStereotype.grid)
  List<Line> lines = new ArrayList<>(List.of(new Line("Consulting", 2, 450), new Line("Travel", 1, 120)));

  @ReadOnly double total = 1020;

  @Button
  Object recalculate() {
    total = lines.stream().mapToDouble(l -> l.quantity * l.price).sum();
    return List.of(Message.success(lines.size() + " lines"), new State(this));
  }

  public static class Line {
    String concept = "";
    int quantity;
    double price;

    public Line() {}

    Line(String concept, int quantity, double price) {
      this.concept = concept;
      this.quantity = quantity;
      this.price = price;
    }

    public String getConcept() {
      return concept;
    }

    public void setConcept(String concept) {
      this.concept = concept;
    }

    public int getQuantity() {
      return quantity;
    }

    public void setQuantity(int quantity) {
      this.quantity = quantity;
    }

    public double getPrice() {
      return price;
    }

    public void setPrice(double price) {
      this.price = price;
    }
  }
}
