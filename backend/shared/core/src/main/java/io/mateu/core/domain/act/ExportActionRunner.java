package io.mateu.core.domain.act;

import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.domain.ports.BeanProvider;
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
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

@Named
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class ExportActionRunner implements ActionRunner {

  private final BeanProvider beanProvider;

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return instance instanceof ListingBackend<?, ?>
        && actionId != null
        && actionId.startsWith("export-");
  }

  @Override
  public int priority() {
    return 50;
  }

  @SneakyThrows
  @Override
  @SuppressWarnings("unchecked")
  public Flux<?> run(Object instance, RunActionCommand command) {
    var listing = (ListingBackend<Object, Object>) instance;
    var actionId = command.actionId();
    var httpRequest = command.httpRequest();

    var rows = fetchAllRows(listing, httpRequest);
    var columns = buildExportColumns(listing.rowClass());

    byte[] bytes;
    String filename;
    String mimeType;

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

    return Flux.just(
        List.of(
            UICommand.builder()
                .type(UICommandType.DownloadFile)
                .data(
                    new FileDownload(filename, mimeType, Base64.getEncoder().encodeToString(bytes)))
                .build()));
  }

  private List<?> fetchAllRows(ListingBackend<Object, Object> listing, HttpRequest httpRequest) {
    var searchText = httpRequest.getString("searchText");
    var filters =
        MateuInstanceFactory.newInstance(
            listing.filtersClass(), httpRequest.runActionRq().componentState(), httpRequest);
    var data =
        listing.search(
            searchText != null ? searchText : "",
            filters,
            new Pageable(0, 10_000, List.of()),
            httpRequest);
    return data != null && data.page() != null ? data.page().content() : List.of();
  }

  private List<ExportColumn> buildExportColumns(Class<?> rowClass) {
    var columns = new ArrayList<ExportColumn>();
    for (Field field : rowClass.getDeclaredFields()) {
      if (field.isAnnotationPresent(Hidden.class)
          || field.isAnnotationPresent(HiddenInList.class)) {
        continue;
      }
      String label =
          field.isAnnotationPresent(Label.class)
              ? field.getAnnotation(Label.class).value()
              : toUpperCaseFirst(field.getName());
      columns.add(new ExportColumn(field.getName(), label));
    }
    return columns;
  }
}
