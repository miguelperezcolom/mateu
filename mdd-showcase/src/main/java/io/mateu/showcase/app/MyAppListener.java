package io.mateu.showcase.app;

import com.google.common.io.ByteStreams;
import io.mateu.lifecycle.BaseAppContextListener;
import io.mateu.mdd.core.annotations.AppListener;
import io.mateu.mdd.core.model.authentication.*;
import io.mateu.mdd.core.model.common.Resource;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.shared.AppContextListener;
import io.mateu.util.eventBus.EventBus;
import io.mateu.util.persistence.JPAHelper;
import org.example.application.population.Populator;


@AppListener
public class MyAppListener extends BaseAppContextListener implements AppContextListener {

    public MyAppListener() {

    }

    @Override
    public void registerEventConsumers() {
        EventBus.register(new UserCreatedEventConsumer());
    }

    @Override
    public void populate() throws Throwable {

        super.populate();

        Populator.populateAll();

        populateUsers();

    }

    private void populateUsers() throws Throwable {

        JPAHelper.transact(em -> {
            // create super admin permission
            Permission p = new Permission();
            p.setId(1);
            p.setName("Super admin");
            em.persist(p);


            {
                // create user admin
                User u = new AdminUser();
                u.setLogin("admin");
                u.setName("Admin");
                u.setEmail("miguelperezclom@gmail.com");
                u.setStatus(USER_STATUS.ACTIVE);
                u.getPermissions().add(p);
                Resource f;
                u.setPhoto(f = new Resource());
                f.setName("foto-perfil-ejemplo.png");
                f.setBytes(ByteStreams.toByteArray(io.mateu.mdd.core.model.population.Populator.class.getResourceAsStream("/images/" + f.getName())));
                em.persist(f);
                em.persist(u);
                u.setPassword("1");
            }

        });

    }

    @Override
    public boolean isPopulationNeeded() {
        try {
            return JPAHelper.find(AppConfig.class, 1l) == null;
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return true;
    }
}
