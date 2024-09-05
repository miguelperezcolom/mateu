package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.Detail;

public record MyReadOnlyPojoWithCrudCrudRow(
        String name, int age, @Detail String longText
) {
}
