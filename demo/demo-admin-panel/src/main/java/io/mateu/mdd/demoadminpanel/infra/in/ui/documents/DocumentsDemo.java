package io.mateu.mdd.demoadminpanel.infra.in.ui.documents;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Document;
import io.mateu.uidl.data.PageSetup;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.DocumentRenderer;

/**
 * Documents and printing: toolbar actions return a generated PDF {@link Document} — shown in a new
 * tab, downloaded, or handed straight to the print dialog — and {@link UICommand#print()} prints
 * this page without the app chrome. The PDF is rendered from plain HTML by the {@link
 * DocumentRenderer} this demo implements itself ({@link DemoPdfRenderer}, on Apache PDFBox): Mateu
 * delivers documents, the application produces them.
 */
@UI("/documents-demo")
@Title("Folio 2026-0042")
public class DocumentsDemo {

  @Section("Estancia")
  @PlainText
  String guest = "Ana Núñez";

  @PlainText String room = "204";

  @PlainText String nights = "3";

  @PlainText String total = "1.234,00 €";

  @Toolbar
  @Label("Ver factura")
  Document preview() {
    return Document.pdf("factura-2026-0042.pdf", invoice(3));
  }

  @Toolbar
  @Label("Descargar factura")
  Document download() {
    return Document.pdf("factura-2026-0042.pdf", invoice(3)).downloaded();
  }

  @Toolbar
  @Label("Imprimir factura")
  Document printInvoice() {
    return Document.pdf("factura-2026-0042.pdf", invoice(3)).printed();
  }

  @Toolbar
  @Label("Informe grande")
  Document bigReport() {
    // well over the inline limit: travels behind a single-use URL instead of the JSON
    return Document.lazy("informe-ocupacion.pdf", Document.PDF, () -> invoice(4000)).showInline();
  }

  @Toolbar
  @Label("Imprimir pantalla")
  UICommand printPage() {
    return UICommand.print();
  }

  private byte[] invoice(int nightsCount) {
    StringBuilder rows = new StringBuilder();
    for (int i = 1; i <= nightsCount; i++) {
      rows.append("<tr><td>Noche ")
          .append(i)
          .append(" — habitación doble superior</td><td>1</td><td align=\"right\">411,33 €</td></tr>");
    }
    String html =
        """
        <h1>Factura 2026-0042</h1>
        <p>Huésped: <b>%s</b> — habitación <i>%s</i><br>Salida: 12/10/2026</p>
        <table>
          <thead><tr><th width="60%%">Concepto</th><th>Uds.</th><th align="right">Importe</th></tr></thead>
          <tbody>%s</tbody>
        </table>
        <hr>
        <p style="text-align: right">Total: <strong>%s</strong></p>
        """
            .formatted(guest, room, rows, total);
    // the application's DocumentRenderer bean (DemoPdfRenderer here; any implementation would do)
    return MateuBeanProvider.getBean(DocumentRenderer.class)
        .render(
        html, PageSetup.a4().withTitle("Factura 2026-0042").withHeader("Hotel Demo||{title}"));
  }
}
