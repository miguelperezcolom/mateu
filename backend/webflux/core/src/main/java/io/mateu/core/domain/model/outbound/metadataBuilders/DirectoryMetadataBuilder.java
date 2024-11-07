package io.mateu.core.domain.model.outbound.metadataBuilders;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.MenuBuilder;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.dtos.Directory;
import io.mateu.uidl.core.interfaces.HasSubtitle;
import io.mateu.uidl.core.interfaces.HasTitle;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class DirectoryMetadataBuilder {

  final FieldMetadataBuilder fieldMetadataBuilder;
  final ReflectionService reflectionService;
  final CaptionProvider captionProvider;
  final MenuBuilder menuCreator;
  private final ServerSideObjectMapper serverSideObjectMapper;

  // todo: this builder is based on reflection. Consider adding a dynamic one and cache results
  public Directory build(
      io.mateu.uidl.core.interfaces.Directory directory, ServerHttpRequest serverHttpRequest) {
    Directory metadata =
        new Directory(
            getTitle(directory),
            getSubtitle(directory),
            menuCreator.buildMenuForUi(directory, serverHttpRequest));
    return metadata;
  }

  private String getSubtitle(io.mateu.uidl.core.interfaces.Directory directory) {
    if (directory instanceof HasSubtitle hasSubtitle) {
      return hasSubtitle.getSubtitle();
    }
    return "";
  }

  private String getTitle(io.mateu.uidl.core.interfaces.Directory directory) {
    if (directory instanceof HasTitle hasTitle) {
      return hasTitle.getTitle();
    }
    return captionProvider.getCaption(directory);
  }
}
