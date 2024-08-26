package ${pkgName};

import io.mateu.dtos.Value;
import io.mateu.core.application.MateuService;
import io.mateu.dtos.Page;
import io.mateu.dtos.Items;
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


    @GetMapping(value = "v3/uis/{uiId}")
    public Mono<UI> getUI(@PathVariable String uiId,
            ServerHttpRequest serverHttpRequest) throws Exception {
        return service.getUI(uiId, serverHttpRequest);
    }

    @PostMapping("v3/{uiId}/journeys/{journeyTypeId}/{journeyId}")
    public Mono<UIIncrement> createJourney(@PathVariable String uiId,
            @PathVariable String journeyTypeId,
            @PathVariable String journeyId,
            @RequestBody JourneyCreationRq rq,
            ServerHttpRequest serverHttpRequest) throws Throwable {
        return service.createJourney(uiId, journeyTypeId, journeyId, rq, serverHttpRequest);
    }

    @PostMapping("v3/{uiId}/journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/{componentId}/{actionId}")
    public Mono<UIIncrement> runStep(@PathVariable String uiId,
            @PathVariable String journeyTypeId,
            @PathVariable String journeyId,
            @PathVariable String stepId,
            @PathVariable String componentId,
            @PathVariable String actionId,
            @RequestBody RunActionRq rq,
            ServerHttpRequest serverHttpRequest) throws Throwable {
        return service.runStepAndReturn(uiId, journeyTypeId, journeyId, stepId, componentId, actionId, rq, serverHttpRequest);
    }

    @PostMapping("v3/{uiId}/journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/{componentId}/lists/{listId}/rows")
    public Mono<Page> getListRows(@PathVariable String uiId,
                @PathVariable String journeyTypeId,
                @PathVariable String journeyId,
                @PathVariable String stepId,
                @PathVariable String componentId,
                @PathVariable String listId,
                @RequestParam int page,
                @RequestParam int page_size,
                // urlencoded form of filters json serialized
                @RequestBody Map<String, Object> body,
                // urlencoded form of orders json serialized
                @RequestParam String ordering,
                ServerHttpRequest serverHttpRequest) throws Throwable {
        Map<String, Object> filters = null;
        Map<String, Object> data = null;
        String componentType = null;
        if (body != null) {
            filters = (Map<String, Object>) body.get("__filters");
            data = (Map<String, Object>) body.get("__data");
            componentType = (String) body.get("__componentType");
        }
        return service.getListRows(componentType, page, page_size,
                            data, filters, ordering, serverHttpRequest);
    }

    @GetMapping("v3/itemproviders/{itemProviderId}/items")
    public Mono<Items> getItems(@PathVariable String itemProviderId,
                                @RequestParam int page,
                                @RequestParam int page_size,
                                @RequestParam String search_text
                                ) throws Throwable {
        return service.getItems(itemProviderId, page, page_size, search_text);
    }

    @GetMapping("v3/cdn/{fileId}/{filename:.+}")
    @ResponseBody
    public Mono<ResponseEntity<Resource>> serveFile(@PathVariable String fileId, @PathVariable String filename)
        throws AuthenticationException {
        return service.serveFile(fileId, filename);
    }

    @GetMapping(value = "v3/files/{fileId}/{fileName}", produces = MediaType.TEXT_PLAIN_VALUE)
    public Mono<String> getFileUrl(@PathVariable String fileId, @PathVariable String fileName) throws AuthenticationException {
        return service.getFileUrl(fileId, fileName);
    }

    @PostMapping("v3/files/{fileId}")
    public Mono<Void> handleFileUpload(@PathVariable String fileId, @RequestPart("file") Mono<FilePart> file)
        throws Exception {
        return service.handleFileUpload(fileId, file);
    }

    @PostMapping("v3/{uiId}/journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/{componentId}/lists/{listId}/csv")
    public ResponseEntity<Mono<Resource>> downloadCsv(@PathVariable String uiId,
                                        @PathVariable String journeyTypeId,
                    @PathVariable String journeyId,
                    @PathVariable String stepId,
                    @PathVariable String componentId,
                    @PathVariable String listId,
                    // urlencoded form of filters json serialized
                    @RequestBody Map<String, Object> body,
                    // urlencoded form of orders json serialized
                    @RequestParam String ordering,
                    ServerHttpRequest serverHttpRequest) throws Throwable {
        Map<String, Object> filters = null;
        Map<String, Object> data = null;
        String componentType = null;
        if (body != null) {
            filters = (Map<String, Object>) body.get("__filters");
            data = (Map<String, Object>) body.get("__data");
            componentType = (String) body.get("__componentType");
        }
        String fileName = String.format("%s.csv", RandomStringUtils.randomAlphabetic(10));
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,  "attachment; filename=" + fileName)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
            .body(service.generateCsv(componentType, data, filters, ordering, serverHttpRequest)
            .flatMap(x -> {
                Resource resource = new InputStreamResource(x);
                return Mono.just(resource);
            }));
    }

    @PostMapping("v3/{uiId}/journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/{componentId}/lists/{listId}/xls")
    public ResponseEntity<Mono<Resource>> downloadExcel(@PathVariable String uiId,
                                            @PathVariable String journeyTypeId,
                    @PathVariable String journeyId,
                    @PathVariable String stepId,
                    @PathVariable String componentId,
                    @PathVariable String listId,
                    // urlencoded form of filters json serialized
                    @RequestBody Map<String, Object> body,
                    // urlencoded form of orders json serialized
                    @RequestParam String ordering,
                    ServerHttpRequest serverHttpRequest) throws Throwable {
        Map<String, Object> filters = null;
        Map<String, Object> data = null;
        String componentType = null;
        if (body != null) {
            filters = (Map<String, Object>) body.get("__filters");
            data = (Map<String, Object>) body.get("__data");
            componentType = (String) body.get("__componentType");
        }
        String fileName = String.format("%s.xls", RandomStringUtils.randomAlphabetic(10));
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,  "attachment; filename=" + fileName)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
            .body(service.generateExcel(componentType, data, filters, ordering, serverHttpRequest)
            .flatMap(x -> {
                Resource resource = new InputStreamResource(x);
                return Mono.just(resource);
            }));
    }


}
