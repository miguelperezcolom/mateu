package io.mateu.mdd.core.model.authentication;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.shared.interfaces.UserPrincipal;
import io.mateu.mdd.shared.ui.MDDUIAccessor;
import io.mateu.util.interfaces.AuditRecord;
import io.mateu.util.persistence.JPAHelper;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Embeddable;
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

    private LocalDateTime created = LocalDateTime.now();

    @ManyToOne
    private User modifiedBy;

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
    public void touch() throws Throwable {
        UserPrincipal p = MDDUIAccessor.getCurrentUser();
        if (p != null) {
            User u = JPAHelper.find(User.class, p.getLogin());
            setModifiedBy(u);
            if (getCreatedBy() == null) setCreatedBy(u);
        }
        if (getCreated() == null) setCreated(LocalDateTime.now());
        setModified(LocalDateTime.now());
    }

}
