package io.mateu.explorer.examples.behaviour.stereotypechoices;

import io.mateu.uidl.annotations.AutoLayout;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UseRadioButtons;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import java.util.ArrayList;
import java.util.List;

/**
 * How an enum is chosen follows the field's type — and, under {@code @AutoLayout}, its size:
 *
 * <ul>
 *   <li>an enum → a select; with {@code @AutoLayout}, one of up to 4 constants → radio buttons;
 *   <li>a {@code List} of an enum → a multi-select;
 *   <li>{@code @UseRadioButtons} forces radios at any size; {@code @Stereotype} picks another
 *       widget (checkbox group, list box, combobox…).
 * </ul>
 *
 * Constants are HUMANISED for display: {@code CHECK_OUT} reads "Check out", {@code ROOM1} "Room 1";
 * a {@code @Label} on a constant (or an overridden {@code toString()}) wins.
 */
@Title("Room preferences")
@AutoLayout
public class RoomPreferences {

  enum Bed {
    SINGLE,
    DOUBLE,
    TWIN_BEDS
  }

  enum Floor {
    GROUND,
    FIRST,
    SECOND,
    THIRD,
    FOURTH,
    @Label("Penthouse ✨")
    TOP
  }

  enum Extra {
    LATE_CHECK_OUT,
    EARLY_CHECK_IN,
    AIRPORT_TRANSFER,
    BABY_COT
  }

  Bed bed = Bed.DOUBLE;

  Floor floor = Floor.FIRST;

  @UseRadioButtons Floor alternativeFloor;

  List<Extra> extras = new ArrayList<>();

  @Stereotype(FieldStereotype.checkbox)
  List<Extra> extrasAsCheckboxes = new ArrayList<>();

  @Stereotype(FieldStereotype.listBox)
  Bed bedAsListBox = Bed.SINGLE;

  @Button
  Message save() {
    return Message.success("Bed " + bed + ", floor " + floor + ", extras " + extras);
  }
}
