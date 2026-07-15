package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.BulletedListDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.BulletedList;
import java.util.List;

public class BulletedListMapper {

  public static ClientSideComponentDto mapBulletedListToDto(BulletedList bulletedList) {
    return new ClientSideComponentDto(
        BulletedListDto.builder()
            .items(bulletedList.items() != null ? bulletedList.items() : List.of())
            .build(),
        bulletedList.id(),
        List.of(),
        bulletedList.style(),
        bulletedList.cssClasses(),
        null);
  }
}
