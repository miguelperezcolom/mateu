package io.mateu.remote.application.compat.dtos;

import io.mateu.remote.dtos.Value;
import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Source {

  String name;
  List<Value> values;
}
