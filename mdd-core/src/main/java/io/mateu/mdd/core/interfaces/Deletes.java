package io.mateu.mdd.core.interfaces;

import java.util.Set;

public interface Deletes<Row> {

    void delete(Set<Row> selection) throws Throwable;

}
