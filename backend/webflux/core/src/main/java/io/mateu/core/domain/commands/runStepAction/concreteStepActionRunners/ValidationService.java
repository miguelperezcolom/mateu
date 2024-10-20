package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.util.stream.Collectors;
import org.hibernate.validator.messageinterpolation.ParameterMessageInterpolator;
import org.springframework.stereotype.Service;

@Service
public class ValidationService {

  private final Validator validator =
      Validation.byDefaultProvider()
          .configure()
          .messageInterpolator(new ParameterMessageInterpolator())
          .buildValidatorFactory()
          .getValidator();

  public void validate(Object bean) throws Exception {
    var violations = validator.validate(bean);
    if (!violations.isEmpty()) {
      var msg =
          violations.stream().map(ConstraintViolation::getMessage).collect(Collectors.joining(","));
      throw new Exception(msg);
    }
  }
}
