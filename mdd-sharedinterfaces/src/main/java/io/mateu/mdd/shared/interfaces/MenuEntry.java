package io.mateu.mdd.shared.interfaces;

/**
 * Created by miguel on 9/8/16.
 */
public interface MenuEntry {

    String getIcon();

    String getCaption();

    String getId();

    void setId(String id);

    int getOrder();
}
