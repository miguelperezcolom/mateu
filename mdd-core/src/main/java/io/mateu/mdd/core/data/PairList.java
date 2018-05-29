package io.mateu.mdd.core.data;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by miguel on 4/1/17.
 */
public class PairList {

    private List<Pair> values = new ArrayList<>();

    public PairList(PairList l) {
        values.addAll(l.getValues());
    }

    public PairList() {

    }

    public PairList(Object... args) {
        int pos = 0;
        Object x = null;
        for (Object o : args) {
            if (pos++ % 2 == 0) x = o;
            else values.add(new Pair(x, (String) o));
        }
    }


    public List<Pair> getValues() {
        return values;
    }

    public void setValues(List<Pair> values) {
        this.values = values;
    }

    @Override
    public String toString() {
        StringBuffer sb = new StringBuffer();
        sb.append("[");
        boolean primero = true;
        for (Pair p : getValues()) {
            if (primero) primero = false;
            else sb.append(", ");
            sb.append(p);
        }
        sb.append("]");
        return sb.toString();
    }
}
