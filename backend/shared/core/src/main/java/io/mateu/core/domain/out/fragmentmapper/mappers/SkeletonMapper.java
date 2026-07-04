package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.SkeletonDto;
import io.mateu.uidl.data.Skeleton;
import io.mateu.uidl.data.SkeletonVariant;
import java.util.List;

public class SkeletonMapper {

  public static ClientSideComponentDto mapSkeletonToDto(Skeleton skeleton) {
    return new ClientSideComponentDto(
        SkeletonDto.builder()
            .variant(
                skeleton.variant() != null
                    ? skeleton.variant().name()
                    : SkeletonVariant.text.name())
            .count(skeleton.count())
            .build(),
        skeleton.id(),
        List.of(),
        skeleton.style(),
        skeleton.cssClasses(),
        null);
  }
}
