package ${pkgName};

import io.mateu.mdd.shared.data.Value;
import io.mateu.remote.application.RemoteMateuService;
import io.mateu.remote.dtos.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.naming.AuthenticationException;


@CrossOrigin
@RestController
@RequestMapping("${path}/mateu/v1")
@Slf4j
public class ${simpleClassName}RemoteMateuController {

    @Autowired
    private RemoteMateuService service;


    @GetMapping(value = "uis/{uiId}")
    public Mono<UI> getUI(@PathVariable String uiId) throws Exception {
        return service.getUI(uiId);
    }

    @GetMapping("journey-types")
    public Flux<JourneyType> getJourneyTypes() throws Exception {
        return service.getJourneyTypes();
    }

    @PostMapping("journeys/{journeyId}")
    public void createJourney(@PathVariable String journeyId, @RequestBody JourneyCreationRq rq) throws Throwable {
        service.createJourney(journeyId, rq);
    }

    @GetMapping("journeys/{journeyId}")
    public Mono<Journey> getJourney(@PathVariable String journeyId) throws Exception {
        return service.getJourney(journeyId);
    }

    @GetMapping("journeys/{journeyId}/steps/{stepId}")
    public Mono<Step> getStep(@PathVariable String journeyId, @PathVariable String stepId) throws Exception {
        return service.getStep(journeyId, stepId);
    }

    @PostMapping("journeys/{journeyId}/steps/{stepId}/{actionId}")
    public void runStep(@PathVariable String journeyId,
                        @PathVariable String stepId,
                        @PathVariable String actionId,
                        @RequestBody RunActionRq rq) throws Throwable {
        service.runStep(journeyId, stepId, actionId, rq);
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
        return service.getListRows(journeyId, stepId, listId, page, page_size, filters, ordering);
    }

    @GetMapping("journeys/{journeyId}/steps/{stepId}/lists/{listId}/count")
    public Mono<Long> getListCount(@PathVariable String journeyId,
                                    @PathVariable String stepId,
                                    @PathVariable String listId,
                                    // urlencoded form of filters json serialized
                                    @RequestParam String filters
                                    ) throws Throwable {
        return service.getListCount(journeyId, stepId, listId, filters);
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
    public String getFileUrl(@PathVariable String fileId) throws AuthenticationException {
        return service.getFileUrl(fileId);
    }

    @PostMapping("files/{fileId}")
    public String handleFileUpload(@PathVariable String fileId, @RequestParam("file") MultipartFile file)
        throws AuthenticationException {
        return service.handleFileUpload(fileId, file);
    }

}
