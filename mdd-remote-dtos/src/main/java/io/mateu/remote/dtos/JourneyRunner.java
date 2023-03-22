package io.mateu.remote.dtos;

import lombok.*;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class JourneyRunner implements ViewMetadata {

    private final ViewMetadataType type = ViewMetadataType.JourneyRunner;

    private String baseUrl;
    private String journeyType;

}
