package io.mateu.remote.application.compat.dtos;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class FilterConfig {

    String key;
    String name;
    List<FilterConfigOption> options;
    String type;
}
