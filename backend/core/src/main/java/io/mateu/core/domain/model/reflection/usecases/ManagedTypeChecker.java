package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.shared.annotations.Element;
import io.mateu.core.domain.uidefinition.shared.data.ExternalReference;
import io.mateu.core.domain.uidefinition.shared.data.TelephoneNumber;
import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collection;
import java.util.Date;
import java.util.concurrent.Callable;
import javax.swing.*;
import org.springframework.stereotype.Service;

@Service
public class ManagedTypeChecker {

  private final BasicTypeChecker basicTypeChecker;

  public ManagedTypeChecker(BasicTypeChecker basicTypeChecker) {
    this.basicTypeChecker = basicTypeChecker;
  }

  public boolean isManaged(Field field) {
    var type = field.getType();
    return basicTypeChecker.isBasic(field.getType())
        || type.isArray()
        || type.isEnum()
        || Collection.class.isAssignableFrom(type)
        || ExternalReference.class.isAssignableFrom(type)
        || TelephoneNumber.class.isAssignableFrom(type)
        || Callable.class.isAssignableFrom(type)
        || Runnable.class.isAssignableFrom(type)
        || LocalDate.class.equals(type)
        || LocalDateTime.class.equals(type)
        || LocalTime.class.equals(type)
        || Date.class.equals(type)
        || File.class.equals(type)
            || field.isAnnotationPresent(Element.class)
            || type.isAnnotationPresent(Element.class);
  }
}
