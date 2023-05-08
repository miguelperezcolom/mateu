package ${pkgName};

import io.mateu.mdd.shared.data.Value;
import io.mateu.remote.application.MateuService;
import io.mateu.remote.dtos.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.core.io.InputStreamResource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.naming.AuthenticationException;


@CrossOrigin
@RestController
@RequestMapping("${path}/mateu/v1")
@Slf4j
public class ${simpleClassName}MateuController {

    @Autowired
    private MateuService service;


    @GetMapping(value = "uis/{uiId}")
    public Mono<UI> getUI(@PathVariable String uiId) throws Exception {
        return service.getUI(uiId);
    }

    @GetMapping("journey-types")
    public Flux<JourneyType> getJourneyTypes() throws Exception {
        return service.getJourneyTypes();
    }

    @PostMapping("journeys/{journeyTypeId}/{journeyId}")
    public Mono<Void> createJourney(@PathVariable String journeyTypeId, @PathVariable String journeyId, @RequestBody JourneyCreationRq rq) throws Throwable {
        return service.createJourney(journeyTypeId, journeyId, rq);
    }

    @GetMapping("journeys/{journeyTypeId}/{journeyId}")
    public Mono<Journey> getJourney(@PathVariable String journeyTypeId, @PathVariable String journeyId) throws Exception {
        return service.getJourney(journeyTypeId, journeyId);
    }

    @GetMapping("journeys/{journeyTypeId}/{journeyId}/steps/{stepId}")
    public Mono<Step> getStep(@PathVariable String journeyTypeId, @PathVariable String journeyId, @PathVariable String stepId) throws Exception {
        return service.getStep(journeyTypeId, journeyId, stepId);
    }

    @PostMapping("journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/{actionId}")
    public Mono<Void> runStep(@PathVariable String journeyTypeId,
                        @PathVariable String journeyId,
                        @PathVariable String stepId,
                        @PathVariable String actionId,
                        @RequestBody RunActionRq rq) throws Throwable {
        return service.runStep(journeyTypeId, journeyId, stepId, actionId, rq);
    }


    @GetMapping("journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/lists/{listId}/rows")
    public Flux<Object> getListRows(@PathVariable String journeyTypeId,
                                    @PathVariable String journeyId,
                                    @PathVariable String stepId,
                                    @PathVariable String listId,
                                    @RequestParam int page,
                                    @RequestParam int page_size,
                                    // urlencoded form of filters json serialized
                                    @RequestParam String filters,
                                    // urlencoded form of orders json serialized
                                    @RequestParam String ordering
                                    ) throws Throwable {
        return service.getListRows(journeyTypeId, journeyId, stepId, listId, page, page_size, filters, ordering);
    }

    @GetMapping("journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/lists/{listId}/count")
    public Mono<Long> getListCount(@PathVariable String journeyTypeId,
                                    @PathVariable String journeyId,
                                    @PathVariable String stepId,
                                    @PathVariable String listId,
                                    // urlencoded form of filters json serialized
                                    @RequestParam String filters
                                    ) throws Throwable {
        return service.getListCount(journeyTypeId, journeyId, stepId, listId, filters);
    }


    @GetMapping("itemproviders/{itemProviderId}/items")
    public Flux<Value> getItems(@PathVariable String itemProviderId,
                                @RequestParam int page,
                                @RequestParam int page_size,
                                @RequestParam String search_text
                                ) throws Throwable {
        return service.getItems(itemProviderId, page, page_size, search_text);
    }

    @GetMapping("itemproviders/{itemProviderId}/count")
    public Mono<Integer> getItemCount(@PathVariable String itemProviderId,
                                        @RequestParam String search_text
                                        ) throws Throwable {
        return service.getItemCount(itemProviderId, search_text);
    }

    @GetMapping("cdn/{fileId}/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String fileId, @PathVariable String filename)
        throws AuthenticationException {
        return service.serveFile(fileId, filename);
    }

    @GetMapping(value = "files/{fileId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public Mono<String> getFileUrl(@PathVariable String fileId) throws AuthenticationException {
        return Mono.just(service.getFileUrl(fileId));
    }

    @PostMapping("files/{fileId}")
    public Mono<Void> handleFileUpload(@PathVariable String fileId, @RequestPart("file") Mono<FilePart> file)
        throws Exception {
        return service.handleFileUpload(fileId, file);
    }

    @GetMapping("journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/lists/{listId}/csv")
    public ResponseEntity<Mono<Resource>> downloadCsv(@PathVariable String journeyTypeId,
                    @PathVariable String journeyId,
                    @PathVariable String stepId,
                    @PathVariable String listId,
                    // urlencoded form of filters json serialized
                    @RequestParam String filters,
                    // urlencoded form of orders json serialized
                    @RequestParam String ordering) throws Throwable {
        String fileName = String.format("%s.csv", RandomStringUtils.randomAlphabetic(10));
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,  "attachment; filename=" + fileName)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
            .body(service.generateCsv(journeyTypeId, journeyId, stepId, listId, filters, ordering)
            .flatMap(x -> {
                Resource resource = new InputStreamResource(x);
                return Mono.just(resource);
            }));
    }

    @GetMapping("journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/lists/{listId}/xls")
    public ResponseEntity<Mono<Resource>> downloadExcel(@PathVariable String journeyTypeId,
                    @PathVariable String journeyId,
                    @PathVariable String stepId,
                    @PathVariable String listId,
                    // urlencoded form of filters json serialized
                    @RequestParam String filters,
                    // urlencoded form of orders json serialized
                    @RequestParam String ordering) throws Throwable {
        String fileName = String.format("%s.xls", RandomStringUtils.randomAlphabetic(10));
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,  "attachment; filename=" + fileName)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
            .body(service.generateExcel(journeyTypeId, journeyId, stepId, listId, filters, ordering)
            .flatMap(x -> {
                Resource resource = new InputStreamResource(x);
                return Mono.just(resource);
            }));
    }

}
