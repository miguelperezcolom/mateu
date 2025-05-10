package ${pkgName};

import io.mateu.core.application.MateuService;
import io.mateu.dtos.*;
import lombok.extern.slf4j.Slf4j;
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
import io.mateu.SpringHttpRequest;

import javax.naming.AuthenticationException;
import java.util.Map;


@CrossOrigin
@RestController("${pkgName}.${simpleClassName}MateuController")
@RequestMapping("${path}/mateu")
@Slf4j
public class ${simpleClassName}MateuController {

    @Autowired
    private MateuService service;

    private String uiId = "${className}";

    private String baseUrl = "${path}";


    @PostMapping(value = "v3/ui")
    public Mono<UIDto> getUI(
            @RequestBody GetUIRqDto rq,
            ServerHttpRequest serverHttpRequest) throws Exception {
        return service.getUI(uiId, baseUrl, rq, new SpringHttpRequest(serverHttpRequest));
    }

    @PostMapping("v3/journeys/{journeyTypeId}/{journeyId}")
    public Mono<UIIncrementDto> createJourney(
            @PathVariable("journeyTypeId") String journeyTypeId,
            @PathVariable("journeyId") String journeyId,
            @RequestBody JourneyCreationRqDto rq,
            ServerHttpRequest serverHttpRequest) throws Throwable {
        return service.createJourney(uiId, baseUrl, journeyTypeId, journeyId, rq,
                new SpringHttpRequest(serverHttpRequest));
    }

    @PostMapping("v3/components/{componentId}/{actionId}")
    public Mono<UIIncrementDto> runStep(
            @PathVariable("componentId") String componentId,
            @PathVariable("actionId") String actionId,
            @RequestBody RunActionRqDto rq,
            ServerHttpRequest serverHttpRequest) throws Throwable {
        return service.runAction(componentId, actionId, rq, baseUrl, new SpringHttpRequest(serverHttpRequest));
    }

    /*
    @GetMapping("v3/cdn/{fileId}/{filename:.+}")
    @ResponseBody
    public Mono<ResponseEntity<Resource>> serveFile(
                        @PathVariable("fileId") String fileId,
                        @PathVariable("filename") String filename)
        throws AuthenticationException {
        return service.serveFile(fileId, filename);
    }
    */

    /*
    @GetMapping(value = "v3/files/{fileId}/{fileName}", produces = MediaType.TEXT_PLAIN_VALUE)
    public Mono<String> getFileUrl(
                            @PathVariable("fileId") String fileId,
                            @PathVariable("fileName") String fileName) throws AuthenticationException {
        return service.getFileUrl(fileId, fileName);
    }
    */

    /*
    @PostMapping("v3/files/{fileId}")
    public Mono<Void> handleFileUpload(
                                @PathVariable("fileId") String fileId,
                                @RequestPart("file") Mono<FilePart> file)
        throws Exception {
        return service.handleFileUpload(fileId, file);
    }
    */

    /*
    @PostMapping("v3/journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/{componentId}/lists/{listId}/csv")
    public ResponseEntity<Mono<Resource>> downloadCsv(
                    @PathVariable("journeyTypeId") String journeyTypeId,
                    @PathVariable("journeyId") String journeyId,
                    @PathVariable("stepId") String stepId,
                    @PathVariable("componentId") String componentId,
                    @PathVariable("listId") String listId,
                    // urlencoded form of filters json serialized
                    @RequestBody Map<String, Object> body,
                    // urlencoded form of orders json serialized
                    @RequestParam("ordering") String ordering,
                    ServerHttpRequest serverHttpRequest) throws Throwable {
        Map<String, Object> filters = null;
        Map<String, Object> data = null;
        String componentType = null;
        String searchText = null;
        if (body != null) {
            filters = (Map<String, Object>) body.get("__filters");
            data = (Map<String, Object>) body.get("__data");
            componentType = (String) body.get("__componentType");
            searchText = (String) body.get("__searchText");
        }
        String fileName = String.format("%s.csv", RandomStringUtils.randomAlphabetic(10));
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,  "attachment; filename=" + fileName)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
            .body(service.generateCsv(componentType, data, searchText, filters, ordering, serverHttpRequest)
            .flatMap(x -> {
                Resource resource = new InputStreamResource(x);
                return Mono.just(resource);
            }));
    }
    */

    /*
    @PostMapping("v3/journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/{componentId}/lists/{listId}/xls")
    public ResponseEntity<Mono<Resource>> downloadExcel(
                    @PathVariable("journeyTypeId") String journeyTypeId,
                    @PathVariable("journeyId") String journeyId,
                    @PathVariable("stepId") String stepId,
                    @PathVariable("componentId") String componentId,
                    @PathVariable("listId") String listId,
                    // urlencoded form of filters json serialized
                    @RequestBody Map<String, Object> body,
                    // urlencoded form of orders json serialized
                    @RequestParam("ordering") String ordering,
                    ServerHttpRequest serverHttpRequest) throws Throwable {
        Map<String, Object> filters = null;
        Map<String, Object> data = null;
        String componentType = null;
        String searchText = null;
        if (body != null) {
            filters = (Map<String, Object>) body.get("__filters");
            data = (Map<String, Object>) body.get("__data");
            componentType = (String) body.get("__componentType");
            searchText = (String) body.get("__searchText");
        }
        String fileName = String.format("%s.xls", RandomStringUtils.randomAlphabetic(10));
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,  "attachment; filename=" + fileName)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
            .body(service.generateExcel(componentType, data, searchText, filters, ordering, serverHttpRequest)
            .flatMap(x -> {
                Resource resource = new InputStreamResource(x);
                return Mono.just(resource);
            }));
    }
    */

}
