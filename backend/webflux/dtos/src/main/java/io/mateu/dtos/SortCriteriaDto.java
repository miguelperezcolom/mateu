package io.mateu.dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor
public class SortCriteriaDto {

  private String column;

  private SortTypeDto order;
}
