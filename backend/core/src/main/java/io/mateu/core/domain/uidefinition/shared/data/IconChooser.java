package io.mateu.core.domain.uidefinition.shared.data;

import io.mateu.core.domain.uidefinition.core.interfaces.Icon;

public class IconChooser {

    private Icon icon;

    public IconChooser() {
    }

    public IconChooser(Icon icon) {
        this.icon = icon;
    }

    public Icon getIcon() {
        return icon;
    }
}
