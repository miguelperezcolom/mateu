package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.dtos.RemoteJourneyDto;
import org.springframework.stereotype.Service;

@Service
public class RemoteJourneyMetadataBuilder {

  public RemoteJourneyDto build(io.mateu.uidl.data.RemoteJourney remoteJourney) {
    return new RemoteJourneyDto(
        remoteJourney.remoteBaseUrl(),
        remoteJourney.remoteUiId(),
        remoteJourney.remoteJourneyType(),
        remoteJourney.contextData());
  }
}
