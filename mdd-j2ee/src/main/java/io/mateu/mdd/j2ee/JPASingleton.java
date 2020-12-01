package io.mateu.mdd.j2ee;

import io.mateu.util.IJPAHelper;
import io.mateu.util.persistence.JPAHelper;

import javax.annotation.PostConstruct;
import javax.ejb.Singleton;
import javax.enterprise.inject.Default;
import javax.enterprise.inject.Instance;
import javax.inject.Inject;
import javax.inject.Named;

@Singleton
public class JPASingleton {

    @PostConstruct
    public void post() {
        //JPAHelper.set(ejb.get());
    }

    //@Inject@Named
    //Instance<IJPAHelper> ejb;

}
