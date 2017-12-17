package io.mateu.ui.mdd.server.interfaces;

public interface Converter<T, Z> {

    public Z load(T from);

    public T save(Z from);


}
