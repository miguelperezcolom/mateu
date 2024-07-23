package io.mateu.dtos;

import java.util.Map;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Component {

  private ViewMetadata metadata;

  private String id;

  private Map<String, Object> attributes;
}
