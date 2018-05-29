package io.mateu.mdd.core.app;


import java.util.List;
import java.util.UUID;

/**
 * Created by miguel on 9/8/16.
 */
public abstract class AbstractArea {

    private String id = UUID.randomUUID().toString();
    private boolean publicAccess = false;
    private String name;
    private List<AbstractModule> modules;

    public AbstractArea(String name) {
        this.name = name;
    }

    public AbstractArea(String name, boolean publicAccess) {
        this.name = name; this.publicAccess = publicAccess;
    }

    public String getName() {
        return name;
    }

    public List<AbstractModule> getModules() {
        if (modules == null) modules = buildModules();
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

    public void setId(String id) {
        this.id = id;
    }

    @Override
    public int hashCode() {
        return getId().hashCode();
    }
}
