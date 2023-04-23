package io.mateu.remote.domain.commands.startJourney;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Builder
@Slf4j@Getter
public class StartJourneyCommand {

    private String journeyTypeId;

    private String journeyId;

}
