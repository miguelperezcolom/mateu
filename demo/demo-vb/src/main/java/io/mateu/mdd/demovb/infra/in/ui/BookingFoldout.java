package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.core.infra.declarative.orchestrators.foldout.Foldout;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import java.util.List;

/**
 * Fase 7 (Foldout): el primer campo componente sin @Panel es el overview siempre visible; los
 * campos @Panel son paneles laterales que se pliegan/despliegan (open=false arranca plegado).
 */
@UI("/booking")
@Title("Booking B-1024")
public class BookingFoldout extends Foldout {

  VerticalLayout overview =
      VerticalLayout.builder()
          .content(
              List.of(
                  new Text("g", "Guest: Jane Smith"),
                  new Text("h", "Hotel: Playa Azul"),
                  new Text("d", "Dates: 12 – 19 Aug 2026"),
                  new Text("r", "Room: Double superior, sea view"),
                  new Text("s", "Status: Confirmed"),
                  new Text("t", "Total: 1.240 € · Paid: 620 €")))
          .build();

  @Panel(title = "Payments", subtitle = "Charges and refunds")
  VerticalLayout payments =
      VerticalLayout.builder()
          .content(
              List.of(
                  new Text("p1", "02/05 · Deposit · 620 €"),
                  new Text("p2", "12/08 · Balance · pending")))
          .build();

  @Panel(title = "Guest profile", subtitle = "Contact and loyalty")
  VerticalLayout guest =
      VerticalLayout.builder()
          .content(
              List.of(
                  new Text("g1", "Jane Smith"),
                  new Text("g2", "Gold member · 12 stays"),
                  new Text("g3", "jane.smith@mail.com · +34 600 111 222")))
          .build();

  @Panel(title = "Notes", open = false)
  VerticalLayout notes =
      VerticalLayout.builder()
          .content(
              List.of(
                  new Text("n1", "Guest asked for a late checkout"),
                  new Text("n2", "Allergic to nuts (breakfast)")))
          .build();
}
