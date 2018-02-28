package io.mateu.ui.mdd.shared;

import io.mateu.ui.core.shared.Data;

/**
 * Created by miguel on 19/4/17.
 */
public class MDDLink extends Data {

    public MDDLink() {

    }

    public MDDLink(Class entityClass, ActionType actionType, Data data) {
        setEntityClassName(entityClass.getName());
        setViewClassName(entityClass.getName());
        setData(data);
        setActionType(actionType);
    }

    public MDDLink(String caption, Class entityClass, ActionType actionType, Data data) {
        setCaption(caption);
        setEntityClassName(entityClass.getName());
        setViewClassName(entityClass.getName());
        setData(data);
        setActionType(actionType);
    }

    public MDDLink(Class entityClass, Class viewClass, Data data) {
        setEntityClassName(entityClass.getName());
        setViewClassName(viewClass.getName());
        setData(data);
        setActionType(ActionType.OPENVIEW);
    }

    public MDDLink(String caption, Class entityClass, Class viewClass, Data data) {
        setCaption(caption);
        setEntityClassName(entityClass.getName());
        setViewClassName(viewClass.getName());
        setData(data);
        setActionType(ActionType.OPENVIEW);
    }


    public String getCaption() {
        return get("_caption");
    }

    public void setCaption(String caption) {
        set("_caption", caption);
    }

    public String getEntityClassName() {
        return get("_entityClassName");
    }

    public void setEntityClassName(String entityClassName) {
        set("_entityClassName", entityClassName);
    }

    public String getViewClassName() {
        return get("_viewClassName");
    }

    public void setViewClassName(String entityClassName) {
        set("_viewClassName", entityClassName);
    }

    public Data getMetaData() {
        return get("_metadata");
    }

    public void setMetaData(Data metaData) {
        set("_metadata", metaData);
    }

    public ActionType getActionType() {
        switch(getString("_actiontype")) {
            case "openeditor": return ActionType.OPENEDITOR;
            case "openlist": return ActionType.OPENLIST;
            case "openview": return ActionType.OPENVIEW;
            default: return ActionType.OPENLIST;
        }
    }

    public void setActionType(ActionType actionType) {
        switch (actionType) {
            case OPENEDITOR: setActionType("openeditor"); break;
            case OPENLIST: setActionType("openlist"); break;
            case OPENVIEW: setActionType("openview"); break;
        }
    }

    public void setActionType(String actionType) {
        set("_actiontype", actionType);
    }

    public Data getData() {
        Data data = get("_data");
        if (data == null) data = new Data();
        return data;
    }

    public void setData(Data data) {
        set("_data", data);
    }
}
