package io.mateu.mdd.demovb.infra.in.ui.checkout;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import jakarta.validation.constraints.NotEmpty;

public record Cliente(@NotEmpty String name, String email) implements WizardStep {}
