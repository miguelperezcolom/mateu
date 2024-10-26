package io.mateu.core.domain.model.outbound.metadataBuilders;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.MenuBuilder;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.*;
import io.mateu.dtos.Directory;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class DirectoryMetadataBuilder {

  final FieldMetadataBuilder fieldMetadataBuilder;
  final ReflectionHelper reflectionHelper;
  final CaptionProvider captionProvider;
  final MenuBuilder menuCreator;
  private final ServerSideObjectMapper serverSideObjectMapper;

  // todo: this builder is based on reflection. Consider adding a dynamic one and cache results
  public Directory build(
      io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Directory directory,
      ServerHttpRequest serverHttpRequest) {
    Directory metadata =
        new Directory(
            getTitle(directory),
            getSubtitle(directory),
            menuCreator.buildMenuForUi(directory, serverHttpRequest));
    return metadata;
  }

  private String getSubtitle(
      io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Directory directory) {
    if (directory instanceof HasSubtitle hasSubtitle) {
      return hasSubtitle.getSubtitle();
    }
    return "";
  }

  private String getTitle(io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Directory directory) {
    if (directory instanceof HasTitle hasTitle) {
      return hasTitle.getTitle();
    }
    return captionProvider.getCaption(directory);
  }
}
