package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class ValidationService {

    public void validate(Object bean) throws Exception {
        Validator validator;
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
        var violations = validator.validate(bean);
        if (!violations.isEmpty()) {
            var msg = violations.stream().map(v -> v.getMessage()).collect(Collectors.joining(","));
            throw new Exception(msg);
        }
    }

}
