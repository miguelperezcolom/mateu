package io.mateu.remote.domain.editors;

import io.mateu.util.Helper;
import io.mateu.util.Serializer;

import java.util.Map;

public class EntityEditor {

    private Class entityClass;
    private Map<String, Object> data;

    public EntityEditor(Object entity) throws Exception {
        this.entityClass = entity.getClass();
        this.data = Serializer.toMap(entity);
    }

    public EntityEditor() {
    }



    public void setEntityClass(Class entityClass) {
        this.entityClass = entityClass;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }

    public Class getEntityClass() {
        return entityClass;
    }

    public Map<String, Object> getData() {
        return data;
    }
}
