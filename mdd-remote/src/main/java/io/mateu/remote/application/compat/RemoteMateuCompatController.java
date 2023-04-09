package io.mateu.remote.application.compat;

import io.mateu.remote.application.OrderingDeserializer;
import io.mateu.remote.application.compat.dtos.ListResponse;
import io.mateu.remote.domain.commands.runStep.RunStepActionCommand;
import io.mateu.remote.domain.commands.runStep.RunStepActionCommandHandler;
import io.mateu.remote.domain.commands.startJourney.StartJourneyCommand;
import io.mateu.remote.domain.commands.startJourney.StartJourneyCommandHandler;
import io.mateu.remote.domain.queries.getJourney.GetJourneyQuery;
import io.mateu.remote.domain.queries.getJourney.GetJourneyQueryHandler;
import io.mateu.remote.domain.queries.getJourneyTypes.GetJourneyTypesQuery;
import io.mateu.remote.domain.queries.getJourneyTypes.GetJourneyTypesQueryHandler;
import io.mateu.remote.domain.queries.getListCount.GetListCountQuery;
import io.mateu.remote.domain.queries.getListCount.GetListCountQueryHandler;
import io.mateu.remote.domain.queries.getListRows.GetListRowsQuery;
import io.mateu.remote.domain.queries.getListRows.GetListRowsQueryHandler;
import io.mateu.remote.domain.queries.getStep.GetStepQuery;
import io.mateu.remote.domain.queries.getStep.GetStepQueryHandler;
import io.mateu.remote.domain.queries.getUI.GetUIQuery;
import io.mateu.remote.domain.queries.getUI.GetUIQueryHandler;
import io.mateu.remote.dtos.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@CrossOrigin
@RestController
@RequestMapping("mateu/compat/v1")
@Slf4j
public class RemoteMateuCompatController {

    @Autowired
    StartJourneyCommandHandler startJourneyCommandHandler;

    @Autowired
    RunStepActionCommandHandler runStepActionCommandHandler;

    @Autowired
    GetUIQueryHandler getUIQueryHandler;

    @Autowired
    GetJourneyQueryHandler getJourneyQueryHandler;

    @Autowired
    GetStepQueryHandler getStepQueryHandler;

    @Autowired
    GetJourneyTypesQueryHandler getJourneyTypesQueryHandler;

    @Autowired
    GetListRowsQueryHandler getListRowsQueryHandler;

    @Autowired
    GetListCountQueryHandler getListCountQueryHandler;

    @GetMapping(value = "uis/{uiId}")
    public UI getUI(@PathVariable String uiId) throws Exception {
        return getUIQueryHandler.run(GetUIQuery.builder().uiId(uiId).build());
    }

    @GetMapping("journey-types")
    public List<JourneyType> getJourneyTypes() throws Exception {
        return getJourneyTypesQueryHandler.run(GetJourneyTypesQuery.builder().build());
    }

    @PostMapping("journeys/{journeyId}")
    public void createJourney(@PathVariable String journeyId, @RequestBody JourneyCreationRq rq)
            throws Throwable {
        startJourneyCommandHandler.handle(StartJourneyCommand.builder()
                .journeyId(journeyId)
                .journeyTypeId(rq.getJourneyTypeId())
                .build());
    }

    @GetMapping("journeys/{journeyId}")
    public Journey getJourney(@PathVariable String journeyId) throws Exception {
        return getJourneyQueryHandler.run(GetJourneyQuery.builder().journeyId(journeyId).build());
    }

    @GetMapping("journeys/{journeyId}/steps/{stepId}")
    public Step getStep(@PathVariable String journeyId, @PathVariable String stepId) throws Exception {
        Step step = getStepQueryHandler.run(GetStepQuery.builder()
                .journeyId(journeyId).stepId(stepId).build());
        List<Component> cruds = step.getView().getComponents().stream()
                .filter(c -> c.getMetadata() instanceof Crud)
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
        runStepActionCommandHandler.handle(RunStepActionCommand.builder()
                .journeyId(journeyId)
                .stepId(stepId)
                .actionId(actionId)
                .data(rq.getData())
                .build());
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

        long count = getListCountQueryHandler.run(GetListCountQuery.builder()
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .filters(new CompatFiltersDeserializer(journeyId, stepId, listId, filters).deserialize())
                .build());
        List<Object> rows = getListRowsQueryHandler.run(GetListRowsQuery.builder()
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .page(page)
                .pageSize(size)
                .filters(new CompatFiltersDeserializer(journeyId, stepId, listId, filters).deserialize())
                .ordering(new OrderingDeserializer(ordering).deserialize())
                .build());

        return new ListResponseMapper().map(page, size, count, rows);
    }

}
