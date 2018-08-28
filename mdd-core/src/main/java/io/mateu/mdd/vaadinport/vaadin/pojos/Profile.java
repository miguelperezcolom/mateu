package io.mateu.mdd.vaadinport.vaadin.pojos;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.annotations.Password;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.interfaces.PersistentPOJO;
import io.mateu.mdd.core.model.authentication.Permission;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.model.common.File;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.EntityManager;
import javax.validation.constraints.NotNull;
import java.io.IOException;

@Getter@Setter
public class Profile implements PersistentPOJO {

    @Ignored
    private UserData userData;

    private File photo;

    private String name;

    private String email;


    @Action(value = "Change password")
    public void changePassword(@NotNull @Password String currentPassword, @NotNull @Password String newPassword, @NotNull @Password String newPasswordAgain) throws Throwable {

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {

                User u = em.find(User.class, userData.getLogin());

                if (!u.checkPassword(currentPassword)) throw new Exception("This is not your current password");

                if (!newPassword.equals(newPasswordAgain)) throw new Exception("New password fieldBuilders must be equal");

                u.setPassword(newPassword);

            }
        });

    }



    @Override
    public void save() throws IOException, Throwable {

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {

                User u = em.find(User.class, userData.getLogin());

                u.setName(getName());

                u.setEmail(getEmail());
                u.setPhoto(getPhoto());

                userData.setName(u.getName());
                userData.setEmail(u.getEmail());
                if (u.getPhoto() != null) userData.setPhoto(u.getPhoto().toFileLocator().getUrl());
                for (Permission p : u.getPermissions()) userData.getPermissions().add(Math.toIntExact(p.getId()));

                MDD.setUserData(userData);

            }
        });


    }

    @Override
    public void load(Object id) throws Throwable {
        userData = (UserData) id;

        Helper.transact(em -> {

            User u = em.find(User.class, userData.getLogin());

            setName(u.getName());

            setEmail(u.getEmail());

            setPhoto(u.getPhoto());

        });

    }

    @Override
    public Object getId() {
        return userData;
    }


    @Override
    public String toString() {
        return "Profile for user " + ((userData != null)?userData.getLogin():"unknown");
    }
}
