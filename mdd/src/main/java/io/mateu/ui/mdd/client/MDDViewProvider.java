package io.mateu.ui.mdd.client;

import com.google.auto.service.AutoService;
import com.google.common.base.Charsets;
import com.google.common.base.Strings;
import com.google.common.io.BaseEncoding;
import io.mateu.ui.core.client.app.*;
import io.mateu.ui.core.client.views.*;
import io.mateu.ui.core.shared.Data;
import io.mateu.ui.core.shared.MiViewProvider;
import io.mateu.ui.core.shared.ViewProvider;
import io.mateu.ui.mdd.server.ERPServiceImpl;

import java.lang.reflect.Constructor;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;


@AutoService(ViewProvider.class)
public class MDDViewProvider implements ViewProvider {


    @Override
    public String getViewName(String viewAndParameters) {
        System.out.println("MiViewProvider.getViewName(" + viewAndParameters + ")");
        if (viewAndParameters == null) return null;

        Map<Object, Object> data = MiViewProvider.parse(viewAndParameters);

        // el siguiente elemento lo utilizamos para saber si es nuestro
        String selector = (String) data.get("selector");
        if (selector != null) {
            if (!selector.equals("mdd")) return null;
            else return viewAndParameters;
        } else return null;
    }

    @Override
    public AbstractView getView(String viewName) {
        System.out.println("MDDViewProvider.getView(" + viewName + ")");

        MDDJPACRUDView view =null;

        Map<Object, Object> data = MiViewProvider.parse(viewName);



        try {

            String selector = (String) data.get("selector");

            if (!Strings.isNullOrEmpty(selector)) {

                if ("mdd".equals(selector)) {

                    Object o = null;

                    String vn = (String) data.get("resto");
                    if (vn.startsWith("/")) vn = vn.substring(1);
                    String parametros = "";
                    if (vn.contains("?")) {
                        parametros = vn.substring(vn.indexOf("?") + 1);
                        vn = vn.substring(0, vn.indexOf("?"));
                    }
                    if (vn.contains("/")) {
                        parametros = vn.substring(vn.indexOf("/") + 1);
                        vn = vn.substring(0, vn.indexOf("/"));
                    }

                    String[] t = vn.split("\\.\\.", -1);
                    String ed = t[0];
                    String vd = t[1];
                    String qf = (!Strings.isNullOrEmpty(t[2]))?new String(BaseEncoding.base64().decode(t[2]), Charsets.UTF_8):null;
                    String jsonDatosIniciales = (!Strings.isNullOrEmpty(t[3]))?new String(BaseEncoding.base64().decode(t[3]), Charsets.UTF_8):null;




                    view = new MDDJPACRUDView(new ERPServiceImpl().getMetaData(MateuUI.getApp().getUserData(), ed, vd, qf));

                    view.setGranted(data.get("area") != null && data.get("menu") != null);

                    if (vn.endsWith("edit")) {

                        String s = parametros;
                        Object id = null;
                        if (!Strings.isNullOrEmpty(s)) {
                            if (s.startsWith("s")) id = s.substring(1);
                            else if (s.startsWith("l")) id = Long.parseLong(s.substring(1));
                            else if (s.startsWith("i")) id = Integer.parseInt(s.substring(1));
                        }

                        return view.getNewEditorView((jsonDatosIniciales != null)?new Data(jsonDatosIniciales):null).setInitialId(id);
                    } else {
                        view.setParametros(parametros);
                    }

                    if (view instanceof AbstractCRUDView) {
                        ((AbstractCRUDView) view).addListener(new CRUDListener() {
                            @Override
                            public void openEditor(AbstractEditorView e, boolean inNewTab) {
                                MateuUI.openView(e, inNewTab);
                            }
                        });
                    }

                }

            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        if (view != null) {
            view.setArea((AbstractArea) data.get("area"));
            view.setMenu((MenuEntry) data.get("menu"));
        }

        return view;
    }


    public static void main(String[] args) {
        System.out.println(Arrays.toString("com.quonext.quoon.platform.model.product.hotel.Hotel..com.quonext.quoon.platform.backoffice.hotel.views.HotelsView....".split("\\.\\.", -1)));
    }

}
