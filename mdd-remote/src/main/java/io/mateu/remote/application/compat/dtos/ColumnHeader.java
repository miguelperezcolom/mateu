package io.mateu.remote.application.compat.dtos;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class ColumnHeader {

    Cell cell;
    boolean clickable;
    String headerLabel;
    boolean showColumn;
    boolean sort;
    String sortKey;
    List<String> target_data;
    String tSelector;
    boolean filter;
    FilterConfig filterConfig;

}
