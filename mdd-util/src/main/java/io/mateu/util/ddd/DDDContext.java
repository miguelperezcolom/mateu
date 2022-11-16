package io.mateu.util.ddd;

import javax.persistence.EntityManager;

public class DDDContext {

    private final EntityManager em;

    public DDDContext(EntityManager em) {
        this.em = em;
    }


    public <T> T getRepo(Class<T> type) throws Throwable {
        Class c = Class.forName(type.getName() + "Impl");
        T i = (T) c.getConstructor(EntityManager.class).newInstance(em);
        return i;
    }

}
