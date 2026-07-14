package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FileItemDto;
import io.mateu.dtos.FileListDto;
import io.mateu.uidl.data.FileList;
import java.util.List;

public class FileListMapper {

  public static ClientSideComponentDto mapFileListToDto(FileList fileList) {
    return new ClientSideComponentDto(
        FileListDto.builder()
            .files(
                fileList.files() != null
                    ? fileList.files().stream()
                        .map(
                            file ->
                                FileItemDto.builder()
                                    .name(file.name())
                                    .size(file.size())
                                    .type(file.type())
                                    .url(file.url())
                                    .actionId(file.actionId())
                                    .build())
                        .toList()
                    : List.of())
            .build(),
        fileList.id(),
        List.of(),
        fileList.style(),
        fileList.cssClasses(),
        null);
  }
}
