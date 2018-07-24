package io.mateu.mdd.core.app;

import com.google.common.base.Strings;
import io.mateu.mdd.core.data.Data;
import io.mateu.mdd.core.data.FileLocator;
import io.mateu.mdd.core.data.UserData;
import io.mateu.mdd.core.model.authentication.Permission;
import io.mateu.mdd.core.model.authentication.USER_STATUS;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.model.common.File;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.model.population.Populator;
import io.mateu.mdd.core.model.ui.EditedRecord;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.util.JPATransaction;
import io.mateu.mdd.core.util.Utils;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.net.URL;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public abstract class BaseMDDApp extends AbstractApplication {


    public FileLocator upload(String fileName, byte[] bytes, boolean temporary)throws Throwable {

        String id = UUID.randomUUID().toString();
        String extension = ".tmp";
        if (fileName == null || "".equals(fileName.trim())) fileName = "" + id;
        if (fileName.lastIndexOf(".") < fileName.length() - 1) {
            extension = fileName.substring(fileName.lastIndexOf("."));
            fileName = fileName.substring(0, fileName.lastIndexOf("."));
        }

        java.io.File temp = (System.getProperty("tmpdir") == null)? java.io.File.createTempFile(fileName, extension):new java.io.File(new java.io.File(System.getProperty("tmpdir")), fileName + extension);

        System.out.println("java.io.tmpdir=" + System.getProperty("java.io.tmpdir"));
        System.out.println("Temp file : " + temp.getAbsolutePath());

        if (true || !temp.exists()) {
            System.out.println("writing temp file to " + temp.getAbsolutePath());
            Utils.write(temp, bytes);
        } else {
            System.out.println("temp file already exists");
        }

        String baseUrl = System.getProperty("tmpurl");
        URL url = null;
        if (baseUrl == null) {
            url = temp.toURI().toURL();
        } else url = new URL(baseUrl + "/" + temp.getName());


        return new FileLocator(id, temp.getName(), url.toString(), temp.getAbsolutePath());
    }

    public UserData authenticate(String login, String password)throws Throwable {
        if (login == null || "".equals(login.trim()) || password == null || "".equals(password.trim())) throw new Exception("Username and password are required");

        UserData d = new UserData();
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em)throws Throwable {

                if (em.createQuery("select x.login from " + User.class.getName() + " x").getResultList().size() == 0) {
                    Populator.populate(AppConfig.class);
                }

                User u = em.find(User.class, login.toLowerCase().trim());
                if (u != null) {
                    if (u.getPassword() == null) throw new Exception("Missing password for user " + login);
                    if (!Helper.md5(password.toLowerCase().trim()).equalsIgnoreCase(u.getPassword().trim())) throw new Exception("Wrong password");
                    if (USER_STATUS.INACTIVE.equals(u.getStatus())) throw new Exception("Deactivated user");
                    d.setName(u.getName());
                    d.setEmail(u.getEmail());
                    d.setLogin(login);
                    if (u.getPhoto() != null) d.setPhoto(u.getPhoto().toFileLocator().getUrl());
                    for (Permission p : u.getPermissions()) d.getPermissions().add(Math.toIntExact(p.getId()));
                } else throw new Exception("No user with login " + login);
            }
        });

        setUserData(d);

        return d;
    }

    public void forgotPassword(String s) throws Throwable {

    }

    public void changePassword(String login, String oldPassword, String newPassword)throws Throwable {
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em)throws Throwable {
                User u = em.find(User.class, login.toLowerCase().trim());
                if (u != null) {
                    if (!oldPassword.trim().equalsIgnoreCase(u.getPassword().trim())) throw new Exception("Wrong old password");
                    u.setPassword(newPassword);
                } else throw new Exception("No user with login " + login);
            }
        });
    }

    public void updateProfile(String login, String name, String email, FileLocator foto)throws Throwable {
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em)throws Throwable {
                User u = em.find(User.class, login.toLowerCase().trim());
                if (u != null) {
                    u.setName(name);
                    u.setEmail(email);
                } else throw new Exception("No user with login " + login);
            }
        });
    }


    public UserData signUp(String s, String s1, String s2, String s3) throws Throwable {
        return null;
    }

    public String recoverPassword(String s) throws Throwable {
        return null;
    }


    public String getXslfoForListing()throws Throwable {
        String[] s = {""};
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em)throws Throwable {
                s[0] = AppConfig.get(em).getXslfoForList();
            }
        });
        return s[0];
    }


    public void updateFoto(String login, FileLocator fileLocator)throws Throwable {
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em)throws Throwable {
                User u = em.find(User.class, login.toLowerCase().trim());
                if (u != null) {
                    File p = u.getPhoto();
                    if (p == null) {
                        u.setPhoto(p = new File());
                        em.persist(p);
                    }
                    p.setName(fileLocator.getFileName());
                    p.setPath("");
                    p.setBytes(Utils.readBytes(fileLocator.getTmpPath()));
                } else throw new Exception("No user with login " + login);
            }
        });
    }

    public Object selectIdAtPos(String ql, int pos) throws Throwable {
        Object[] id = new Object[1];
        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {
                Query q = em.createQuery(ql);
                q.setFirstResult(pos);
                q.setMaxResults(1);
                List rs = q.getResultList();
                for (Object o : rs) {
                    if (o.getClass().isArray()) {
                        Object[] l = (Object[]) o;
                        id[0] = l[0];
                    } else {
                        id[0] = o;
                    }
                }
            }
        });
        return id[0];
    }



    @Override
    public boolean isLastEditedAvailable() {
        return true;
    }

    @Override
    public void getLastEdited(UserData user, Callback<Data> callback) {
        try {


            Data data = new Data();

            DateTimeFormatter f = DateTimeFormatter.ofPattern("dd/MMM HH:mm:ss");

            List<Data> g = new ArrayList<>();

            if (user != null && !Strings.isNullOrEmpty(user.getLogin())) Helper.transact(new JPATransaction() {
                @Override
                public void run(EntityManager em) throws Throwable {

                    List<EditedRecord> rs = em.createQuery("select x from " + EditedRecord.class.getName() + " x where x.user = :u order by x.id desc").setParameter("u", em.find(User.class, user.getLogin())).setMaxResults(100).getResultList();

                    for (EditedRecord r : rs) {
                        g.add(new Data("id", r.getId(), "url", r.getUri(), "name", r.getName(), "when", r.getWhen().format(f), "icon", r.getIcon()));
                    }

                }
            });

            data.set("records", g);

            callback.onSuccess(data);


        } catch (Throwable e) {
            e.printStackTrace();
            callback.onFailure(e);
        }
    }


    public boolean isOAuthAllowed() {
        return true;
    }
}
