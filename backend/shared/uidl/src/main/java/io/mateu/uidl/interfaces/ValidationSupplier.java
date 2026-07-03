package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Validation;
import java.util.List;

/**
 * Supplies extra field {@link Validation}s programmatically, beyond bean-validation annotations.
 * Implement {@link #validations()} to declare the validation rules Mateu applies to the form.
 */
public interface ValidationSupplier {

  List<Validation> validations();
}
