package io.mateu.jpa.domain.util;

import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.outbound.i18n.Translator;
import io.mateu.core.domain.model.outbound.metadataBuilders.CaptionProvider;
import io.mateu.jpa.domain.ui.cruds.JpaRpcCrudView;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@Primary
public class JpaCaptionProvider extends CaptionProvider {
  public JpaCaptionProvider(Humanizer humanizer, Translator translator) {
    super(humanizer, translator);
  }

  @Override
  public String getCaption(Object object) {
    if (object instanceof JpaRpcCrudView jpaRpcCrudView) {
      return jpaRpcCrudView.getCaptionFromAction();
    }
    return super.getCaption(object);
  }
}
