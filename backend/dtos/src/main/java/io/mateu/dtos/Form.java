package io.mateu.dtos;

import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Form implements ViewMetadata {

  private final ViewMetadataType type = ViewMetadataType.Form;

  private String dataPrefix;

  private String icon;

  private String title;

  private boolean readOnly;

  private String subtitle;

  private Status status;

  private List<Badge> badges;

  private List<Tab> tabs;

  private List<Banner> banners;

  private List<Section> sections;

  private List<Action> actions;

  private List<Action> mainActions;

  private List<Validation> validations = new ArrayList<>();
}
