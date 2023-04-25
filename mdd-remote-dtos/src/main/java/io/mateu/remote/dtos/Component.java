package io.mateu.remote.dtos;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Component {

    private ViewMetadata metadata;

    private String id;

    private Map<String, Object> attributes;

}
