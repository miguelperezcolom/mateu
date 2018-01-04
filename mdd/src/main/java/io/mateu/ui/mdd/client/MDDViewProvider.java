package io.mateu.ui.mdd.client;

import com.google.auto.service.AutoService;
import com.google.common.base.Strings;
import com.google.common.io.BaseEncoding;
import io.mateu.ui.core.client.app.MateuUI;
import io.mateu.ui.core.client.views.AbstractCRUDView;
import io.mateu.ui.core.client.views.AbstractEditorView;
import io.mateu.ui.core.client.views.AbstractView;
import io.mateu.ui.core.client.views.CRUDListener;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.ViewProvider;
import io.mateu.ui.mdd.server.ERPServiceImpl;

import java.lang.reflect.Constructor;


@AutoService(ViewProvider.class)
public class MDDViewProvider implements ViewProvider {
    @Override
    public String getViewName(String viewAndParameters) {
        System.out.println("MDDViewProvider.getViewName(" + viewAndParameters + ")");
        if (viewAndParameters == null || !viewAndParameters.startsWith("mdd..")) return null;
        String p = viewAndParameters;
        if (p.contains("?")) p = p.substring(0, p.indexOf("?"));
        if (p.contains("/")) p = p.substring(0, p.indexOf("/"));
        return p;
    }

    @Override
    public AbstractView getView(String viewName) {
        System.out.println("MDDViewProvider.getView(" + viewName + ")");


        MDDJPACRUDView view =null;
        try {

            if (!Strings.isNullOrEmpty(viewName)) {


                if (viewName.startsWith("mdd..")) viewName = viewName.replaceFirst("mdd\\.\\.", "");

                String[] t = viewName.split("\\.\\.");
                String ed = t[0];
                String qf = (t.length > 1)?new String(BaseEncoding.base64().decode(t[1])):null;


                view = new MDDJPACRUDView(new ERPServiceImpl().getMetaData(MateuUI.getApp().getUserData(), ed, qf));

                if (t.length > 2) {
                    return view.getNewEditorView();
                }

                if (view instanceof AbstractCRUDView) {
                    ((AbstractCRUDView) view).addListener(new CRUDListener() {
                        @Override
                        public void openEditor(AbstractEditorView e) {
                            MateuUI.openView(e);
                        }
                    });
                }

            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return view;
    }

}
