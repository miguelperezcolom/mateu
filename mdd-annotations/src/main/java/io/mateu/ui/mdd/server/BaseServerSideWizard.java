package io.mateu.ui.mdd.server;

import com.google.common.base.Strings;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.UserData;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;

public abstract class BaseServerSideWizard extends AbstractServerSideWizard {

    private List<AbstractServerSideWizardPage> pages = new ArrayList<>();


    @Override
    public WizardPageVO execute(UserData user, EntityManager em, String action, Data data) throws Throwable {
        AbstractServerSideWizardPage p = null;
        if (Strings.isNullOrEmpty(action)) {
            if (getPages().size() > 0) p = getPages().get(0);
        } else {
            if (action.startsWith("gotopage_")) {
                int i = Integer.parseInt(action.substring("gotopage_".length()));
                p = getPages().get(i);
            }
        }
        return ERPServiceImpl.getWizardPageVO(user, em, this, p, data);
    }


    public BaseServerSideWizard add(AbstractServerSideWizardPage page) {
        getPages().add(page);
        return this;
    }

    public List<AbstractServerSideWizardPage> getPages() {
        return pages;
    }

    public void setPages(List<AbstractServerSideWizardPage> pages) {
        this.pages = pages;
    }
}
