package io.mateu.mdd.core.model.population;

import com.google.common.base.Charsets;
import com.google.common.base.Strings;
import com.google.common.io.ByteStreams;
import com.google.common.io.Resources;
import io.mateu.mdd.core.interfaces.IPopulator;
import io.mateu.mdd.core.model.authentication.AdminUser;
import io.mateu.mdd.core.model.authentication.Permission;
import io.mateu.mdd.core.model.authentication.USER_STATUS;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.model.common.Resource;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.model.config.TemplateUseCase;
import io.mateu.mdd.core.model.util.Constants;
import io.mateu.mdd.shared.AppConfigLocator;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.JPAHelper;
import io.mateu.mdd.util.persistence.JPATransaction;
import lombok.extern.slf4j.Slf4j;

import java.io.InputStream;

/**
 * used to populate a database with initial values
 *
 * Created by miguel on 13/9/16.
 */
@Slf4j
public class Populator implements IPopulator {

    public static final String USER_ADMIN = "admin";

    public static void main(String... args) throws Throwable {

        new Populator().populate(AppConfig.class);

    }

    @Override
    public void populate() throws Throwable {
        populate(Helper.getImpl(AppConfigLocator.class).getClass());
    }

    public void populate(Class appConfigClass) throws Throwable {

        log.debug("Populating database...");


        //authentication
        JPAHelper.transact((JPATransaction) (em)->{

            AppConfig c = (AppConfig) appConfigClass.newInstance();
            c.setId(1);
            c.setXslfoForList(Resources.toString(Resources.getResource(appConfigClass, "/xsl/listing.xsl"), Charsets.UTF_8));
            c.setXslfoForObject(Resources.toString(Resources.getResource(appConfigClass, "/xsl/object.xsl"), Charsets.UTF_8));
            em.persist(c);

            //c.createDummyDates();

            {
                TemplateUseCase tuc = new TemplateUseCase();
                tuc.setName("User");
                em.persist(tuc);
            }


            // create super admin permission
            Permission p = new Permission();
            p.setId(1);
            p.setName("Super admin");
            em.persist(p);


            {
                // create user admin
                User u = new AdminUser();
                u.setLogin(USER_ADMIN);
                u.setName("Admin");
                u.setEmail("miguelperezclom@gmail.com");
                u.setStatus(USER_STATUS.ACTIVE);
                u.getPermissions().add(p);
                Resource f;
                u.setPhoto(f = new Resource());
                f.setName("foto-perfil-ejemplo.png");
                f.setBytes(ByteStreams.toByteArray(Populator.class.getResourceAsStream("/images/" + f.getName())));
                em.persist(f);
                em.persist(u);
                u.setPassword("1");
            }

            {
                // create user admin
                User u = new AdminUser();
                u.setLogin(Constants.SYSTEM_USER_LOGIN);
                u.setName("System");
                u.setEmail("miguelperezclom@gmail.com");
                u.setStatus(USER_STATUS.ACTIVE);
                u.getPermissions().add(p);
                em.persist(u);
                u.setPassword("1");
            }

            {
                // create user admin
                User u = new AdminUser();
                u.setLogin(Constants.IMPORTING_USER_LOGIN);
                u.setName("Importing User");
                u.setEmail("miguelperezclom@gmail.com");
                u.setStatus(USER_STATUS.ACTIVE);
                u.getPermissions().add(p);
                em.persist(u);
                u.setPassword("1");
            }

        });

        // multilanguage


        createViews();

        log.debug("Database populated.");

    }

    private static void createViews() throws Throwable {
        JPAHelper.transact(em -> {
            InputStream r = Populator.class.getResourceAsStream("/sql/vistas.sql");

            if (r != null) {
                String s = Helper.leerFichero(r);
                if (s != null) {
                    for (String t : s.split(";")) {
                        t = t.trim();
                        String sql = "";
                        for (String l : t.split("\n")) {
                            String lx = l.trim();
                            if (!Strings.isNullOrEmpty(lx) && !lx.startsWith("--") && !lx.startsWith("#") && !lx.startsWith("//")) {
                                try {
                                    if ("".equals(sql)) sql += "\n";
                                    sql += l;
                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                            }
                        }
                        if (!Strings.isNullOrEmpty(sql)) {
                            try {
                                log.debug("executing sql:" + sql);
                                em.createNativeQuery(sql).executeUpdate();
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    }
                }
            }
        });
    }

}
