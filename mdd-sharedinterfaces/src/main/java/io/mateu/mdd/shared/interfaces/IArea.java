package io.mateu.mdd.shared.interfaces;

import com.vaadin.icons.VaadinIcons;

public interface IArea {
    boolean isPublicAccess();

    IModule[] getModules();

    String getName();

    VaadinIcons getIcon();
}
