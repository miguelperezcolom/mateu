package io.mateu.remote.dtos;

import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class FieldGroupLine {
  private List<Field> fields = new ArrayList<>();
}
