package io.mateu.remote.application;

import io.mateu.mdd.shared.data.Value;
import io.mateu.remote.domain.commands.runStep.RunStepActionCommand;
import io.mateu.remote.domain.commands.runStep.RunStepActionCommandHandler;
import io.mateu.remote.domain.commands.startJourney.StartJourneyCommand;
import io.mateu.remote.domain.commands.startJourney.StartJourneyCommandHandler;
import io.mateu.remote.domain.files.StorageService;
import io.mateu.remote.domain.queries.getItemsCount.GetItemsCountQuery;
import io.mateu.remote.domain.queries.getItemsCount.GetItemsCountQueryHandler;
import io.mateu.remote.domain.queries.getItemsRows.GetItemsRowsQuery;
import io.mateu.remote.domain.queries.getItemsRows.GetItemsRowsQueryHandler;
import io.mateu.remote.domain.queries.getJourney.GetJourneyQuery;
import io.mateu.remote.domain.queries.getJourney.GetJourneyQueryHandler;
import io.mateu.remote.domain.queries.getJourneyTypes.GetJourneyTypesQuery;
import io.mateu.remote.domain.queries.getJourneyTypes.GetJourneyTypesQueryHandler;
import io.mateu.remote.domain.queries.getListCount.GetListCountQuery;
import io.mateu.remote.domain.queries.getListCount.GetListCountQueryHandler;
import io.mateu.remote.domain.queries.getListRows.GetListRowsQuery;
import io.mateu.remote.domain.queries.getListRows.GetListRowsQueryHandler;
import io.mateu.remote.domain.queries.getStep.GetStepQuery;
import io.mateu.remote.domain.queries.getStep.GetStepQueryHandler;
import io.mateu.remote.domain.queries.getUI.GetUIQuery;
import io.mateu.remote.domain.queries.getUI.GetUIQueryHandler;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.*;
import io.mateu.util.asciiart.Painter;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.naming.AuthenticationException;


@Slf4j
@Service
public class MateuService {

    @Autowired
    JourneyStoreService store;

    @Autowired
    StartJourneyCommandHandler startJourneyCommandHandler;

    @Autowired
    RunStepActionCommandHandler runStepActionCommandHandler;

    @Autowired
    GetUIQueryHandler getUIQueryHandler;

    @Autowired
    GetJourneyQueryHandler getJourneyQueryHandler;

    @Autowired
    GetStepQueryHandler getStepQueryHandler;

    @Autowired
    GetJourneyTypesQueryHandler getJourneyTypesQueryHandler;

    @Autowired
    GetListRowsQueryHandler getListRowsQueryHandler;

    @Autowired
    GetListCountQueryHandler getListCountQueryHandler;

    @Autowired
    GetItemsCountQueryHandler getItemsCountQueryHandler;

    @Autowired
    GetItemsRowsQueryHandler getItemsRowsQueryHandler;

    public Mono<UI> getUI(String uiId) throws Exception {
        return Mono.just(getUIQueryHandler.run(GetUIQuery.builder().uiId(uiId).build()));
    }

    public Flux<JourneyType> getJourneyTypes() throws Exception {
        return Flux.fromStream(getJourneyTypesQueryHandler.run(GetJourneyTypesQuery.builder()
                .build()).stream());
    }

    public Mono<Void> createJourney(String journeyTypeId, String journeyId, JourneyCreationRq rq) throws Throwable {
        log.info("creating journey " + journeyTypeId + "/" + journeyId);
        return startJourneyCommandHandler.handle(StartJourneyCommand.builder()
                .journeyId(journeyId)
                .journeyTypeId(journeyTypeId)
                .build());
    }

    public Mono<Journey> getJourney(String journeyTypeId, String journeyId) throws Exception {
        log.info("getting journey " + journeyTypeId + "/" + journeyId);
        return getJourneyQueryHandler.run(GetJourneyQuery.builder()
                .journeyTypeId(journeyTypeId)
                .journeyId(journeyId).build());
    }

    public Mono<Step> getStep(String journeyTypeId, String journeyId, String stepId) throws Exception {
        log.info("getting step " + journeyTypeId + "/" + journeyId + "/" + stepId);
        return getStepQueryHandler.run(GetStepQuery.builder()
                .journeyTypeId(journeyTypeId)
                .journeyId(journeyId).stepId(stepId).build());
    }

    public Mono<Void> runStep(String journeyTypeId,
                        String journeyId,
                        String stepId,
                        String actionId,
                        RunActionRq rq) throws Throwable {
        log.info("running action " + journeyTypeId + "/" + journeyId + "/" + stepId + "/" + actionId);
        return runStepActionCommandHandler.handle(RunStepActionCommand.builder()
                .journeyTypeId(journeyTypeId)
                .journeyId(journeyId)
                .stepId(stepId)
                .actionId(actionId)
                .data(rq.getData())
                .build());
    }


    public Flux<Object> getListRows(String journeyTypeId,
                                    String journeyId,
                                    String stepId,
                                    String listId,
                                    int page,
                                    int page_size,
// urlencoded form of filters json serialized
                                    String filters,
// urlencoded form of orders json serialized
                                    String ordering
                                             ) throws Throwable {
        return getListRowsQueryHandler.run(GetListRowsQuery.builder()
                .journeyTypeId(journeyTypeId)
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .page(page)
                .pageSize(page_size)
                .filters(filters)
                .ordering(new OrderingDeserializer(ordering).deserialize())
                .build());
    }

    public Mono<Long> getListCount(String journeyTypeId,
                                   String journeyId,
                                   String stepId,
                                   String listId,
// urlencoded form of filters json serialized
                                   String filters
    ) throws Throwable {
        return getListCountQueryHandler.run(GetListCountQuery.builder()
                .journeyTypeId(journeyTypeId)
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .filters(filters)
                .build());
    }


    public Flux<Value> getItems(String itemProviderId,
                                   int page,
                                   int page_size,
                                   String search_text
    ) throws Throwable {
        return Flux.fromStream(getItemsRowsQueryHandler.run(GetItemsRowsQuery.builder()
                .itemsProviderId(itemProviderId)
                .page(page)
                .pageSize(page_size)
                .searchText(search_text)
                .build()).stream());
    }

    public Mono<Integer> getItemCount(String itemProviderId,
                                      String search_text
    ) throws Throwable {
        return Mono.just(getItemsCountQueryHandler.run(GetItemsCountQuery.builder()
                .itemsProviderId(itemProviderId)
                .searchText(search_text)
                .build()));
    }

    @Autowired
    StorageService storageService;

    public ResponseEntity<Resource> serveFile(String fileId,
                                              String filename)
            throws AuthenticationException {

        Resource file = storageService.loadAsResource(fileId, filename);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + file.getFilename() + "\"").body(file);
    }

    public String getFileUrl(String fileId) throws AuthenticationException {
        return storageService.getUrl(fileId);
    }

    public String handleFileUpload(String fileId,
                                   MultipartFile file)
            throws AuthenticationException {
        storageService.store(fileId, file);
        return "redirect:/";
    }

}
