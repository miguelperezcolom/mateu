package io.mateu.mdd.shared.interfaces;

import com.vaadin.icons.VaadinIcons;

/**
 * Created by miguel on 9/8/16.
 */
public interface MenuEntry {

    VaadinIcons getIcon();

    String getCaption();

    String getId();

    int getOrder();
}
