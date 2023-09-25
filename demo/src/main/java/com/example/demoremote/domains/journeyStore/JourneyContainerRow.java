package com.example.demoremote.domains.journeyStore;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter@Setter@AllArgsConstructor@NoArgsConstructor
public class JourneyContainerRow {

    String journeyId;

    String journeyTypeId;

    String remoteBaseUrl;

    String remoteJourneyTypeId;

    Class journeyClass;

    LocalDateTime created;

    LocalDateTime lastAccess;
    
}
