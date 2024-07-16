package io.mateu.dtos;

import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class FieldGroup {

  private String id;

  private String caption;

  private List<FieldGroupLine> lines = new ArrayList<>();
}
