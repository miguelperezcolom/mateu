package io.mateu.remote.application.compat;

import io.mateu.remote.application.OrderingDeserializer;
import io.mateu.remote.application.compat.dtos.ListResponse;
import io.mateu.remote.application.compat.queries.GetListCountQueryCompatHandler;
import io.mateu.remote.application.compat.queries.GetListRowsQueryCompatHandler;
import io.mateu.remote.domain.commands.runStep.RunStepActionCommand;
import io.mateu.remote.domain.commands.runStep.RunStepActionCommandHandler;
import io.mateu.remote.domain.commands.startJourney.StartJourneyCommand;
import io.mateu.remote.domain.commands.startJourney.StartJourneyCommandHandler;
import io.mateu.remote.domain.queries.getJourney.GetJourneyQuery;
import io.mateu.remote.domain.queries.getJourney.GetJourneyQueryHandler;
import io.mateu.remote.domain.queries.getJourneyTypes.GetJourneyTypesQuery;
import io.mateu.remote.domain.queries.getJourneyTypes.GetJourneyTypesQueryHandler;
import io.mateu.remote.domain.queries.getListCount.GetListCountQuery;
import io.mateu.remote.domain.queries.getListRows.GetListRowsQuery;
import io.mateu.remote.domain.queries.getStep.GetStepQuery;
import io.mateu.remote.domain.queries.getStep.GetStepQueryHandler;
import io.mateu.remote.domain.queries.getUI.GetUIQuery;
import io.mateu.remote.domain.queries.getUI.GetUIQueryHandler;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;


@CrossOrigin
@RestController
@RequestMapping("mateu/compat/v1")
@Slf4j
public class MateuCompatController {

    @Autowired
    JourneyStoreService store;

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
    GetListRowsQueryCompatHandler getListRowsQueryHandler;

    @Autowired
    GetListCountQueryCompatHandler getListCountQueryHandler;

    @GetMapping(value = "uis/{uiId}")
    public UI getUI(@PathVariable String uiId, ServerHttpRequest serverHttpRequest) throws Exception {
        return getUIQueryHandler.run(GetUIQuery.builder().uiId(uiId).build(), serverHttpRequest);
    }

    @GetMapping("journey-types")
    public List<JourneyType> getJourneyTypes(ServerHttpRequest serverHttpRequest) throws Exception {
        return getJourneyTypesQueryHandler.run(GetJourneyTypesQuery.builder().build(), serverHttpRequest);
    }

    @PostMapping("journeys/{journeyTypeId}/{journeyId}")
    public void createJourney(@PathVariable String journeyTypeId, @PathVariable String journeyId,
                              @RequestBody JourneyCreationRq rq)
            throws Throwable {
        startJourneyCommandHandler.handle(StartJourneyCommand.builder()
                .journeyId(journeyId)
                .journeyTypeId(journeyTypeId)
                .build());
    }

    @GetMapping("journeys/{journeyTypeId}/{journeyId}")
    public Mono<Journey> getJourney(@PathVariable String journeyTypeId, @PathVariable String journeyId)
            throws Exception {
        return getJourneyQueryHandler.run(GetJourneyQuery.builder()
                        .journeyTypeId(journeyTypeId)
                .journeyId(journeyId).build());
    }

    @GetMapping("journeys/{journeyTypeId}/{journeyId}/steps/{stepId}")
    public Mono<Step> getStep(@PathVariable String journeyTypeId, @PathVariable String journeyId,
                              @PathVariable String stepId) throws Exception {
        return getStepQueryHandler.run(GetStepQuery.builder()
                        .journeyTypeId(journeyTypeId)
                .journeyId(journeyId).stepId(stepId).build())
                .map(step -> {
                    List<Component> cruds = step.getView().getMain().getComponents().stream()
                            .filter(c -> c.getMetadata() instanceof Crud)
                            .collect(Collectors.toList());

                    cruds = new ArrayList<>(cruds);

                    for (Component crud : cruds) {
                        try {
                            crud.getAttributes().put("dynamicformjson", new LegacyMapper().map(crud));
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                    return step;
                });
    }

    @PostMapping("journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/{actionId}")
    public void runStep(@PathVariable String journeyTypeId,
                        @PathVariable String journeyId,
                        @PathVariable String stepId,
                        @PathVariable String actionId,
                        @RequestBody RunActionRq rq) throws Throwable {
        runStepActionCommandHandler.handle(RunStepActionCommand.builder()
                        .journeyTypeId(journeyTypeId)
                .journeyId(journeyId)
                .stepId(stepId)
                .actionId(actionId)
                .data(rq.getData())
                .build()).toFuture().get(15, TimeUnit.SECONDS);
    }

    @GetMapping("journeys/{journeyTypeId}/{journeyId}/steps/{stepId}/lists/{listId}/rows")
    public Mono<ListResponse> getListRows(@PathVariable String journeyTypeId,
                                    @PathVariable String journeyId,
                                    @PathVariable String stepId,
                                    @PathVariable String listId,
                                    @RequestParam int page,
                                    @RequestParam int size,
// urlencoded form of filters json serialized
                                    @RequestParam String filters,
// urlencoded form of orders json serialized
                                    @RequestParam String ordering
                                             ) throws Throwable {

        Mono<Long> count = getListCountQueryHandler.run(GetListCountQuery.builder()
                .journeyTypeId(journeyTypeId)
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .filters(filters)
                .build());
        Mono<List<Object>> rows = getListRowsQueryHandler.run(GetListRowsQuery.builder()
                .journeyTypeId(journeyTypeId)
                .journeyId(journeyId)
                .stepId(stepId)
                .listId(listId)
                .page(page)
                .pageSize(size)
                .filters(filters)
                .ordering(new OrderingDeserializer(ordering).deserialize())
                .build()).collectList();

        return Mono.zip(count, rows, (countValue, rowsValue) ->
                new ListResponseMapper().map(page, size, countValue.longValue(), rowsValue));
    }

}
