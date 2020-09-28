package io.mateu.mdd.vaadinport.vaadin.pojos;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.NonDuplicable;
import io.mateu.mdd.shared.annotations.Password;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.util.Helper;
import io.mateu.util.interfaces.GeneralRepository;
import io.mateu.util.interfaces.IResource;
import io.mateu.util.interfaces.UserPrincipal;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import java.io.IOException;

@Getter@Setter@NonDuplicable
public class Profile implements PersistentPojo {

    private IResource photo;

    private String name;

    private String email;


    @Action(value = "Change password")
    public void changePassword(@NotNull @Password String currentPassword, @NotNull @Password String newPassword, @NotNull @Password String newPasswordAgain) throws Throwable {

        if (!newPassword.equals(newPasswordAgain)) throw new Exception("New password fieldBuilders must be equal");

        GeneralRepository repo = Helper.getImpl(GeneralRepository.class);
        repo.changePassword(MDD.getCurrentUser().getLogin(), currentPassword, newPassword);

    }



    @Override
    public void save() throws IOException, Throwable {

        GeneralRepository repo = Helper.getImpl(GeneralRepository.class);
        repo.updateUser(MDD.getCurrentUser().getLogin(), getName(), getEmail(), getPhoto());

    }

    @Override
    public void load(Object id) throws Throwable {

        UserPrincipal u = MDD.getCurrentUser();

        setName(u.getName());
        setEmail(u.getEmail());
        setPhoto(u.getPhoto());

    }

    @Override
    public Object getId() {
        return MDD.getCurrentUser().getLogin();
    }


    @Override
    public String toString() {
        return "Profile for user " + (MDD.getCurrentUserLogin() != null?MDD.getCurrentUserLogin():"unknown");
    }
}
