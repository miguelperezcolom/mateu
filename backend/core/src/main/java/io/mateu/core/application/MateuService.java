package io.mateu.core.application;

import com.opencsv.CSVWriter;
import io.mateu.core.application.usecases.*;
import io.mateu.core.application.usecases.fetchlist.FetchListUseCase;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.infra.csv.ByteArrayInOutStream;
import io.mateu.dtos.*;
import io.mateu.dtos.UIIncrement;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.Charset;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;
import javax.naming.AuthenticationException;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Slf4j
@Service
public class MateuService {

  private final GetUiUseCase getUiUseCase;

  private final CreateJourneyUseCase createJourneyUseCase;

  private final RunStepUseCase runStepUseCase;

  private final FetchListUseCase fetchListUseCase;

  private final FetchItemsUseCase fetchItemsUseCase;

  private final GetFileUrlUseCase getFileUrlUseCase;

  private final HandleFileUploadUseCase handleFileUploadUseCase;

  private final ServeFileUseCase serveFileUseCase;

  @Autowired Serializer serializer;

  public MateuService(
      GetUiUseCase getUiUseCase,
      CreateJourneyUseCase createJourneyUseCase,
      RunStepUseCase runStepUseCase,
      FetchListUseCase fetchListUseCase,
      FetchItemsUseCase fetchItemsUseCase,
      GetFileUrlUseCase getFileUrlUseCase,
      HandleFileUploadUseCase handleFileUploadUseCase,
      ServeFileUseCase serveFileUseCase) {
    this.getUiUseCase = getUiUseCase;
    this.createJourneyUseCase = createJourneyUseCase;
    this.runStepUseCase = runStepUseCase;
    this.fetchListUseCase = fetchListUseCase;
    this.fetchItemsUseCase = fetchItemsUseCase;
    this.getFileUrlUseCase = getFileUrlUseCase;
    this.handleFileUploadUseCase = handleFileUploadUseCase;
    this.serveFileUseCase = serveFileUseCase;
  }

  public Mono<UI> getUI(String uiId, ServerHttpRequest serverHttpRequest) throws Exception {
    return getUiUseCase.getUI(uiId, serverHttpRequest);
  }

  public Mono<UIIncrement> createJourney(
      String uiId,
      String journeyTypeId,
      String journeyId,
      JourneyCreationRq rq,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    return createJourneyUseCase.createJourney(
        uiId, journeyTypeId, journeyId, rq, serverHttpRequest);
  }

  public Mono<UIIncrement> runStepAndReturn(
      String uiId,
      String journeyTypeId,
      String journeyId,
      String stepId,
      String componentId,
      String actionId,
      RunActionRq rq,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    return runStepUseCase.runStep(
        uiId, journeyTypeId, journeyId, stepId, componentId, actionId, rq, serverHttpRequest);
  }

  public Mono<Page> getListRows(
      String componentType,
      int page,
      int page_size,
      Map<String, Object> data,
      Map<String, Object> filters,
      // urlencoded form of orders json serialized
      String ordering,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    return fetchListUseCase
        .fetchPage(componentType, data, page, page_size, filters, ordering, serverHttpRequest)
        .subscribeOn(Schedulers.boundedElastic());
  }

  public Mono<Items> getItems(String itemProviderId, int page, int page_size, String search_text)
      throws Throwable {
    return fetchItemsUseCase.getItems(itemProviderId, page, page_size, search_text);
  }

  public Mono<ResponseEntity<Resource>> serveFile(String fileId, String filename) {
    return Mono.fromCallable(() -> serveFileUseCase.serveFile(fileId, filename))
        .subscribeOn(Schedulers.boundedElastic());
  }

  public Mono<String> getFileUrl(String fileId, String fileName) {
    return Mono.fromCallable(() -> getFileUrlUseCase.getFileUrl(fileId, fileName))
        .subscribeOn(Schedulers.boundedElastic());
  }

  public Mono<Void> handleFileUpload(String fileId, Mono<FilePart> file)
      throws AuthenticationException, ExecutionException, InterruptedException, TimeoutException {
    return handleFileUploadUseCase
        .handleFileUpload(fileId, file)
        .subscribeOn(Schedulers.boundedElastic());
  }

  public Mono<ByteArrayInputStream> generateCsv(
      String componentType,
      // urlencoded form of filters json serialized
      Map<String, Object> data,
      Map<String, Object> filters,
      // urlencoded form of orders json serialized
      String ordering,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    return getListRows(componentType, 0, 500, data, filters, ordering, serverHttpRequest)
        .map(Page::content)
        .map(
            list -> {
              try {
                ByteArrayInOutStream stream = new ByteArrayInOutStream();
                OutputStreamWriter streamWriter =
                    new OutputStreamWriter(stream, Charset.defaultCharset());
                CSVWriter writer = new CSVWriter(streamWriter);

                writer.writeAll(
                    list.stream()
                        .map(this::toMap)
                        .map(Map::values)
                        .map(a -> a.stream().map(o -> "" + o).collect(Collectors.toList()))
                        .map(l -> l.toArray(new String[0]))
                        .toList());
                streamWriter.flush();
                return stream.getInputStream();
              } catch (IOException e) {
                throw new RuntimeException(e);
              }
            })
        .subscribeOn(Schedulers.boundedElastic());
  }

  private Map<String, Object> toMap(Object o) {
    if (o instanceof Map) {
      return (Map<String, Object>) o;
    } else {
      try {
        return serializer.toMap(o);
      } catch (Exception e) {
        e.printStackTrace();
        return Map.of();
      }
    }
  }

  public Mono<ByteArrayInputStream> generateExcel(
      String componentType,
      // urlencoded form of filters json serialized
      Map<String, Object> data,
      Map<String, Object> filters,
      // urlencoded form of orders json serialized
      String ordering,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    return getListRows(componentType, 0, 500, data, filters, ordering, serverHttpRequest)
        .map(Page::content)
        .map(
            list ->
                list.stream()
                    .map(this::toMap)
                    .map(Map::values)
                    .map(a -> a.stream().map(o -> "" + o).collect(Collectors.toList()))
                    .map(l -> l.toArray(new String[0]))
                    .toList())
        .map(
            list -> {
              try {

                Workbook workbook = new XSSFWorkbook();

                Sheet sheet = workbook.createSheet("All");

                ByteArrayInOutStream stream = new ByteArrayInOutStream();
                OutputStreamWriter streamWriter =
                    new OutputStreamWriter(stream, Charset.defaultCharset());

                CellStyle style = workbook.createCellStyle();
                style.setWrapText(true);

                for (int i = 0; i < list.size(); i++) {
                  Row row = sheet.createRow(i + 1);
                  String[] rowData = list.get(i);
                  if (rowData != null) {
                    for (int col = 0; col < rowData.length; col++) {
                      Cell cell = row.createCell(col);
                      cell.setCellValue(rowData[col] != null ? "" + rowData[col] : "");
                      cell.setCellStyle(style);
                    }
                  }
                }

                workbook.write(stream);
                workbook.close();

                streamWriter.flush();
                return stream.getInputStream();
              } catch (IOException e) {
                throw new RuntimeException(e);
              }
            })
        .subscribeOn(Schedulers.boundedElastic());
  }
}
