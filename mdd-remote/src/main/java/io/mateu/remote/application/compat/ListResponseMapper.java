package io.mateu.remote.application.compat;

import io.mateu.remote.application.compat.dtos.ListResponse;
import io.mateu.remote.application.compat.dtos.Pageable;
import io.mateu.remote.application.compat.dtos.Sort;

import java.util.List;

public class ListResponseMapper {
    public ListResponse map(int page, int page_size, long count, List<Object> rows) {
        return ListResponse.builder()
                .content(rows)
                .empty(count == 0)
                .first(page == 0)
                .last(page * page_size >= count)
                .number(page)
                .number_of_elements(page * page_size >= count?count % page_size:page_size)
                .pageable(Pageable.builder().build())
                .size(page_size)
                .sort(Sort.builder().build())
                .total_elements(count)
                .total_pages(Double.valueOf(count / page_size).intValue())
                .build();
    }
}
