package io.mateu.remote.application;

import io.mateu.mdd.shared.data.Value;
import io.mateu.remote.domain.files.StorageService;
import io.mateu.remote.domain.commands.RunStepActionCommand;
import io.mateu.remote.domain.commands.StartJourneyCommand;
import io.mateu.remote.domain.queries.*;
import io.mateu.remote.dtos.*;
import io.mateu.util.Helper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.naming.AuthenticationException;
import javax.servlet.http.HttpServletRequest;
import java.util.List;


@RestController
@RequestMapping("mateu/v1")
@Slf4j
public class RemoteMateuController {


    @GetMapping(value = "uis/{uiId}")
    public UI getUI(@PathVariable String uiId) throws Exception {
        return GetUIQuery.builder().uiId(uiId).build().run();
    }

    @GetMapping("journey-types")
    public List<JourneyType> getJourneyTypes() throws Exception {
        return GetJourneyTypesQuery.builder().build().run();
    }

    @PostMapping("journeys/{journeyId}")
    public void createJourney(@PathVariable String journeyId, @RequestBody JourneyCreationRq rq) throws Throwable {
        StartJourneyCommand.builder()
                .journeyId(journeyId)
                .journeyTypeId(rq.getJourneyTypeId())
                .build().run();
    }

    @GetMapping("journeys/{journeyId}")
    public Journey getJourney(@PathVariable String journeyId) throws Exception {
        return GetJourneyQuery.builder().journeyId(journeyId).build().run();
    }

    @GetMapping("journeys/{journeyId}/steps/{stepId}")
    public Step getStep(@PathVariable String journeyId, @PathVariable String stepId) throws Exception {
        Step step = GetStepQuery.builder().journeyId(journeyId).stepId(stepId).build().run();
        //log.info(Helper.toJson(step));
        return step;
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
    public List<Object> getListRows(@PathVariable String journeyId,
                                                 @PathVariable String stepId,
                                                 @PathVariable String listId,
                                                 @RequestParam int page,
                                                 @RequestParam int page_size,
// urlencoded form of filters json serialized
                                                 @RequestParam String filters,
// urlencoded form of orders json serialized
                                                 @RequestParam String ordering
                                             ) throws Throwable {
        return GetListRowsQuery.builder()
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .page(page)
                .pageSize(page_size)
                .filters(new FiltersDeserializer(journeyId, stepId, listId, filters).deserialize())
                .ordering(new OrderingDeserializer(ordering).deserialize())
                .build().run();
    }

    @GetMapping("journeys/{journeyId}/steps/{stepId}/lists/{listId}/count")
    public long getListCount(@PathVariable String journeyId,
                             @PathVariable String stepId,
                             @PathVariable String listId,
// urlencoded form of filters json serialized
                             @RequestParam String filters
    ) throws Throwable {
        return GetListCountQuery.builder()
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .filters(new FiltersDeserializer(journeyId, stepId, listId, filters).deserialize())
                .build().run();
    }


    @GetMapping("itemproviders/{itemProviderId}/items")
    public List<Value> getListRows(@PathVariable String itemProviderId,
                                   @RequestParam int page,
                                   @RequestParam int page_size,
                                   @RequestParam String search_text
    ) throws Throwable {
        return GetItemsRowsQuery.builder()
                .itemsProviderId(itemProviderId)
                .page(page)
                .pageSize(page_size)
                .searchText(search_text)
                .build().run();
    }

    @GetMapping("itemproviders/{itemProviderId}/count")
    public long getListCount(@PathVariable String itemProviderId,
                             @RequestParam String search_text
    ) throws Throwable {
        return GetItemsCountQuery.builder()
                .itemsProviderId(itemProviderId)
                .searchText(search_text)
                .build().run();
    }

    @GetMapping(value = "entrypoints/**", produces = MediaType.TEXT_HTML_VALUE)
    public String getListCount(HttpServletRequest request) {
        String[] tokens = request.getRequestURI()
                .split(request.getContextPath() + "/entrypoints/");
        String path = tokens.length > 1?tokens[1]:"";
        return "<html><body><h1>Is this html for " + path + "?</h1></body></html>";
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
    public String handleFileUpload(@PathVariable String fileId, @RequestParam("file") MultipartFile file,
                                   RedirectAttributes redirectAttributes) throws AuthenticationException {

        storageService.store(fileId, file);
        redirectAttributes.addFlashAttribute("message",
                "You successfully uploaded " + file.getOriginalFilename() + "!");

        return "redirect:/";
    }

}
