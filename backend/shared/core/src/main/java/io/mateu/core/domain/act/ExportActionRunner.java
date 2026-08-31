package io.mateu.core.domain.act;

import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.*;
import io.mateu.uidl.interfaces.*;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

@Named
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class ExportActionRunner implements ActionRunner {

  private final BeanProvider beanProvider;

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return (instance instanceof Listing<?> || instance instanceof ReactiveListing<?>)
        && actionId != null
        && actionId.startsWith("export-");
  }

  @Override
  public int priority() {
    return 50;
  }

  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var actionId = command.actionId();
    var httpRequest = command.httpRequest();

    var rows = fetchAllRows(instance, httpRequest);
    var columns = buildExportColumns(rowClass(instance));

    byte[] bytes;
    String filename;
    String mimeType;

    // the exporter interface declares `throws Exception` (IO/format failures) — surface it as
    // itself
    try {
      switch (actionId) {
        case "export-excel" -> {
          var exporter = beanProvider.getBean(ExcelExporter.class);
          bytes = exporter.export(rows, columns, httpRequest);
          filename = "export.xlsx";
          mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }
        case "export-pdf" -> {
          var exporter = beanProvider.getBean(PdfExporter.class);
          bytes = exporter.export(rows, columns, httpRequest);
          filename = "export.pdf";
          mimeType = "application/pdf";
        }
        default -> {
          var exporter = beanProvider.getBean(CsvExporter.class);
          bytes = exporter.export(rows, columns, httpRequest);
          filename = "export.csv";
          mimeType = "text/csv";
        }
      }
    } catch (Exception e) {
      throw e instanceof RuntimeException re ? re : new RuntimeException(e);
    }

    return Flux.just(
        List.of(
            UICommand.builder()
                .type(UICommandType.DownloadFile)
                .data(
                    new FileDownload(filename, mimeType, Base64.getEncoder().encodeToString(bytes)))
                .build()));
  }

  private List<?> fetchAllRows(Object instance, HttpRequest httpRequest) {
    // export the WHOLE filtered set: same search inputs as the on-screen listing, one huge page
    var base = io.mateu.uidl.interfaces.SearchRequestBuilder.build(instance, httpRequest);
    var request =
        new io.mateu.uidl.data.SearchRequest(
            base.searchText(), base.filters(), base.criteria(), new Pageable(0, 10_000, List.of()));

    if (instance instanceof Listing<?> listing) {
      var data = listing.search(request, httpRequest);
      return data != null && data.page() != null ? data.page().content() : List.of();
    }
    if (instance instanceof ReactiveListing<?> listing) {
      var data = listing.search(request, httpRequest).block();
      return data != null && data.page() != null ? data.page().content() : List.of();
    }
    return List.of();
  }

  private Class<?> rowClass(Object instance) {
    if (instance instanceof Listing<?> listing) return listing.rowClass();
    if (instance instanceof ReactiveListing<?> listing) return listing.rowClass();
    return Object.class;
  }

  private List<ExportColumn> buildExportColumns(Class<?> rowClass) {
    var columns = new ArrayList<ExportColumn>();
    for (Field field : rowClass.getDeclaredFields()) {
      if (MetaAnnotations.isPresent(field, Hidden.class)
          || MetaAnnotations.isPresent(field, HiddenInList.class)) {
        continue;
      }
      String label =
          MetaAnnotations.isPresent(field, Label.class)
              ? MetaAnnotations.find(field, Label.class).value()
              : toUpperCaseFirst(field.getName());
      columns.add(new ExportColumn(field.getName(), label));
    }
    return columns;
  }
}
