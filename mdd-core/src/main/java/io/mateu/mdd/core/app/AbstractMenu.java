package io.mateu.mdd.core.app;

import com.vaadin.icons.VaadinIcons;

import java.util.List;
import java.util.UUID;

/**
 * Created by miguel on 9/8/16.
 */
public abstract class AbstractMenu implements MenuEntry {

    private final String id = UUID.randomUUID().toString();

    private VaadinIcons icon;
    private String name;
    private List<MenuEntry> entries;

    public AbstractMenu(String name) {
        this.name = name;
    }

    public AbstractMenu(VaadinIcons icon, String name) {
        this.icon = icon;
        this.name = name;
    }

    public String getCaption() {
        return name;
    }

    public List<MenuEntry> getEntries() {
        if (entries == null) synchronized (this) {
            entries = buildEntries();
        }
        return entries;
    }

    public abstract List<MenuEntry> buildEntries();

    @Override
    public int hashCode() {
        return id.hashCode();
    }

    public String getId() {
        return id;
    }

    @Override
    public VaadinIcons getIcon() {
        return icon;
    }
}
