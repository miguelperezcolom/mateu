package io.mateu.mdd.core.interfaces;

public interface CanSelect<Row> {

    Object getSelectedRowForm(Row row) throws Throwable;

}
