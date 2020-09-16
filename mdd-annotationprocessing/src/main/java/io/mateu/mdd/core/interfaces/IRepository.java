package io.mateu.mdd.core.interfaces;

import java.util.List;

public interface IRepository<T,K> {

    T find(K id);

    List<T> findAll();

    T save(T object);

    void remove(T object);
}
