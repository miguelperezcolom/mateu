package io.mateu.core.domain.out.componentmapper;

import io.mateu.uidl.annotations.DetailFormCustomisation;
import io.mateu.uidl.annotations.MasterDetail;
import io.mateu.uidl.data.FormPosition;
import java.lang.reflect.Field;

final class DetailFormCustomisationExtractor {

  static String getFormTheme(Field field) {
    if (field.isAnnotationPresent(DetailFormCustomisation.class)) {
      return field.getAnnotation(DetailFormCustomisation.class).theme();
    }
    return null;
  }

  static String getFormStyle(Field field) {
    if (field.isAnnotationPresent(DetailFormCustomisation.class)) {
      return field.getAnnotation(DetailFormCustomisation.class).style();
    }
    return null;
  }

  static FormPosition getFormPosition(Field field) {
    if (field.isAnnotationPresent(DetailFormCustomisation.class)) {
      return field.getAnnotation(DetailFormCustomisation.class).position();
    }
    return FormPosition.right;
  }

  static String getMinHeightWhenDetailVisible(Field field) {
    if (field.isAnnotationPresent(MasterDetail.class)) {
      return field.getAnnotation(MasterDetail.class).minHeightWhenDetailVisible();
    }
    return "16rem;";
  }

  private DetailFormCustomisationExtractor() {}
}
