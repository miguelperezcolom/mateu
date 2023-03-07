package io.mateu.remote.application;

import io.mateu.remote.domain.MateuService;
import io.mateu.remote.domain.commands.RunStepActionCommand;
import io.mateu.remote.domain.commands.StartJourneyCommand;
import io.mateu.remote.domain.queries.*;
import io.mateu.remote.dtos.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("mateu/v1")
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
        return GetStepQuery.builder().journeyId(journeyId).stepId(stepId).build().run();
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
    public List<Map<String, Object>> getListRows(@PathVariable String journeyId,
                                                 @PathVariable String stepId,
                                                 @PathVariable String listId,
                                                 @RequestParam int page,
                                                 @RequestParam int page_size,
// urlencoded form of filters json serialized
                                                 @RequestParam String filters,
// urlencoded form of orders json serialized
                                                 @RequestParam String ordering
                                             ) throws Exception {
        return GetListRowsQuery.builder()
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .page(page)
                .pageSize(page_size)
                .filters(new FiltersDeserializer(filters).deserialize())
                .ordering(new OrderingDeserializer(ordering).deserialize())
                .build().run();
    }

    @GetMapping("journeys/{journeyId}/steps/{stepId}/lists/{listId}/count")
    public long getListCount(@PathVariable String journeyId,
                             @PathVariable String stepId,
                             @PathVariable String listId,
// urlencoded form of filters json serialized
                             @RequestParam String filters
    ) throws Exception {
        return GetListCountQuery.builder()
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .filters(new FiltersDeserializer(filters).deserialize())
                .build().run();
    }

}
