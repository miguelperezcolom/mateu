package io.mateu.mdd.demovb.infra.in.ui.checkout;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;

public record Pago(String cardNumber) implements WizardStep {}
