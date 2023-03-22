package io.mateu.remote.dtos;

import lombok.*;

import java.util.List;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class JourneyStarter implements ViewMetadata {

    private final ViewMetadataType type = ViewMetadataType.JourneyStarter;

    private String baseUrl;

}
