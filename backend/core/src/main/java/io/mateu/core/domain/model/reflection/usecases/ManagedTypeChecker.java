package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.shared.annotations.Button;
import io.mateu.core.domain.uidefinition.shared.annotations.UseCrud;
import io.mateu.core.domain.uidefinition.shared.data.ExternalReference;
import io.mateu.core.domain.uidefinition.shared.data.TelephoneNumber;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import org.springframework.stereotype.Service;

import javax.swing.*;
import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.concurrent.Callable;

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
            ;
  }

}
