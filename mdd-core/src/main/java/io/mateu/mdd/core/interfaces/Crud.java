package io.mateu.mdd.core.interfaces;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;

import java.util.Set;

public interface Crud<SearchForm, Row> extends Listing<SearchForm, Row> {

    @Override
    default boolean showCheckboxForSelection() {
        return this instanceof CanDelete;
    }
}
