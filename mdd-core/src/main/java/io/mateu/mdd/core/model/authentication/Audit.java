package io.mateu.mdd.core.model.authentication;

import io.mateu.mdd.core.interfaces.AuditRecord;
import lombok.Getter;
import lombok.Setter;
import org.eclipse.persistence.annotations.Index;

import javax.persistence.Embeddable;
import javax.persistence.EntityManager;
import javax.persistence.ManyToOne;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Created by miguel on 19/1/17.
 */
@Embeddable
@Getter@Setter
public class Audit implements AuditRecord {

    public Audit() {

    }

    public Audit(User u) {
        this.createdBy = u;
        this.modifiedBy = u;
        this.created = LocalDateTime.now();
        this.modified = LocalDateTime.now();
    }

    @ManyToOne
    private User createdBy;

    @Index
    private LocalDateTime created = LocalDateTime.now();

    @ManyToOne
    private User modifiedBy;

    @Index
    private LocalDateTime modified;


    @Override
    public String toString() {

        DateTimeFormatter f = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        String s = "";
        String s1 = "";
        if (getCreatedBy() != null) s1 += "by " + getCreatedBy().getLogin();
        if (getCreated() != null) s1 += (("".equals(s1))?"":" ") + getCreated().format(f);
        String s2 = "";
        if (getModifiedBy() != null) s2 += "by " + getModifiedBy().getLogin();
        if (getModified() != null) s2 += (("".equals(s1))?"":" ") + getModified().format(f);

        if (!"".equals(s1)) s += "Created " + s1;
        if (!"".equals(s2)){
            if ("".equals(s)) s += "Modified ";
            else s += ", modified ";
            s += s2;
        }

        return s;
    }

    @Override
    public void touch(EntityManager em, String login) {
        if (login != null && !"".equals(login)) {
            User u = em.find(User.class, login);
            setModifiedBy(u);
            if (getCreatedBy() == null) setCreatedBy(u);
        }
        if (getCreated() == null) setCreated(LocalDateTime.now());
        setModified(LocalDateTime.now());
    }

    public void touch(User user) {
        setModifiedBy(user);
        if (getCreatedBy() == null) setCreatedBy(user);

        if (getCreated() == null) setCreated(LocalDateTime.now());
        setModified(LocalDateTime.now());
    }
}
