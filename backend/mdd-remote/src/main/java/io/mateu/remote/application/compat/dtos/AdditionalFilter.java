package io.mateu.remote.application.compat.dtos;

import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class AdditionalFilter {

  String controlName;
  Object defaultValue;
  String optionPanelModifiers;
  String sourceName;
  List<Source> sources;
}
