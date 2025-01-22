package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.uidl.annotations.Element;
import io.mateu.uidl.data.ExternalReference;
import io.mateu.uidl.data.IconChooser;
import io.mateu.uidl.data.TelephoneNumber;
import io.mateu.uidl.data.VGap;
import io.mateu.uidl.interfaces.ComplexKeyChoice;
import java.io.File;
import java.math.BigDecimal;
import java.net.URL;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collection;
import java.util.Date;
import java.util.concurrent.Callable;
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
        || IconChooser.class.isAssignableFrom(type)
        || Callable.class.isAssignableFrom(type)
        || Runnable.class.isAssignableFrom(type)
        || LocalDate.class.equals(type)
        || LocalDateTime.class.equals(type)
        || LocalTime.class.equals(type)
        || Date.class.equals(type)
        || BigDecimal.class.equals(type)
        || VGap.class.equals(type)
        || File.class.equals(type)
        || URL.class.equals(type)
        || ComplexKeyChoice.class.equals(type)
        || field.isAnnotationPresent(Element.class)
        || type.isAnnotationPresent(Element.class);
  }
}
