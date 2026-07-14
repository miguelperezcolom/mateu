package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record FileListDto(List<FileItemDto> files) implements ComponentMetadataDto {

  public FileListDto {
    files = Collections.unmodifiableList(files != null ? files : Collections.emptyList());
  }

  @Override
  public List<FileItemDto> files() {
    return Collections.unmodifiableList(files);
  }
}
