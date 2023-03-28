package io.mateu.remote.application.compat.dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Pageable {

    Sort sort;
    int offset;
    int page_number;
    int page_size;
    boolean paged;
    boolean unpaged;

}
