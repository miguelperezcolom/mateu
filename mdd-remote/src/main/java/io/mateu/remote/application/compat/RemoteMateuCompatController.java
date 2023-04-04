package io.mateu.remote.application.compat;

import io.mateu.remote.application.FiltersDeserializer;
import io.mateu.remote.application.OrderingDeserializer;
import io.mateu.remote.application.compat.dtos.ListResponse;
import io.mateu.remote.domain.commands.RunStepActionCommand;
import io.mateu.remote.domain.commands.StartJourneyCommand;
import io.mateu.remote.domain.queries.*;
import io.mateu.remote.dtos.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("mateu/compat/v1")
@Slf4j
public class RemoteMateuCompatController {

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
        List<Component> cruds = step.getView().getComponents().stream().filter(c -> c.getMetadata() instanceof Crud)
                .collect(Collectors.toList());

        cruds = new ArrayList<>(cruds);

        for (Component crud : cruds) {
            crud.getAttributes().put("dynamicformjson", new LegacyMapper().map(crud));
        }
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
    public ListResponse getListRows(@PathVariable String journeyId,
                                    @PathVariable String stepId,
                                    @PathVariable String listId,
                                    @RequestParam int page,
                                    @RequestParam int size,
// urlencoded form of filters json serialized
                                    @RequestParam String filters,
// urlencoded form of orders json serialized
                                    @RequestParam String ordering
                                             ) throws Throwable {

        long count = GetListCountQuery.builder()
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .filters(new CompatFiltersDeserializer(journeyId, stepId, listId, filters).deserialize())
                .build().run();
        List<Object> rows = GetListRowsQuery.builder()
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .page(page)
                .pageSize(size)
                .filters(new CompatFiltersDeserializer(journeyId, stepId, listId, filters).deserialize())
                .ordering(new OrderingDeserializer(ordering).deserialize())
                .build().run();

        return new ListResponseMapper().map(page, size, count, rows);
    }

}
