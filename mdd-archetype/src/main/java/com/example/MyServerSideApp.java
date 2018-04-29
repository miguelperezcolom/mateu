package com.example;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.mateu.ui.core.server.BaseServerSideApp;
import io.mateu.ui.core.shared.FileLocator;
import io.mateu.ui.core.shared.UserData;

import javax.sql.DataSource;

public class MyServerSideApp extends BaseServerSideApp {
    @Override
    public DataSource getJdbcDataSource() throws Throwable {
        return null;
    }

    @Override
    public UserData authenticate(String login, String password) throws Throwable {
        if (Strings.isNullOrEmpty(login)) throw new Exception("Login is mandatory");
        if (Strings.isNullOrEmpty(password)) throw new Exception("Password is mandatory");
        login = login.toLowerCase().trim();
        password = password.toLowerCase().trim();
        if (!"demo".equals(login)) throw new Exception("Only user demo is allowed");
        if (!"1".equals(password)) throw new Exception("Wrong password. Must be 1");
        UserData d = new UserData();
        d.setLogin(login);
        d.setEmail("miguelperezclom@gmail.com");
        d.setName("Miguel Pérez");
        d.setPreferredLanguage("es");
        d.setPermissions(Lists.newArrayList(1));
        d.setPhoto("https://st-listas.20minutos.es/images/2016-05/411064/4977469_640px.jpg?1464218515");
        return d;
    }

    @Override
    public void forgotPassword(String s) throws Throwable {
        throw new Exception("Please fill this functionality.");
    }

    @Override
    public void changePassword(String s, String s1, String s2) throws Throwable {
        throw new Exception("Please fill this functionality.");
    }

    @Override
    public void updateProfile(String s, String s1, String s2, FileLocator fileLocator) throws Throwable {
        throw new Exception("Please fill this functionality.");
    }

    @Override
    public UserData signUp(String s, String s1, String s2, String s3) throws Throwable {
        throw new Exception("Please fill this functionality.");
    }

    @Override
    public String recoverPassword(String s) throws Throwable {
        throw new Exception("Please fill this functionality.");
    }

    @Override
    public void updateFoto(String s, FileLocator fileLocator) throws Throwable {
        throw new Exception("Please fill this functionality.");
    }
}
