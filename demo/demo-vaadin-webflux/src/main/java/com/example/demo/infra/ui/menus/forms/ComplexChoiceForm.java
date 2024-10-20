package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.data.ComplexKey;
import io.mateu.core.domain.uidefinition.shared.interfaces.ComplexKeyChoice;
import io.mateu.core.domain.uidefinition.shared.interfaces.ComplexKeyOption;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class ComplexChoiceForm {

    @NotNull
    ComplexKeyChoice carrier =
            new ComplexKeyChoice(
                    null,
                    List.of(
                            new ComplexKeyOption(
                                    new ComplexKey(
                                            "Carrier 1",
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "
                                                    + "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim "
                                                    + "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
                                                    + "commodo consequat",
                                            "Payment end date 24.02.2023",
                                            "<b>12,20€</b> / Month"
                                    ),
                                    "1"
                            ),
                            new ComplexKeyOption(
                                    new ComplexKey(
                                            "Carrier 2",
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "
                                                    + "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim "
                                                    + "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
                                                    + "commodo consequat",
                                            "Payment end date 24.02.2023",
                                            "<b>19,10€</b> / Month"
                                    ),
                                    "2"
                            ),
                            new ComplexKeyOption(
                                    new ComplexKey(
                                            "Carrier 3",
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "
                                                    + "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim "
                                                    + "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
                                                    + "commodo consequat",
                                            "Payment end date 24.02.2023",
                                            "<b>24,12€</b> / Month"
                                    ),
                                    "3"
                            ),
                            new ComplexKeyOption(
                                    new ComplexKey(
                                            "Carrier 4",
                                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "
                                                    + "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim "
                                                    + "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
                                                    + "commodo consequat",
                                            "Payment end date 24.02.2023",
                                            "<b>36,00€</b> / Month"
                                    ),
                                    "4"
                            )));

    String assessment;

    @Action(validateBefore = true)
    void assess() {
        assessment = "" + carrier.value();
    }
}
