package io.mateu.mdd.shared.reflection;

public interface FieldBuilderProvider {

    IFieldBuilder getFieldBuilder(FieldInterfaced field);

}
