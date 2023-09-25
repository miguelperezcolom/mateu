package io.mateu.remote.application.compat.dtos;

import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class FilterConfig {

  String key;
  String name;
  List<FilterConfigOption> options;
  String type;
}
