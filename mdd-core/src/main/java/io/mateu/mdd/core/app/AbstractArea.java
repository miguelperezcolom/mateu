package io.mateu.mdd.core.app;


import com.vaadin.icons.VaadinIcons;

import java.util.List;
import java.util.UUID;

/**
 * Created by miguel on 9/8/16.
 */
public abstract class AbstractArea {

    private final String id = UUID.randomUUID().toString();
    private boolean publicAccess = false;
    private String name;
    private VaadinIcons icon = VaadinIcons.ASTERISK;
    private List<AbstractModule> modules;
    public AbstractAction defaultAction = null;

    public String getStyle() {
        return null;
    }

    public AbstractArea(String name) {
        this.name = name;
    }

    public AbstractArea(String name, boolean publicAccess) {
        this.name = name; this.publicAccess = publicAccess;
    }

    public AbstractArea(VaadinIcons icon, String name) {
        this.icon = icon;
        this.name = name;
    }

    public AbstractArea(VaadinIcons icon, String name, boolean publicAccess) {
        this.icon = icon;
        this.name = name;
        this.publicAccess = publicAccess;
    }

    public String getName() {
        return name;
    }

    public VaadinIcons getIcon() {
        return icon;
    }

    public List<AbstractModule> getModules() {
        if (modules == null) synchronized (this) {
            modules = buildModules();
        }
        return modules;
    }

    public abstract List<AbstractModule> buildModules();

    public boolean isPublicAccess() {
        return publicAccess;
    }

    public void setPublicAccess(boolean publicAccess) {
        this.publicAccess = publicAccess;
    }

    public String getId() {
        return id;
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }

    public AbstractAction getDefaultAction() {
        return defaultAction;
    }

}
