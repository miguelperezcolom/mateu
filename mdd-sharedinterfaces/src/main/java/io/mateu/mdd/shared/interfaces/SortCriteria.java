package io.mateu.mdd.shared.interfaces;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor
public class SortCriteria {

  private String column;

  private SortType order;
}
