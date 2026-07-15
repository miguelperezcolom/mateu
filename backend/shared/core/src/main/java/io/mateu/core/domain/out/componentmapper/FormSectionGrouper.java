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
      // Only start a new section when the @Section declaration actually changes — comparing EVERY
      // attribute, not just the name: two consecutive untitled sections (value "") pointing at
      // different zones (or with different propertyList/frameless/… flags) are distinct sections,
      // while consecutive fields repeating the exact same @Section still share one group.
      // Meta-aware read so composed (semantic) annotations carrying @Section also work here.
      Section fieldSection = MetaAnnotations.find(field, Section.class);
      boolean startsNewSection =
          sectionFields == null
              || (fieldSection != null
                  && (sectionAnnotation == null || !sameSection(fieldSection, sectionAnnotation)));
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

                @Override
                public boolean propertyList() {
                  return false;
                }

                @Override
                public boolean frameless() {
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

  /** Whether two @Section declarations describe the same section (every attribute equal). */
  private static boolean sameSection(Section a, Section b) {
    return a.value().equals(b.value())
        && a.zone().equals(b.zone())
        && a.columns() == b.columns()
        && a.style().equals(b.style())
        && a.sticky() == b.sticky()
        && a.propertyList() == b.propertyList()
        && a.frameless() == b.frameless();
  }
}
