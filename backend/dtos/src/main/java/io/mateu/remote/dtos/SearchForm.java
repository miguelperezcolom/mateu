package io.mateu.remote.dtos;

import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class SearchForm {

  private List<Field> fields;
}
