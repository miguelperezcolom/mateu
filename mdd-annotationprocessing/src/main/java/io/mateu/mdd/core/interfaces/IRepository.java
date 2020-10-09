package io.mateu.mdd.core.interfaces;

import java.util.List;

public interface IRepository<T,K> {

    T find(K id);

    List<T> findAll() throws Throwable;

    T save(T object);

    void delete(T object);

    void deleteWithId(K object);

    T find(Object... params);

    List<T> list(Object... params);

    void delete(Object... params);
}
