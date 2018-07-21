package io.mateu.mdd.vaadinport.vaadin.pojos;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.interfaces.PMO;
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
public class Profile implements PMO {

    @Ignored
    private UserData userData;

    private File foto;

    private String name;

    private String email;


    @Action(name = "Change password")
    public void changePassword(@NotNull String currentPassword, @NotNull String newPassword, @NotNull String newPasswordAgain) throws Throwable {

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {

                User u = em.find(User.class, userData.getLogin());

                if (!u.checkPassword(currentPassword)) throw new Exception("This is not your current password");

                if (!newPassword.equals(newPasswordAgain)) throw new Exception("New password fields must be equal");

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

            }
        });


    }

    @Override
    public void load(Object id) throws Throwable {
        userData = (UserData) id;

        setName(userData.getName());

        setEmail(userData.getEmail());
    }

    @Override
    public Object getId() {
        return userData;
    }


}
