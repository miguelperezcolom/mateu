package io.mateu.mdd.model.population;

import com.google.common.base.Charsets;
import com.google.common.io.Resources;
import io.mateu.mdd.model.authentication.Permission;
import io.mateu.mdd.model.authentication.USER_STATUS;
import io.mateu.mdd.model.authentication.User;
import io.mateu.mdd.model.config.AppConfig;
import io.mateu.mdd.model.finnancials.Currency;
import io.mateu.ui.core.server.BaseServiceImpl;
import io.mateu.ui.mdd.server.util.Helper;
import io.mateu.ui.mdd.server.util.JPATransaction;

public class Populator {

    public static final String USER_ADMIN = "admin";


    public static void populate() throws Throwable {

        System.out.println("Populating database...");


        //authentication
        Helper.transact((JPATransaction) (em)->{

            AppConfig c = new AppConfig();
            c.setId(1);
            em.persist(c);

            c.createDummyDates();


            // create super admin permission
            Permission p = new Permission();
            p.setId(1);
            p.setName("Super admin");
            em.persist(p);


            {
                // create user admin
                User u = new User();
                u.setLogin(USER_ADMIN);
                u.setName("Admin");
                //u.setPassword(Helper.md5("1"));
                u.setPassword("1");
                u.setStatus(USER_STATUS.ACTIVE);
                u.getPermissions().add(p);
                em.persist(u);
            }

            {
                // create user admin
                User u = new User();
                u.setLogin("system");
                u.setName("System");
                //u.setPassword(Helper.md5("1"));
                u.setPassword("1");
                u.setStatus(USER_STATUS.ACTIVE);
                u.getPermissions().add(p);
                em.persist(u);
            }

            {
                // create user admin
                User u = new User();
                u.setLogin("importing");
                u.setName("Importing User");
                //u.setPassword(Helper.md5("1"));
                u.setPassword("1");
                u.setStatus(USER_STATUS.ACTIVE);
                u.getPermissions().add(p);
                em.persist(u);
            }


            {
                Currency eur = new Currency();
                em.persist(eur);
                eur.setIsoCode("EUR");
                eur.setIso4217Code("1234");
                eur.setDecimals(2);
                em.persist(eur);
            }



        });

        // multilanguage


        System.out.println("Database populated.");



    }
}
