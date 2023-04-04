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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.naming.AuthenticationException;
import java.util.List;


@CrossOrigin
@RestController
@RequestMapping("mateu/v1")
@Slf4j
public class RemoteMateuController {


    @GetMapping(value = "uis/{uiId}")
    public Mono<UI> getUI(@PathVariable String uiId) throws Exception {
        return Mono.just(GetUIQuery.builder().uiId(uiId).build().run());
    }

    @GetMapping("journey-types")
    public Flux<JourneyType> getJourneyTypes() throws Exception {
        return Flux.fromStream(GetJourneyTypesQuery.builder().build().run().stream());
    }

    @PostMapping("journeys/{journeyId}")
    public void createJourney(@PathVariable String journeyId, @RequestBody JourneyCreationRq rq) throws Throwable {
        StartJourneyCommand.builder()
                .journeyId(journeyId)
                .journeyTypeId(rq.getJourneyTypeId())
                .build().run();
    }

    @GetMapping("journeys/{journeyId}")
    public Mono<Journey> getJourney(@PathVariable String journeyId) throws Exception {
        return Mono.just(GetJourneyQuery.builder().journeyId(journeyId).build().run());
    }

    @GetMapping("journeys/{journeyId}/steps/{stepId}")
    public Mono<Step> getStep(@PathVariable String journeyId, @PathVariable String stepId) throws Exception {
        Step step = GetStepQuery.builder().journeyId(journeyId).stepId(stepId).build().run();
        //log.info(Helper.toJson(step));
        return Mono.just(step);
    }

    @PostMapping("journeys/{journeyId}/steps/{stepId}/{actionId}")
    public void runStep(@PathVariable String journeyId,
                        @PathVariable String stepId,
                        @PathVariable String actionId,
                        @RequestBody RunActionRq rq) throws Throwable {
        RunStepActionCommand.builder()
                .journeyId(journeyId)
                .stepId(stepId)
                .actionId(actionId)
                .data(rq.getData())
                .build().run();
    }


    @GetMapping("journeys/{journeyId}/steps/{stepId}/lists/{listId}/rows")
    public Flux<Object> getListRows(@PathVariable String journeyId,
                                                 @PathVariable String stepId,
                                                 @PathVariable String listId,
                                                 @RequestParam int page,
                                                 @RequestParam int page_size,
// urlencoded form of filters json serialized
                                                 @RequestParam String filters,
// urlencoded form of orders json serialized
                                                 @RequestParam String ordering
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

    @GetMapping("journeys/{journeyId}/steps/{stepId}/lists/{listId}/count")
    public Mono<Long> getListCount(@PathVariable String journeyId,
                             @PathVariable String stepId,
                             @PathVariable String listId,
// urlencoded form of filters json serialized
                             @RequestParam String filters
    ) throws Throwable {
        return Mono.just(GetListCountQuery.builder()
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .filters(new FiltersDeserializer(journeyId, stepId, listId, filters).deserialize())
                .build().run());
    }


    @GetMapping("itemproviders/{itemProviderId}/items")
    public Flux<Value> getListRows(@PathVariable String itemProviderId,
                                   @RequestParam int page,
                                   @RequestParam int page_size,
                                   @RequestParam String search_text
    ) throws Throwable {
        return Flux.fromStream(GetItemsRowsQuery.builder()
                .itemsProviderId(itemProviderId)
                .page(page)
                .pageSize(page_size)
                .searchText(search_text)
                .build().run().stream());
    }

    @GetMapping("itemproviders/{itemProviderId}/count")
    public Mono<Integer> getListCount(@PathVariable String itemProviderId,
                             @RequestParam String search_text
    ) throws Throwable {
        return Mono.just(GetItemsCountQuery.builder()
                .itemsProviderId(itemProviderId)
                .searchText(search_text)
                .build().run());
    }

    @Autowired
    StorageService storageService;

    @GetMapping("cdn/{fileId}/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String fileId, @PathVariable String filename)
            throws AuthenticationException {

        Resource file = storageService.loadAsResource(fileId, filename);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + file.getFilename() + "\"").body(file);
    }

    @GetMapping(value = "files/{fileId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String getFileUrl(@PathVariable String fileId) throws AuthenticationException {
        return storageService.getUrl(fileId);
    }

    @PostMapping("files/{fileId}")
    public String handleFileUpload(@PathVariable String fileId, @RequestParam("file") MultipartFile file)
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
