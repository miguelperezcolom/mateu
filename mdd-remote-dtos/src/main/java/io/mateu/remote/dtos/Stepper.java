package io.mateu.remote.dtos;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Stepper implements ViewMetadata {

    private final ViewMetadataType type = ViewMetadataType.Stepper;

    private String dataPrefix;

}
