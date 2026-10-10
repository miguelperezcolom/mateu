package io.mateu.core.domain.act;

import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.*;
import io.mateu.uidl.interfaces.*;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Named
@Singleton
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

    // A ReactiveListing's rows arrive asynchronously: compose on them instead of block()ing, which
    // throws on a non-blocking thread (the WebFlux / Netty event loop) whenever the search has not
    // completed synchronously — i.e. with any real reactive repository.
    var format = ExportFormat.ofActionId(actionId);
    var exportFormat = format != null ? format : ExportFormat.csv;
    // the button is only offered while an exporter exists; a request naming a format nobody writes
    // is answered with a message (before searching anything), never a 500
    var exporter =
        ListingExporters.forFormat(exportFormat, beanProvider.getBeans(ListingExporter.class));
    if (exporter.isEmpty()) {
      return Flux.error(
          new UserFacingException(
              "Export not available", "This application has no exporter for that format."));
    }
    var search = exportSearch(instance, httpRequest);
    return fetchAllRows(instance, search, httpRequest)
        .flatMapMany(
            rows ->
                Flux.just(
                    export(
                        exporter.get(),
                        exportFormat,
                        instance,
                        search,
                        rows,
                        rowClass(instance),
                        httpRequest)));
  }

  private List<UICommand> export(
      ListingExporter exporter,
      ExportFormat format,
      Object instance,
      SearchRequest search,
      List<?> rows,
      Class<?> rowClass,
      HttpRequest httpRequest) {
    var export =
        new ListingExport(format, titleOf(instance), buildExportColumns(rowClass), rows, search);

    ExportedFile file;
    // the port declares `throws Exception` (IO/format failures) — surface it as itself
    try {
      file = exporter.export(export, httpRequest);
    } catch (Exception e) {
      throw e instanceof RuntimeException re ? re : new RuntimeException(e);
    }
    if (file == null || file.content() == null) {
      throw new IllegalStateException(
          exporter.getClass().getName() + " returned no file for " + format);
    }
    var filename = file.filename() != null ? file.filename() : format.defaultFilename();
    var mimeType = file.mediaType() != null ? file.mediaType() : format.defaultMediaType();

    return List.of(
        UICommand.builder()
            .type(UICommandType.DownloadFile)
            .data(
                new FileDownload(
                    filename, mimeType, Base64.getEncoder().encodeToString(file.content())))
            .build());
  }

  private static String titleOf(Object instance) {
    try {
      return io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle(instance);
    } catch (RuntimeException e) {
      return null;
    }
  }

  private static SearchRequest exportSearch(Object instance, HttpRequest httpRequest) {
    // export the WHOLE filtered set: same search inputs as the on-screen listing, one huge page
    var base = io.mateu.uidl.interfaces.SearchRequestBuilder.build(instance, httpRequest);
    return new SearchRequest(
        base.searchText(), base.filters(), base.criteria(), new Pageable(0, 10_000, List.of()));
  }

  private Mono<List<?>> fetchAllRows(
      Object instance, SearchRequest request, HttpRequest httpRequest) {

    if (instance instanceof Listing<?> listing) {
      return Mono.just(contentOf(listing.search(request, httpRequest)));
    }
    if (instance instanceof ReactiveListing<?> listing) {
      return listing
          .search(request, httpRequest)
          .<List<?>>map(ExportActionRunner::contentOf)
          .defaultIfEmpty(List.of());
    }
    return Mono.just(List.of());
  }

  private static List<?> contentOf(ListingData<?> data) {
    return data != null && data.page() != null ? data.page().content() : List.of();
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
