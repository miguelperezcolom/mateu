package io.mateu.uidl.data;

public record Binding(BindingSource source, String propertyId) {

    public Binding(String propertyId) {
        this(BindingSource.componentData, propertyId);
    }

    @Override
    public BindingSource source() {
        return source != null?source:BindingSource.componentData;
    }

}
