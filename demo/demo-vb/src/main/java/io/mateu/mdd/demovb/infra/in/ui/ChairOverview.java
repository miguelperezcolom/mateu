package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.core.infra.declarative.orchestrators.itemoverview.ItemOverview;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import java.util.List;

/** Arquetipo Item Overview: panel de datos clave fijo a la izquierda + tabs a la derecha. */
@UI("/chair")
@Title("Ergonomic chair EC-200")
public class ChairOverview extends ItemOverview {

  VerticalLayout keyInfo =
      VerticalLayout.builder()
          .content(
              List.of(
                  new Text("k1", "SKU: EC-200-BLK"),
                  new Text("k2", "Category: Office seating"),
                  new Text("k3", "Status: Active"),
                  new Text("k4", "Stock: 143 units"),
                  new Text("k5", "Price: 349 €")))
          .build();

  @Panel(title = "Specifications")
  VerticalLayout specs =
      VerticalLayout.builder()
          .content(
              List.of(
                  new Text("s1", "Mesh back with lumbar support"),
                  new Text("s2", "4D armrests, tilt lock"),
                  new Text("s3", "Max load 130 kg")))
          .build();

  @Panel(title = "Reviews")
  VerticalLayout reviews =
      VerticalLayout.builder()
          .content(
              List.of(
                  new Text("r1", "4.6 / 5 (312 reviews)"),
                  new Text("r2", "“Best chair for long sessions” — J. P."),
                  new Text("r3", "“Great value for money” — M. K.")))
          .build();
}
