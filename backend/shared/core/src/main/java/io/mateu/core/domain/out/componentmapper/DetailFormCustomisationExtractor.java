package io.mateu.core.domain.out.componentmapper;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.DetailFormCustomisation;
import io.mateu.uidl.annotations.MasterDetail;
import io.mateu.uidl.data.FormPosition;
import java.lang.reflect.Field;

final class DetailFormCustomisationExtractor {

  static String getFormTheme(Field field) {
    if (MetaAnnotations.isPresent(field, DetailFormCustomisation.class)) {
      return MetaAnnotations.find(field, DetailFormCustomisation.class).theme();
    }
    return null;
  }

  static String getFormStyle(Field field) {
    if (MetaAnnotations.isPresent(field, DetailFormCustomisation.class)) {
      return MetaAnnotations.find(field, DetailFormCustomisation.class).style();
    }
    return null;
  }

  static FormPosition getFormPosition(Field field) {
    if (MetaAnnotations.isPresent(field, DetailFormCustomisation.class)) {
      return MetaAnnotations.find(field, DetailFormCustomisation.class).position();
    }
    return FormPosition.right;
  }

  static String getMinHeightWhenDetailVisible(Field field) {
    if (MetaAnnotations.isPresent(field, MasterDetail.class)) {
      return MetaAnnotations.find(field, MasterDetail.class).minHeightWhenDetailVisible();
    }
    return "16rem;";
  }

  private DetailFormCustomisationExtractor() {}
}
