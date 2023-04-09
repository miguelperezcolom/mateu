package io.mateu.remote.domain.commands.startJourney;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.interfaces.RemoteJourney;
import io.mateu.remote.application.NotFoundException;
import io.mateu.remote.domain.mappers.JourneyMapper;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@Builder
@Slf4j@Getter
public class StartJourneyCommand {

    private String journeyTypeId;

    private String journeyId;

}
