package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record OrgNodeDto(
    String id,
    String title,
    String subtitle,
    String avatar,
    String color,
    String actionId,
    List<OrgNodeDto> children) {

  public OrgNodeDto {
    children = Collections.unmodifiableList(children != null ? children : Collections.emptyList());
  }

  @Override
  public List<OrgNodeDto> children() {
    return Collections.unmodifiableList(children);
  }
}
