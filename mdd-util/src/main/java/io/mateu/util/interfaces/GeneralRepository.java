package io.mateu.util.interfaces;

import io.mateu.mdd.shared.interfaces.IResource;
import io.mateu.mdd.shared.interfaces.UserPrincipal;

import java.util.List;

public interface GeneralRepository {

    UserPrincipal findUser(String login);


    IResource getNewResource();

    Translated getNewTranslated();

    UserPrincipal findUserByPasswordResetKey(String key) throws Throwable;

    void setPassword(String key, String value) throws Throwable;

    void createUser(String login, String email, String name, String avatarUrl) throws Throwable;

    void changePassword(String login, String currentPassword, String newPassword) throws Throwable;

    void updateUser(String login, String name, String email, IResource photo) throws Throwable;

    List<IIcon> findAllIcons() throws Throwable;

    UserPrincipal authenticate(String login, String password) throws Throwable;

    void recoverPassword(String login) throws Throwable;

    AuditRecord getNewAudit() throws Throwable;
}
