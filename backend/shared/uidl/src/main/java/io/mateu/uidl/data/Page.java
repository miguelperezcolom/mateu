package io.mateu.uidl.data;

import java.util.List;

public record Page<T>(int totalPages, long totalElements, List<T> content ) {

}
