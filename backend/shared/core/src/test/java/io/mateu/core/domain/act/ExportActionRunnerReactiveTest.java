package io.mateu.core.domain.act;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.infra.DefaultCsvExporter;
import io.mateu.core.infra.HeadlessHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.FileDownload;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingExporter;
import io.mateu.uidl.interfaces.ReactiveListing;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

/**
 * Exporting a {@link ReactiveListing} must not {@code block()}: on a non-blocking thread (the
 * WebFlux event loop) Reactor refuses to block on a search that has not completed yet, which is
 * every search backed by a real reactive repository.
 */
class ExportActionRunnerReactiveTest {

  public static class Row {
    public String name;

    public Row(String name) {
      this.name = name;
    }
  }

  public static class AsyncListing implements ReactiveListing<Row> {
    @Override
    public Mono<ListingData<Row>> search(SearchRequest request, HttpRequest httpRequest) {
      // completes on another thread, like an R2DBC / WebClient-backed search
      return Mono.fromCallable(() -> ListingData.of(new Row("Ada")))
          .subscribeOn(Schedulers.boundedElastic());
    }

    @Override
    public Class<Row> rowClass() {
      return Row.class;
    }
  }

  private static BeanProvider csvExporterOnly() {
    return new BeanProvider() {
      @Override
      public <T> T getBean(Class<T> clazz) {
        return null;
      }

      @Override
      @SuppressWarnings("unchecked")
      public <T> Collection<T> getBeans(Class<T> clazz) {
        return clazz == ListingExporter.class
            ? (Collection<T>) List.of(new DefaultCsvExporter())
            : List.of();
      }
    };
  }

  @Test
  void exportsAReactiveListingFromANonBlockingThread() {
    var http = new HeadlessHttpRequest(RunActionRqDto.builder().componentState(Map.of()).build());
    var command =
        new RunActionCommand(
            "", "", "", "", "export-csv", Map.of(), Map.of(), null, http, null, null);
    var runner = new ExportActionRunner(csvExporterOnly());

    var result =
        Mono.defer(() -> runner.run(new AsyncListing(), command).next())
            .subscribeOn(Schedulers.parallel()) // a NonBlocking thread, as the Netty loop is
            .block();

    assertThat(result).isInstanceOf(List.class);
    var download = (FileDownload) ((UICommand) ((List<?>) result).get(0)).data();
    assertThat(download.filename()).isEqualTo("export.csv");
    var csv =
        new String(Base64.getDecoder().decode(download.base64Content()), StandardCharsets.UTF_8);
    assertThat(csv).contains("Ada");
  }
}
