package io.mateu.remote.dtos;

import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Section {

  private String id;

  private String tabId;

  private String caption;

  private String description;

  private boolean readOnly;

  private SectionType type;

  private List<Action> actions = new ArrayList<>();

  private List<FieldGroup> fieldGroups = new ArrayList<>();
}
