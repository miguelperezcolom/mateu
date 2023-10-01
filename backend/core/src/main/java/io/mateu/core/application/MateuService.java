package io.mateu.core.application;

import com.opencsv.CSVWriter;
import io.mateu.core.application.csv.ByteArrayInOutStream;
import io.mateu.core.domain.commands.runStep.RunStepActionCommand;
import io.mateu.core.domain.commands.runStep.RunStepActionCommandHandler;
import io.mateu.core.domain.commands.startJourney.StartJourneyCommand;
import io.mateu.core.domain.commands.startJourney.StartJourneyCommandHandler;
import io.mateu.core.domain.queries.getItemsCount.GetItemsCountQuery;
import io.mateu.core.domain.queries.getItemsCount.GetItemsCountQueryHandler;
import io.mateu.core.domain.queries.getItemsRows.GetItemsRowsQuery;
import io.mateu.core.domain.queries.getItemsRows.GetItemsRowsQueryHandler;
import io.mateu.core.domain.queries.getJourney.GetJourneyQuery;
import io.mateu.core.domain.queries.getJourney.GetJourneyQueryHandler;
import io.mateu.core.domain.queries.getJourneyTypes.GetJourneyTypesQuery;
import io.mateu.core.domain.queries.getJourneyTypes.GetJourneyTypesQueryHandler;
import io.mateu.core.domain.queries.getListCount.GetListCountQuery;
import io.mateu.core.domain.queries.getListCount.GetListCountQueryHandler;
import io.mateu.core.domain.queries.getListRows.GetListRowsQuery;
import io.mateu.core.domain.queries.getListRows.GetListRowsQueryHandler;
import io.mateu.core.domain.queries.getStep.GetStepQuery;
import io.mateu.core.domain.queries.getStep.GetStepQueryHandler;
import io.mateu.core.domain.queries.getUI.GetUIQuery;
import io.mateu.core.domain.queries.getUI.GetUIQueryHandler;
import io.mateu.core.domain.store.JourneyStoreService;
import io.mateu.mdd.shared.data.Value;
import io.mateu.remote.dtos.*;
import io.mateu.util.Serializer;
import java.io.*;
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
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Slf4j
@Service
public class MateuService {

  @Autowired JourneyStoreService store;

  @Autowired StartJourneyCommandHandler startJourneyCommandHandler;

  @Autowired RunStepActionCommandHandler runStepActionCommandHandler;

  @Autowired GetUIQueryHandler getUIQueryHandler;

  @Autowired GetJourneyQueryHandler getJourneyQueryHandler;

  @Autowired GetStepQueryHandler getStepQueryHandler;

  @Autowired GetJourneyTypesQueryHandler getJourneyTypesQueryHandler;

  @Autowired GetListRowsQueryHandler getListRowsQueryHandler;

  @Autowired GetListCountQueryHandler getListCountQueryHandler;

  @Autowired GetItemsCountQueryHandler getItemsCountQueryHandler;

  @Autowired GetItemsRowsQueryHandler getItemsRowsQueryHandler;

  @Autowired UploadService uploadService;

  public Mono<UI> getUI(String uiId, ServerHttpRequest serverHttpRequest) throws Exception {
    return Mono.just(
        getUIQueryHandler.run(GetUIQuery.builder().uiId(uiId).build(), serverHttpRequest));
  }

  public Flux<JourneyType> getJourneyTypes(ServerHttpRequest serverHttpRequest) throws Exception {
    return Flux.fromStream(
        getJourneyTypesQueryHandler
            .run(GetJourneyTypesQuery.builder().build(), serverHttpRequest)
            .stream());
  }

  public Mono<Void> createJourney(
      String journeyTypeId,
      String journeyId,
      JourneyCreationRq rq,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    log.info("creating journey " + journeyTypeId + "/" + journeyId);
    return startJourneyCommandHandler.handle(
        StartJourneyCommand.builder()
            .journeyId(journeyId)
            .journeyTypeId(journeyTypeId)
            .serverHttpRequest(serverHttpRequest)
            .build());
  }

  public Mono<Journey> getJourney(
      String journeyTypeId, String journeyId, ServerHttpRequest serverHttpRequest)
      throws Exception {
    log.info("getting journey " + journeyTypeId + "/" + journeyId);
    return getJourneyQueryHandler.run(
        GetJourneyQuery.builder()
            .journeyTypeId(journeyTypeId)
            .journeyId(journeyId)
            .serverHttpRequest(serverHttpRequest)
            .build());
  }

  public Mono<Step> getStep(
      String journeyTypeId, String journeyId, String stepId, ServerHttpRequest serverHttpRequest)
      throws Exception {
    log.info("getting step " + journeyTypeId + "/" + journeyId + "/" + stepId);
    return getStepQueryHandler.run(
        GetStepQuery.builder()
            .journeyTypeId(journeyTypeId)
            .journeyId(journeyId)
            .stepId(stepId)
            .serverHttpRequest(serverHttpRequest)
            .build());
  }

  public Mono<Void> runStep(
      String journeyTypeId,
      String journeyId,
      String stepId,
      String actionId,
      RunActionRq rq,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    log.info("running action " + journeyTypeId + "/" + journeyId + "/" + stepId + "/" + actionId);
    return runStepActionCommandHandler.handle(
        RunStepActionCommand.builder()
            .journeyTypeId(journeyTypeId)
            .journeyId(journeyId)
            .stepId(stepId)
            .actionId(actionId)
            .data(rq.getData())
            .serverHttpRequest(serverHttpRequest)
            .build());
  }

  public Flux<Object> getListRows(
      String journeyTypeId,
      String journeyId,
      String stepId,
      String listId,
      int page,
      int page_size,
      // urlencoded form of filters json serialized
      Map<String, Object> filters,
      // urlencoded form of orders json serialized
      String ordering,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    return getListRowsQueryHandler.run(
        GetListRowsQuery.builder()
            .journeyTypeId(journeyTypeId)
            .journeyId(journeyId)
            .stepId(stepId)
            .listId(listId)
            .page(page)
            .pageSize(page_size)
            .filters(filters)
            .ordering(new OrderingDeserializer(ordering).deserialize())
            .serverHttpRequest(serverHttpRequest)
            .build());
  }

  public Mono<Long> getListCount(
      String journeyTypeId,
      String journeyId,
      String stepId,
      String listId,
      // urlencoded form of filters json serialized
      Map<String, Object> filters,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    return getListCountQueryHandler.run(
        GetListCountQuery.builder()
            .journeyTypeId(journeyTypeId)
            .journeyId(journeyId)
            .stepId(stepId)
            .listId(listId)
            .filters(filters)
            .serverHttpRequest(serverHttpRequest)
            .build());
  }

  public Flux<Value> getItems(String itemProviderId, int page, int page_size, String search_text)
      throws Throwable {
    return Flux.fromStream(
        getItemsRowsQueryHandler
            .run(
                GetItemsRowsQuery.builder()
                    .itemsProviderId(itemProviderId)
                    .page(page)
                    .pageSize(page_size)
                    .searchText(search_text)
                    .build())
            .stream());
  }

  public Mono<Integer> getItemCount(String itemProviderId, String search_text) throws Throwable {
    return Mono.just(
        getItemsCountQueryHandler.run(
            GetItemsCountQuery.builder()
                .itemsProviderId(itemProviderId)
                .searchText(search_text)
                .build()));
  }

  public ResponseEntity<Resource> serveFile(String fileId, String filename)
      throws AuthenticationException {
    return uploadService.serveFile(fileId, filename);
  }

  public String getFileUrl(String fileId, String fileName) throws AuthenticationException {
    return uploadService.getFileUrl(fileId, fileName);
  }

  public Mono<Void> handleFileUpload(String fileId, Mono<FilePart> file)
      throws AuthenticationException, ExecutionException, InterruptedException, TimeoutException {
    return uploadService.handleFileUpload(fileId, file);
  }

  public Mono<ByteArrayInputStream> generateCsv(
      String journeyTypeId,
      String journeyId,
      String stepId,
      String listId,
      // urlencoded form of filters json serialized
      Map<String, Object> filters,
      // urlencoded form of orders json serialized
      String ordering,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    return getListRows(
            journeyTypeId, journeyId, stepId, listId, 0, 500, filters, ordering, serverHttpRequest)
        .map(o -> toMap(o))
        .map(m -> m.values())
        .map(a -> a.stream().map(o -> "" + o).collect(Collectors.toList()))
        .map(l -> l.toArray(new String[0]))
        .collectList()
        .map(
            list -> {
              try {
                ByteArrayInOutStream stream = new ByteArrayInOutStream();
                OutputStreamWriter streamWriter = new OutputStreamWriter(stream);
                CSVWriter writer = new CSVWriter(streamWriter);

                writer.writeAll(list);
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
        return Serializer.toMap(o);
      } catch (Exception e) {
        e.printStackTrace();
        return Map.of();
      }
    }
  }

  public Mono<ByteArrayInputStream> generateExcel(
      String journeyTypeId,
      String journeyId,
      String stepId,
      String listId,
      // urlencoded form of filters json serialized
      Map<String, Object> filters,
      // urlencoded form of orders json serialized
      String ordering,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    return getListRows(
            journeyTypeId, journeyId, stepId, listId, 0, 500, filters, ordering, serverHttpRequest)
        .map(o -> toMap(o))
        .map(m -> m.values())
        .map(a -> a.stream().map(o -> "" + o).collect(Collectors.toList()))
        .map(l -> l.toArray(new String[0]))
        .collectList()
        .map(
            list -> {
              try {

                Workbook workbook = new XSSFWorkbook();

                Sheet sheet = workbook.createSheet("All");

                ByteArrayInOutStream stream = new ByteArrayInOutStream();
                OutputStreamWriter streamWriter = new OutputStreamWriter(stream);

                CellStyle style = workbook.createCellStyle();
                style.setWrapText(true);

                for (int i = 0; i < list.size(); i++) {
                  Row row = sheet.createRow(i + 1);
                  String[] data = list.get(i);
                  if (data != null) {
                    for (int col = 0; col < data.length; col++) {
                      Cell cell = row.createCell(col);
                      cell.setCellValue(data[col] != null ? "" + data[col] : "");
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
