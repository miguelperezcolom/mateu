package io.mateu.mdd.core.data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class GridData<T> implements Serializable {

    private List<T> data = new ArrayList<>();
    private int offset;
    private int totalLength;

    public GridData() {

    }

    public GridData(List<T> data) {
        super();
        this.data = data;
        this.offset = 0;
        this.totalLength = (data != null)?data.size():0;
    }


    public GridData(List<T> data, int offset, int totalLength) {
        super();
        this.data = data;
        this.offset = offset;
        this.totalLength = totalLength;
    }

    public List<T> getData() {
        return data;
    }

    public void setData(List<T> data) {
        this.data = data;
    }

    public int getOffset() {
        return offset;
    }

    public void setOffset(int offset) {
        this.offset = offset;
    }

    public int getTotalLength() {
        return totalLength;
    }

    public void setTotalLength(int totalLength) {
        this.totalLength = totalLength;
    }


    public Data asData() {
        Data data = new Data();
        data.set("_offset", getOffset());
        data.set("_totalLength", getTotalLength());
        data.set("_data", getData());
        return data;
    }
}
