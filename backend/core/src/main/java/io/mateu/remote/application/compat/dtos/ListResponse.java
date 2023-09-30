package io.mateu.remote.application.compat.dtos;

import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class ListResponse {

  int total_pages;
  long total_elements;
  boolean last;
  int size;
  int number;
  Sort sort;
  long number_of_elements;
  boolean first;
  boolean empty;
  List<Object> content;
  Pageable pageable;
}
