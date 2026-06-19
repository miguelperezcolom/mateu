package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;

import io.mateu.core.domain.out.componentmapper.PageFormBuilder.SectionFields;
import io.mateu.uidl.annotations.Section;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

final class FormSectionGrouper {

  record SectionGrouping(List<Section> sections, Map<Section, SectionFields> fieldsPerSection) {}

  static SectionGrouping group(Collection<Field> fields, int maxColumns) {
    Map<Section, SectionFields> fieldsPerSection = new HashMap<>();
    List<Section> sections = new ArrayList<>();
    Section sectionAnnotation = null;
    SectionFields sectionFields = null;

    for (Field field : fields) {
      if (sectionFields == null || field.isAnnotationPresent(Section.class)) {
        if (sectionFields != null) {
          fieldsPerSection.put(sectionAnnotation, sectionFields);
          sections.add(sectionAnnotation);
        }
        if (field.isAnnotationPresent(Section.class)) {
          sectionAnnotation = field.getAnnotation(Section.class);
        } else {
          final int cols = maxColumns;
          sectionAnnotation =
              new Section() {
                @Override
                public Class<? extends Annotation> annotationType() {
                  return null;
                }

                @Override
                public String value() {
                  return "";
                }

                @Override
                public int columns() {
                  return cols;
                }

                @Override
                public String style() {
                  return "";
                }

                @Override
                public String zone() {
                  return "";
                }
              };
        }
        sectionFields =
            new SectionFields(getLabel(field), new ArrayList<>(), sectionAnnotation.columns());
      }
      sectionFields.fields().add(field);
    }
    if (sectionFields != null) {
      sections.add(sectionAnnotation);
      fieldsPerSection.put(sectionAnnotation, sectionFields);
    }
    return new SectionGrouping(sections, fieldsPerSection);
  }
}
