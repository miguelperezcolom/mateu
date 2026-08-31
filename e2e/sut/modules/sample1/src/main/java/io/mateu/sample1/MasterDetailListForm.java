package io.mateu.sample1;

import io.mateu.uidl.annotations.MasterDetail;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

import java.util.ArrayList;
import java.util.List;

/**
 * A form with a {@code @MasterDetail} list field: the grid shows a per-row "Edit" button that must
 * open the row's DETAIL EDITOR (not merely select the row). Regression guard for the bug where the
 * grid's row-click selection fired on the Edit-button click too — dispatching {@code <field>_selected}
 * alongside {@code <field>_select}, whose response reset {@code _show_detail} and closed the editor —
 * and where the detail form rendered into an off-screen {@code vaadin-master-detail-layout} overlay.
 */
@UI("/master-detail-list")
@Title("Master Detail List")
public class MasterDetailListForm {

  @MasterDetail(minHeightWhenDetailVisible = "16rem")
  List<Guest> guests =
      new ArrayList<>(
          List.of(new Guest("Ada Lovelace", "ada@example.com"), new Guest("Alan Turing", "alan@example.com")));

  public record Guest(String name, String email) {}
}
