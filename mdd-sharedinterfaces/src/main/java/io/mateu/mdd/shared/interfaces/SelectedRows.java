package io.mateu.mdd.shared.interfaces;

import java.util.List;

public class SelectedRows {

    private static ThreadLocal<List> rows = new ThreadLocal<>();

    public SelectedRows(List rows) {
        this.rows.set(rows);
    }

    public SelectedRows() {
    }

    public List getRows() {
        return rows.get();
    }

    public void setRows(List rows) {
        this.rows.set(rows);
    }
}
