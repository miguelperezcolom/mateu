package io.mateu.mdd.vaadinport.vaadin.components.oldviews;

import io.mateu.mdd.core.reflection.FieldInterfaced;

import java.lang.reflect.InvocationTargetException;

public class JPACollectionFieldCRUDViewComponent extends CRUDViewComponent {

    private final FieldInterfaced field;
    private final IEditorViewComponent evfc;
    private final boolean addingToCollection;

    public JPACollectionFieldCRUDViewComponent(FieldInterfaced field, IEditorViewComponent evfc, boolean addingToCollection) throws IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        super(new JPACollectionFieldViewComponent(field.getGenericClass(), field, evfc, addingToCollection).build(), new EditorViewComponent(field.getGenericClass()).build());
        this.field = field;
        this.evfc = evfc;
        this.addingToCollection = addingToCollection;
    }

    public FieldInterfaced getField() {
        return field;
    }

    public IEditorViewComponent getEvfc() {
        return evfc;
    }

    public boolean isAddingToCollection() {
        return addingToCollection;
    }
}
