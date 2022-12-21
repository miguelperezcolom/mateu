package io.mateu.mdd.vaadin.pojos;

import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.NonDuplicable;
import io.mateu.mdd.shared.annotations.Password;
import io.mateu.mdd.shared.data.URLResource;
import io.mateu.mdd.shared.interfaces.IResource;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.util.Helper;
import io.mateu.util.interfaces.GeneralRepository;
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
    public void changePassword(@NotNull @Password String currentPassword,
                               @NotNull @Password String newPassword,
                               @NotNull @Password String newPasswordAgain) throws Throwable {

        if (!newPassword.equals(newPasswordAgain))
            throw new Exception("New password fieldBuilders must be equal");

        GeneralRepository repo = Helper.getImpl(GeneralRepository.class);
        repo.changePassword(MDDUIAccessor.getCurrentUser().getLogin(), currentPassword, newPassword);

    }



    @Override
    public void save() throws IOException, Throwable {

        GeneralRepository repo = Helper.getImpl(GeneralRepository.class);
        repo.updateUser(MDDUIAccessor.getCurrentUser().getLogin(), getName(), getEmail(), getPhoto());

    }

    @Override
    public void load(Object id) throws Throwable {

        UserPrincipal u = MDDUIAccessor.getCurrentUser();

        setName(u.getName());
        setEmail(u.getEmail());
        setPhoto(u.getPhoto() != null?new URLResource(u.getPhoto()):null);

    }

    @Override
    public Object getId() {
        return MDDUIAccessor.getCurrentUser().getLogin();
    }


    @Override
    public String toString() {
        return "Profile for user " + (MDDUIAccessor.getCurrentUserLogin() != null?
                MDDUIAccessor.getCurrentUserLogin():"unknown");
    }
}
