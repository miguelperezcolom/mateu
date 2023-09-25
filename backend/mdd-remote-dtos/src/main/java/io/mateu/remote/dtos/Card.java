package io.mateu.remote.dtos;

import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Card implements ViewMetadata {

  private final ViewMetadataType type = ViewMetadataType.Card;

  private String dataPrefix;

  private String title;

  private String subtitle;

  private String info;

  private String icon;

  private String total;

  private List<FieldGroup> fieldGroups = new ArrayList<>();
}
