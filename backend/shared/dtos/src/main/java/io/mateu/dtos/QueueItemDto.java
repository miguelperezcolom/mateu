package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record QueueItemDto(
    String id, String title, String caption, List<ChipDto> badges, boolean selected) {

  public QueueItemDto {
    badges = Collections.unmodifiableList(badges != null ? badges : Collections.emptyList());
  }

  @Override
  public List<ChipDto> badges() {
    return Collections.unmodifiableList(badges);
  }
}
