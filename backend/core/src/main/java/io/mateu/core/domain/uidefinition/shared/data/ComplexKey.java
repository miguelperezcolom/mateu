package io.mateu.core.domain.uidefinition.shared.data;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class ComplexKey {

  private String title;

  private String text;

  private String note;

  private String summary;
}
