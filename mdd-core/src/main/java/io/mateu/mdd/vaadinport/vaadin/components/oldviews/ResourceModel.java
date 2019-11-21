package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import io.mateu.mdd.core.model.common.Resource;

public class ResourceModel {

    private Resource resource;

    public Resource getResource() {
        return resource;
    }

    public void setResource(Resource resource) {
        this.resource.setType(resource.getType());
        this.resource.setName(resource.getName());
        this.resource.setBytes(resource.getBytes());
        this.resource.setPath(resource.getPath());
    }

    public ResourceModel(Resource original) {
        this.resource = original;
    }
}
