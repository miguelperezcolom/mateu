package io.mateu.mdd.demovb.infra.in.ui.checkout;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;

public record Envio(String address, String city) implements WizardStep {}
