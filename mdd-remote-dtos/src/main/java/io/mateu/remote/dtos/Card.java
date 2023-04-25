package io.mateu.remote.dtos;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Card implements ViewMetadata {

    private final ViewMetadataType type = ViewMetadataType.Card;

    private String dataPrefix;

    private String title;

    private String subtitle;

    private List<FieldGroup> fieldGroups = new ArrayList<>();


}
