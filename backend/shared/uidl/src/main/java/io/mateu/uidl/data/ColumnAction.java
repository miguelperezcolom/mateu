package io.mateu.uidl.data;

import lombok.Builder;

@Builder
public record ColumnAction(String methodNameInCrud, String label, String icon) {}
