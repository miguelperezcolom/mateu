package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;

import io.mateu.core.domain.out.componentmapper.PageFormBuilder.SectionFields;
import io.mateu.core.infra.reflection.MetaAnnotations;
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
      // Only start a new section when the section name actually changes.
      // Consecutive fields sharing the same @Section value belong to the same group.
      // Meta-aware read so composed (semantic) annotations carrying @Section also work here.
      Section fieldSection = MetaAnnotations.find(field, Section.class);
      boolean startsNewSection =
          sectionFields == null
              || (fieldSection != null
                  && (sectionAnnotation == null
                      || !fieldSection.value().equals(sectionAnnotation.value())));
      if (startsNewSection) {
        if (sectionFields != null) {
          fieldsPerSection.put(sectionAnnotation, sectionFields);
          sections.add(sectionAnnotation);
        }
        if (fieldSection != null) {
          sectionAnnotation = fieldSection;
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

                @Override
                public boolean sticky() {
                  return false;
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
