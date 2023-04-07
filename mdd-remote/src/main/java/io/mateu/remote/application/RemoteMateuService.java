package io.mateu.remote.application;

import io.mateu.mdd.shared.data.Value;
import io.mateu.remote.domain.commands.RunStepActionCommand;
import io.mateu.remote.domain.commands.StartJourneyCommand;
import io.mateu.remote.domain.files.StorageService;
import io.mateu.remote.domain.queries.*;
import io.mateu.remote.dtos.*;
import io.mateu.util.asciiart.Painter;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.naming.AuthenticationException;


@Slf4j
@Service
public class RemoteMateuService {


    public Mono<UI> getUI(String uiId) throws Exception {
        return Mono.just(GetUIQuery.builder().uiId(uiId).build().run());
    }

    public Flux<JourneyType> getJourneyTypes() throws Exception {
        return Flux.fromStream(GetJourneyTypesQuery.builder().build().run().stream());
    }

    public void createJourney(String journeyId, JourneyCreationRq rq) throws Throwable {
        StartJourneyCommand.builder()
                .journeyId(journeyId)
                .journeyTypeId(rq.getJourneyTypeId())
                .build().run();
    }

    public Mono<Journey> getJourney(String journeyId) throws Exception {
        return Mono.just(GetJourneyQuery.builder().journeyId(journeyId).build().run());
    }

    public Mono<Step> getStep(String journeyId, String stepId) throws Exception {
        Step step = GetStepQuery.builder().journeyId(journeyId).stepId(stepId).build().run();
        //log.info(Helper.toJson(step));
        return Mono.just(step);
    }

    public void runStep(String journeyId,
                        String stepId,
                        String actionId,
                        RunActionRq rq) throws Throwable {
        RunStepActionCommand.builder()
                .journeyId(journeyId)
                .stepId(stepId)
                .actionId(actionId)
                .data(rq.getData())
                .build().run();
    }


    public Flux<Object> getListRows(String journeyId,
                                    String stepId,
                                    String listId,
                                    int page,
                                    int page_size,
// urlencoded form of filters json serialized
                                    String filters,
// urlencoded form of orders json serialized
                                    String ordering
                                             ) throws Throwable {
        return Flux.fromStream(GetListRowsQuery.builder()
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .page(page)
                .pageSize(page_size)
                .filters(new FiltersDeserializer(journeyId, stepId, listId, filters).deserialize())
                .ordering(new OrderingDeserializer(ordering).deserialize())
                .build().run().stream());
    }

    public Mono<Long> getListCount(String journeyId,
                                   String stepId,
                                   String listId,
// urlencoded form of filters json serialized
                                   String filters
    ) throws Throwable {
        return Mono.just(GetListCountQuery.builder()
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .filters(new FiltersDeserializer(journeyId, stepId, listId, filters).deserialize())
                .build().run());
    }


    public Flux<Value> getItems(String itemProviderId,
                                   int page,
                                   int page_size,
                                   String search_text
    ) throws Throwable {
        return Flux.fromStream(GetItemsRowsQuery.builder()
                .itemsProviderId(itemProviderId)
                .page(page)
                .pageSize(page_size)
                .searchText(search_text)
                .build().run().stream());
    }

    public Mono<Integer> getItemCount(String itemProviderId,
                                      String search_text
    ) throws Throwable {
        return Mono.just(GetItemsCountQuery.builder()
                .itemsProviderId(itemProviderId)
                .searchText(search_text)
                .build().run());
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


    @PostConstruct
    public void init() {
        Painter.paint("Hello");
        Painter.paint("MATEU");
    }

}
