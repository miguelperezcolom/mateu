package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.dtos.RemoteJourney;
import org.springframework.stereotype.Service;

@Service
public class RemoteJourneyMetadataBuilder {

  public RemoteJourney build(io.mateu.uidl.data.RemoteJourney remoteJourney) {
    return new RemoteJourney(
        remoteJourney.remoteBaseUrl(),
        remoteJourney.remoteUiId(),
        remoteJourney.remoteJourneyType(),
        remoteJourney.contextData());
  }
}
