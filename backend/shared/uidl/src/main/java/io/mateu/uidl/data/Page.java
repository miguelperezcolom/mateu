package io.mateu.uidl.data;

import java.util.List;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record Page<T>(
    String searchSignature, int pageSize, int pageNumber, long totalElements,
    List<T> content) {

}
