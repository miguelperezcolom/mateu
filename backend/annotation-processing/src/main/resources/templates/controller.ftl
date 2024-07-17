package ${pkgName};

import io.mateu.core.domain.uidefinition.shared.data.Value;
import io.mateu.core.application.MateuService;
import io.mateu.dtos.*;
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
import org.springframework.http.server.reactive.ServerHttpRequest;

import javax.naming.AuthenticationException;
import java.util.Map;


@CrossOrigin
@RestController
@RequestMapping("${path}/mateu")
@Slf4j
public class ${simpleClassName}MateuController {

    @Autowired
    private MateuService service;


    @GetMapping(value = "v1/uis/{uiId}")
    public Mono<UI> getUI(@PathVariable String uiId,
    ServerHttpRequest serverHttpRequest) throws Exception {
        return service.getUI(uiId, serverHttpRequest);
    }

    @PostMapping("v1/journeys/{journeyTypeId}/{journeyId}")
    public Mono<Void> createJourney(@PathVariable String journeyTypeId, @PathVariable String journeyId,
            @RequestBody JourneyCreationRq rq,
            ServerHttpRequest serverHttpRequest) throws Throwable {
        return service.createJourney(journeyTypeId, journeyId, rq, serverHttpRequest);
    }

    @GetMapping("v1/journeys/{journeyTypeId}/{journeyId}")
    public Mono<Journey> getJourney(@PathVariable String journeyTypeId, @PathVariable String journeyId,
                ServerHttpRequest serverHttpRequest) throws Exception {
        return service.getJourney(journeyTypeId, journeyId, serverHttpRequest);
    }

    @GetMapping("v1/journeys/{journeyTypeId}/{journeyId}/steps/{stepId}")
    public Mono<Step> getStep(@PathVariable String journeyTypeId, @PathVariable String journeyId
                    , @PathVariable String stepId,
                    ServerHttpRequest serverHttpRequest) throws Exception {
        return service.getStep(journeyTypeId, journeyId, stepId, serverHttpRequest);
    }

    @PostMapping("v1/journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/{actionId}")
    public Mono<Void> runStep(@PathVariable String journeyTypeId,
                        @PathVariable String journeyId,
                        @PathVariable String stepId,
                        @PathVariable String actionId,
                        @RequestBody RunActionRq rq,
                        ServerHttpRequest serverHttpRequest) throws Throwable {
        return service.runStep(journeyTypeId, journeyId, stepId, actionId, rq, serverHttpRequest);
    }

    @PostMapping("v2/journeys/{journeyTypeId}/{journeyId}")
    public Mono<StepWrapper> createJourneyAndReturn(@PathVariable String journeyTypeId, @PathVariable String journeyId,
        @RequestBody JourneyCreationRq rq,
        ServerHttpRequest serverHttpRequest) throws Throwable {
        return service.createJourneyAndReturn(journeyTypeId, journeyId, rq, serverHttpRequest);
        }

    @PostMapping("v2/journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/{actionId}")
    public Mono<StepWrapper> runStepAndReturn(@PathVariable String journeyTypeId,
        @PathVariable String journeyId,
        @PathVariable String stepId,
        @PathVariable String actionId,
        @RequestBody RunActionRq rq,
        ServerHttpRequest serverHttpRequest) throws Throwable {
            return service.runStepAndReturn(journeyTypeId, journeyId, stepId, actionId, rq, serverHttpRequest);
    }

    @PostMapping("v1/journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/lists/{listId}/rows")
    public Flux<Object> getListRows(@PathVariable String journeyTypeId,
                                    @PathVariable String journeyId,
                                    @PathVariable String stepId,
                                    @PathVariable String listId,
                                    @RequestParam int page,
                                    @RequestParam int page_size,
                                    // urlencoded form of filters json serialized
                                    @RequestBody Map<String, Object> body,
                                    // urlencoded form of orders json serialized
                                    @RequestParam String ordering,
                                    ServerHttpRequest serverHttpRequest
                                    ) throws Throwable {
        Map<String, Object> filters = null;
        Map<String, Object> journey = null;
        if (body != null) {
            filters = (Map<String, Object>) body.get("__filters");
            journey = (Map<String, Object>) body.get("__journey");
        }
        return service.getListRows(journeyTypeId, journeyId, stepId, listId, page, page_size,
                            filters, ordering, journey, serverHttpRequest);
    }

    @PostMapping("v1/journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/lists/{listId}/count")
    public Mono<Long> getListCount(@PathVariable String journeyTypeId,
                                    @PathVariable String journeyId,
                                    @PathVariable String stepId,
                                    @PathVariable String listId,
                                    // urlencoded form of filters json serialized
                                    @RequestBody Map<String, Object> body,
                                    ServerHttpRequest serverHttpRequest
                                    ) throws Throwable {
        Map<String, Object> filters = null;
        Map<String, Object> journey = null;
        if (body != null) {
            filters = (Map<String, Object>) body.get("__filters");
            journey = (Map<String, Object>) body.get("__journey");
        }
        return service.getListCount(journeyTypeId, journeyId, stepId, listId, filters, journey
                                , serverHttpRequest);
    }


    @GetMapping("v1/itemproviders/{itemProviderId}/items")
    public Flux<Value> getItems(@PathVariable String itemProviderId,
                                @RequestParam int page,
                                @RequestParam int page_size,
                                @RequestParam String search_text
                                ) throws Throwable {
        return service.getItems(itemProviderId, page, page_size, search_text);
    }

    @GetMapping("v1/itemproviders/{itemProviderId}/count")
    public Mono<Integer> getItemCount(@PathVariable String itemProviderId,
                                        @RequestParam String search_text
                                        ) throws Throwable {
        return service.getItemCount(itemProviderId, search_text);
    }

    @GetMapping("v1/cdn/{fileId}/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String fileId, @PathVariable String filename)
        throws AuthenticationException {
        return service.serveFile(fileId, filename);
    }

    @GetMapping(value = "v1/files/{fileId}/{fileName}", produces = MediaType.TEXT_PLAIN_VALUE)
    public Mono<String> getFileUrl(@PathVariable String fileId, @PathVariable String fileName) throws AuthenticationException {
        return Mono.just(service.getFileUrl(fileId, fileName));
    }

    @PostMapping("v1/files/{fileId}")
    public Mono<Void> handleFileUpload(@PathVariable String fileId, @RequestPart("file") Mono<FilePart> file)
        throws Exception {
        return service.handleFileUpload(fileId, file);
    }

    @PostMapping("v1/journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/lists/{listId}/csv")
    public ResponseEntity<Mono<Resource>> downloadCsv(@PathVariable String journeyTypeId,
                    @PathVariable String journeyId,
                    @PathVariable String stepId,
                    @PathVariable String listId,
                    // urlencoded form of filters json serialized
                    @RequestBody Map<String, Object> body,
                    // urlencoded form of orders json serialized
                    @RequestParam String ordering,
                    ServerHttpRequest serverHttpRequest) throws Throwable {
        Map<String, Object> filters = null;
        Map<String, Object> journey = null;
        if (body != null) {
            filters = (Map<String, Object>) body.get("__filters");
            journey = (Map<String, Object>) body.get("__journey");
        }
        String fileName = String.format("%s.csv", RandomStringUtils.randomAlphabetic(10));
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,  "attachment; filename=" + fileName)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
            .body(service.generateCsv(journeyTypeId, journeyId, stepId, listId, filters, ordering, journey, serverHttpRequest)
            .flatMap(x -> {
                Resource resource = new InputStreamResource(x);
                return Mono.just(resource);
            }));
    }

    @PostMapping("v1/journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/lists/{listId}/xls")
    public ResponseEntity<Mono<Resource>> downloadExcel(@PathVariable String journeyTypeId,
                    @PathVariable String journeyId,
                    @PathVariable String stepId,
                    @PathVariable String listId,
                    // urlencoded form of filters json serialized
                    @RequestBody Map<String, Object> body,
                    // urlencoded form of orders json serialized
                    @RequestParam String ordering,
                    ServerHttpRequest serverHttpRequest) throws Throwable {
        Map<String, Object> filters = null;
        Map<String, Object> journey = null;
        if (body != null) {
            filters = (Map<String, Object>) body.get("__filters");
            journey = (Map<String, Object>) body.get("__journey");
        }
        String fileName = String.format("%s.xls", RandomStringUtils.randomAlphabetic(10));
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,  "attachment; filename=" + fileName)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
            .body(service.generateExcel(journeyTypeId, journeyId, stepId, listId, filters, ordering, journey, serverHttpRequest)
            .flatMap(x -> {
                Resource resource = new InputStreamResource(x);
                return Mono.just(resource);
            }));
    }


}
