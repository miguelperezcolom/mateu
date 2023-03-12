package io.mateu.remote.application;

import io.mateu.remote.domain.MateuService;
import io.mateu.remote.domain.commands.RunStepActionCommand;
import io.mateu.remote.domain.commands.StartJourneyCommand;
import io.mateu.remote.domain.queries.*;
import io.mateu.remote.dtos.*;
import io.mateu.util.Helper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Optional;


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
        //todo: does not make sense for mateu uis?
        return List.of();
    }

    @PostMapping("journeys/{journeyId}")
    public void createJourney(@PathVariable String journeyId, @RequestBody JourneyCreationRq rq) throws Exception {
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
        log.info(Helper.toJson(step));
        return step;
    }

    @PostMapping("journeys/{journeyId}/steps/{stepId}/{actionId}")
    public void runStep(@PathVariable String journeyId,
                        @PathVariable String stepId,
                        @PathVariable String actionId,
                        @RequestBody RunActionRq rq) throws Exception {
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

    //todo: add file upload, update and get url

    @GetMapping(value = "entrypoints/**", produces = MediaType.TEXT_HTML_VALUE)
    public String getListCount(HttpServletRequest request) {
        String[] tokens = request.getRequestURI()
                .split(request.getContextPath() + "/entrypoints/");
        String path = tokens.length > 1?tokens[1]:"";
        return "<html><body><h1>Is this html for " + path + "?</h1></body></html>";
    }

}
