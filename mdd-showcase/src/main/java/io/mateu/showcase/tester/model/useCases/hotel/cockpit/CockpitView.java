package io.mateu.showcase.tester.model.useCases.hotel.cockpit;

import com.google.common.base.Strings;
import com.vaadin.data.Binder;
import com.vaadin.data.TreeData;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.data.provider.TreeDataProvider;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.shared.ui.slider.SliderOrientation;
import com.vaadin.ui.*;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.CSS;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.ExpandOnOpen;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.HasActions;
import io.mateu.mdd.util.Helper;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDate;
import java.util.*;

@ExpandOnOpen
public class CockpitView extends VerticalLayout implements HasActions {

    private final HorizontalLayout mhl;
    private final Panel mlp;
    private final Grid<Fila> g;
    private TextField filtro;
    private CheckBoxGroup<String> ver;
    private CheckBoxGroup<String> avisos;
    private Slider minVal;
    private Slider maxVal;
    private VerticalLayout filtros;
    private HorizontalLayout parametros;
    private Component mes;
    private RadioButtonGroup<String> nivel;
    private CheckBoxGroup<String> detalle;

    public CockpitView() {
        addStyleName(CSS.NOPADDING);

        addStyleName("cockpit");

        setSizeFull();

        addComponent(crearParametros());

        g = crearTreeGrid();
        HorizontalLayout hl = mhl = new HorizontalLayout(crearFiltros(), g, mlp = new Panel());
        mlp.setWidth("400px");
        mlp.addStyleName("detalle");
        mlp.addStyleName(ValoTheme.PANEL_BORDERLESS);
        mlp.setVisible(false);
        hl.addStyleName(CSS.NOPADDING);
        hl.setExpandRatio(g, 1);
        hl.setSizeFull();
        addComponentsAndExpand(hl);

    }

    private Component crearFiltros() {

        filtros = new VerticalLayout();
        filtros.addStyleName(CSS.NOPADDING);
        filtros.addComponent(new ComboBox<>("Hotel", List.of("Aloha", "Valparaiso", "Bellver", "Alcudiamar")));
        filtros.addComponent(new ComboBox<>("Agencia", List.of("Logitravel", "Booking.com", "Expedia")));
        filtros.addComponent(new ComboBox<>("Grupo agencias", List.of("Nacional", "Británico", "Alemán")));
        filtros.addComponent(new ComboBox<>("Entrada", List.of("Mismo día", "Lunes", "Martes", "Miércoles", "Jueves", "Sábado", "Domingo")));
        filtros.addComponent(new Slider("Estancia", 1, 30));
        filtros.addComponent(new Slider("Release", 0, 30));


        Button b = new Button(VaadinIcons.ANGLE_RIGHT);
        b.addClickListener(e -> {
            filtros.setVisible(!filtros.isVisible());
            b.setIcon(filtros.isVisible()?VaadinIcons.ANGLE_LEFT:VaadinIcons.ANGLE_RIGHT);
            if (filtros.isVisible()) parametros.addStyleName("a"); else parametros.removeStyleName("a");
        });
        b.addStyleName(ValoTheme.BUTTON_TINY);
        b.addStyleName(ValoTheme.BUTTON_QUIET);
        b.addStyleName(CSS.NOPADDING);
        HorizontalLayout hl = new HorizontalLayout(filtros, b);
        hl.addStyleName(CSS.NOPADDING);
        hl.setComponentAlignment(b, Alignment.MIDDLE_CENTER);
        hl.setHeight("100%");

        filtros.addStyleName("filtros");

        filtros.setVisible(false);
        return hl;
    }

    private Component crearParametros() {
        parametros = new HorizontalLayout();
        parametros.addStyleName(CSS.NOPADDING);

        filtro = new TextField("Filtro");
        filtro.addValueChangeListener(e -> g.getDataProvider().refreshAll());
        filtro.addStyleName("filtro");

        mes = crearNavegadorMes();

        VerticalLayout vl = new VerticalLayout(mes, filtro);
        vl.addStyleName(CSS.NOPADDING);

        parametros.addComponent(vl);
        parametros.setComponentAlignment(vl, Alignment.BOTTOM_LEFT);

        vl = new VerticalLayout();
        vl.addStyleName(CSS.NOPADDING);
        vl.addComponent(nivel = new RadioButtonGroup<>("Inventario", List.of("Hotel", "Tipo Habitación", "Cupo", "Contrato")));
        parametros.addComponent(vl);
        nivel.setValue("Hotel");
        nivel.addValueChangeListener(e -> g.getDataProvider().refreshAll());

        vl = new VerticalLayout();
        vl.addStyleName(CSS.NOPADDING);
        vl.addComponent(ver = new CheckBoxGroup<>("Mostrar", List.of("Disponibilidad", "Cupos", "Ocupación", "Producción")));
        parametros.addComponent(vl);
        ver.setValue(Set.of("Disponibilidad"));
        ver.addValueChangeListener(e -> g.getDataProvider().refreshAll());

        vl = new VerticalLayout();
        vl.addStyleName(CSS.NOPADDING);
        vl.addComponent(detalle = new CheckBoxGroup<>("Detalle", List.of("Precio base", "Precio final", "Release", "Estancia mínima", "Estancia máxima")));
        parametros.addComponent(vl);
        detalle.setValue(Set.of("Precio base"));
        detalle.addValueChangeListener(e -> g.getDataProvider().refreshAll());

        vl = new VerticalLayout();
        vl.addStyleName(CSS.NOPADDING);
        vl.addComponent(avisos = new CheckBoxGroup<>("Avisos", List.of("Ofertas", "Paros", "Dia Entrada Semana", "CTA", "CTD")));
        parametros.addComponent(vl);
        avisos.addValueChangeListener(e -> g.getDataProvider().refreshAll());
        
        parametros.addComponent(minVal = new Slider(0, 500));
        minVal.setCaption("Val. mínimo");
        minVal.setOrientation(SliderOrientation.VERTICAL);
        minVal.addValueChangeListener(e -> g.getDataProvider().refreshAll());

        parametros.addComponent(maxVal = new Slider(0, 500));
        maxVal.setCaption("Val. máximo");
        maxVal.setValue(new Double(500));
        maxVal.setOrientation(SliderOrientation.VERTICAL);
        maxVal.addValueChangeListener(e -> g.getDataProvider().refreshAll());

        if (false) {
            Button b = new Button(VaadinIcons.ANGLE_DOWN);
            b.addClickListener(e -> {
                parametros.setVisible(!parametros.isVisible());
                b.setIcon(parametros.isVisible()?VaadinIcons.ANGLE_UP:VaadinIcons.ANGLE_DOWN);
                if (parametros.isVisible()) filtros.addStyleName("a"); else filtros.removeStyleName("a");
            });
            b.addStyleName(ValoTheme.BUTTON_TINY);
            b.addStyleName(ValoTheme.BUTTON_QUIET);
            b.addStyleName(CSS.NOPADDING);
            VerticalLayout cont = new VerticalLayout(parametros, b);
            cont.addStyleName(CSS.NOPADDING);
            cont.setComponentAlignment(b, Alignment.MIDDLE_CENTER);
        }

        parametros.addStyleName("parametros");

        return parametros;
    }

    private Component crearNavegadorMes() {

        Button bl;
        Button br;
        Label l;
        HorizontalLayout hl = new HorizontalLayout(bl = new Button(VaadinIcons.ARROW_LEFT), l = new Label("ENE 20"), br = new Button(VaadinIcons.ARROW_RIGHT));
        bl.addStyleName(ValoTheme.BUTTON_QUIET);
        br.addStyleName(ValoTheme.BUTTON_QUIET);
        hl.addStyleName(CSS.NOPADDING);
        return hl;
    }

    @Override
    public List<AbstractAction> getActions() {
        List<AbstractAction> as = new ArrayList<>();

        as.add(new AbstractAction("Abrir/Cerrar") {

            @Override
            public void run() {
                DialogoAbrirCerrar sub = new DialogoAbrirCerrar();

                // Add it to the root component
                UI.getCurrent().addWindow(sub);
            }
        });

        as.add(new AbstractAction("Gestión de cupos") {

            @Override
            public void run() {
                MDD.alert("Pendiente");
            }
        });

        as.add(new AbstractAction("Consultar Revenue") {

            @Override
            public void run() {
                MDD.alert("Pendiente");
            }
        });

        as.add(new AbstractAction("Actualizar precios") {

            @Override
            public void run() {
                MDD.alert("Pendiente");
            }
        });

        as.add(new AbstractAction("Refrescar") {

            @Override
            public void run() {
                MDD.alert("Pendiente");
            }
        });

        as.add(new AbstractAction("Crear contrato") {

            @Override
            public void run() {
                DialogoCrearContrato sub = new DialogoCrearContrato();

                // Add it to the root component
                UI.getCurrent().addWindow(sub);
            }
        });

        as.add(new AbstractAction("Crear oferta") {

            @Override
            public void run() {
                DialogoCrearOferta sub = new DialogoCrearOferta();

                // Add it to the root component
                UI.getCurrent().addWindow(sub);
            }
        });

        return as;
    }

    @Getter@Setter@AllArgsConstructor
    public class Fila {

        private final UUID uuid = UUID.randomUUID();

        private boolean visible;

        private Fila padre;

        private String clave;

        private String nivel;

        private String detalle;

        private String concepto;

        public String getValorConcepto() {
            String s = completar("");
            return s;
        }

        private String completar(String acumulado) {
            String s = acumulado;

            if (true) {
                if (!"".equalsIgnoreCase(s)) s = " > " + s;
                s = concepto + s;
            } else {
                if ("".equals(acumulado)) {
                    if (visible) s = concepto;
                } else {
                    if (visible) {
                        s = " > " + s;
                    } else {
                        if (!"".equalsIgnoreCase(s)) s = " > " + s;
                        s = concepto + s;
                    }
                }
            }

            if (padre != null) {
                s = padre.completar(s);
            }
            return s;
        }

        ;

        private String ver;

        private String dia_1;
        private String dia_2;
        private String dia_3;
        private String dia_4;
        private String dia_5;
        private String dia_6;
        private String dia_7;
        private String dia_8;
        private String dia_9;
        private String dia_10;
        private String dia_11;
        private String dia_12;
        private String dia_13;
        private String dia_14;
        private String dia_15;
        private String dia_16;
        private String dia_17;
        private String dia_18;
        private String dia_19;
        private String dia_20;
        private String dia_21;
        private String dia_22;
        private String dia_23;
        private String dia_24;
        private String dia_25;
        private String dia_26;
        private String dia_27;
        private String dia_28;
        private String dia_29;
        private String dia_30;
        private String dia_31;


        private List<Fila> hijos = new ArrayList<>();

        @Override
        public int hashCode() {
            return getClass().hashCode();
        }

        @Override
        public boolean equals(Object obj) {
            return this == obj || (obj != null && obj instanceof Fila && uuid.equals(((Fila) obj).getUuid()));
        }

        public Fila(String concepto, String nivel, String ver, String detalle, List<Fila> hijos) {
            this.concepto = concepto;
            this.nivel = nivel;
            this.ver = ver;
            this.detalle = detalle;
            this.hijos = hijos;
            hijos.forEach(h -> h.setPadre(this));

            Random r = new Random();

            if (ver != null && ver.toLowerCase().contains("precio")) {
                double mult = 100d;
                if (ver.toLowerCase().contains("final")) mult = 500;
                dia_1 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_2 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_3 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_4 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_5 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_6 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_7 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_8 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_9 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_10 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_11 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_12 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_13 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_14 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_15 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_16 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_17 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_18 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_19 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_20 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_21 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_22 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_23 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_24 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_25 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_26 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_27 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_28 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_29 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_30 = "" + Helper.roundEuros(mult * r.nextDouble());
                dia_31 = "" + Helper.roundEuros(mult * r.nextDouble());
            } else {
                int bound = 100;
                if ("release".equalsIgnoreCase(ver)) bound = 14;
                if ("est. mín.".equalsIgnoreCase(ver)) bound = 7;
                dia_1 = "" + r.nextInt(bound);
                dia_2 = "" + r.nextInt(bound);
                dia_3 = "" + r.nextInt(bound);
                dia_4 = "" + r.nextInt(bound);
                dia_5 = "" + r.nextInt(bound);
                dia_6 = "" + r.nextInt(bound);
                dia_7 = "" + r.nextInt(bound);
                dia_8 = "" + r.nextInt(bound);
                dia_9 = "" + r.nextInt(bound);
                dia_10 = "" + r.nextInt(bound);
                dia_11 = "" + r.nextInt(bound);
                dia_12 = "" + r.nextInt(bound);
                dia_13 = "" + r.nextInt(bound);
                dia_14 = "" + r.nextInt(bound);
                dia_15 = "" + r.nextInt(bound);
                dia_16 = "" + r.nextInt(bound);
                dia_17 = "" + r.nextInt(bound);
                dia_18 = "" + r.nextInt(bound);
                dia_19 = "" + r.nextInt(bound);
                dia_20 = "" + r.nextInt(bound);
                dia_21 = "" + r.nextInt(bound);
                dia_22 = "" + r.nextInt(bound);
                dia_23 = "" + r.nextInt(bound);
                dia_24 = "" + r.nextInt(bound);
                dia_25 = "" + r.nextInt(bound);
                dia_26 = "" + r.nextInt(bound);
                dia_27 = "" + r.nextInt(bound);
                dia_28 = "" + r.nextInt(bound);
                dia_29 = "" + r.nextInt(bound);
                dia_30 = "" + r.nextInt(bound);
                dia_31 = "" + r.nextInt(bound);
            }

        }
    }

    private Grid<Fila> crearTreeGrid() {


        List<Fila> data = getDatos();


        Grid<Fila> treeGrid = null;
        if (false) {
            // Initialize a TreeGrid and set in-memory data
            TreeGrid<Fila> tg;
            treeGrid = tg = new TreeGrid<>();
            //treeGrid.setItems(data, Fila::getHijos);
            TreeData<Fila> treeData = new TreeData<>();
            treeData.addItems(data, Fila::getHijos);
            TreeDataProvider<Fila> dataProvider;
            treeGrid.setDataProvider(dataProvider = new TreeDataProvider<Fila>(treeData));
            dataProvider.setFilter(e -> {
                boolean ok = true;
                if (!Strings.isNullOrEmpty(filtro.getValue())) {
                    List<String> ts = Arrays.asList(filtro.getValue().split(" "));
                    boolean algunook = false;
                    for (String t : ts) {
                        algunook |= e.getConcepto().toLowerCase().contains(t.toLowerCase());
                        if (algunook) break;
                    }
                    ok &= algunook;
                }
                ok &= ver.getValue().contains("Precio base") || (e.getVer() != null && !e.getVer().toLowerCase().contains("Precio base"));
                ok &= ver.getValue().contains("Ocupaciones") || (e.getVer() != null && !e.getVer().toLowerCase().contains("precio final"));
                return ok;
            });
            tg.expandRecursively(data, 10);
        } else {
            // Initialize a TreeGrid and set in-memory data
            treeGrid = new Grid<>();
            //treeGrid.setItems(data, Fila::getHijos);
            List<Fila> rawData = aplanar(new ArrayList<>(), data);
            ListDataProvider<Fila> dataProvider;
            treeGrid.setDataProvider(dataProvider = new ListDataProvider<Fila>(rawData));
            dataProvider.setFilter(e -> {
                boolean ok = true;
                if (!e.getClave().contains("FECHA") && !Strings.isNullOrEmpty(filtro.getValue())) {
                    ok = false;
                    List<String> ts = Arrays.asList(filtro.getValue().split("[, ]"));
                    if (e.getConcepto() != null) {
                        boolean fallaAlguno = false;
                        for (String s : ts) {
                            fallaAlguno = !e.getClave().toLowerCase().contains(s.toLowerCase());
                            if (fallaAlguno) break;
                        }
                        ok = !fallaAlguno;
                    }
                }
                if (ok) {
                    if (!e.getClave().contains("FECHA")) {

                        ok = "".equals(e.getNivel()) || nivel.getValue().equals(e.getNivel());

                        ok &= "".equals(e.getVer()) || ver.getValue().contains(e.getVer());

                        ok &= "".equals(e.getDetalle()) || detalle.getValue().contains(e.getDetalle());

                    };

                }
                e.setVisible(ok);
                return ok;
            });
        }


        treeGrid.setSizeFull();

        TextField concepto_field = new TextField();
        TextField selector_field = new TextField();

        TextField dia_1_field = new TextField();
        TextField dia_2_field = new TextField();
        TextField dia_3_field = new TextField();
        TextField dia_4_field = new TextField();
        TextField dia_5_field = new TextField();
        TextField dia_6_field = new TextField();
        TextField dia_7_field = new TextField();
        TextField dia_8_field = new TextField();
        TextField dia_9_field = new TextField();
        TextField dia_10_field = new TextField();
        TextField dia_11_field = new TextField();
        TextField dia_12_field = new TextField();
        TextField dia_13_field = new TextField();
        TextField dia_14_field = new TextField();
        TextField dia_15_field = new TextField();
        TextField dia_16_field = new TextField();
        TextField dia_17_field = new TextField();
        TextField dia_18_field = new TextField();
        TextField dia_19_field = new TextField();
        TextField dia_20_field = new TextField();
        TextField dia_21_field = new TextField();
        TextField dia_22_field = new TextField();
        TextField dia_23_field = new TextField();
        TextField dia_24_field = new TextField();
        TextField dia_25_field = new TextField();
        TextField dia_26_field = new TextField();
        TextField dia_27_field = new TextField();
        TextField dia_28_field = new TextField();
        TextField dia_29_field = new TextField();
        TextField dia_30_field = new TextField();
        TextField dia_31_field = new TextField();

        Binder<Fila> binder = treeGrid.getEditor().getBinder();

        Binder.Binding<Fila, String> concepto_Binding = binder.bind(concepto_field, Fila::getConcepto, Fila::setConcepto);
        Binder.Binding<Fila, String> selector_Binding = binder.bind(selector_field, Fila::getDia_1, Fila::setDia_1);

        Binder.Binding<Fila, String> dia_1_Binding = binder.bind(dia_1_field, Fila::getDia_1, Fila::setDia_1);
        Binder.Binding<Fila, String> dia_2_Binding = binder.bind(dia_2_field, Fila::getDia_2, Fila::setDia_2);
        Binder.Binding<Fila, String> dia_3_Binding = binder.bind(dia_3_field, Fila::getDia_3, Fila::setDia_3);
        Binder.Binding<Fila, String> dia_4_Binding = binder.bind(dia_4_field, Fila::getDia_4, Fila::setDia_4);
        Binder.Binding<Fila, String> dia_5_Binding = binder.bind(dia_5_field, Fila::getDia_5, Fila::setDia_5);
        Binder.Binding<Fila, String> dia_6_Binding = binder.bind(dia_6_field, Fila::getDia_6, Fila::setDia_6);
        Binder.Binding<Fila, String> dia_7_Binding = binder.bind(dia_7_field, Fila::getDia_7, Fila::setDia_7);
        Binder.Binding<Fila, String> dia_8_Binding = binder.bind(dia_8_field, Fila::getDia_8, Fila::setDia_8);
        Binder.Binding<Fila, String> dia_9_Binding = binder.bind(dia_9_field, Fila::getDia_9, Fila::setDia_9);
        Binder.Binding<Fila, String> dia_10_Binding = binder.bind(dia_10_field, Fila::getDia_10, Fila::setDia_10);
        Binder.Binding<Fila, String> dia_11_Binding = binder.bind(dia_11_field, Fila::getDia_11, Fila::setDia_11);
        Binder.Binding<Fila, String> dia_12_Binding = binder.bind(dia_12_field, Fila::getDia_12, Fila::setDia_12);
        Binder.Binding<Fila, String> dia_13_Binding = binder.bind(dia_13_field, Fila::getDia_13, Fila::setDia_13);
        Binder.Binding<Fila, String> dia_14_Binding = binder.bind(dia_14_field, Fila::getDia_14, Fila::setDia_14);
        Binder.Binding<Fila, String> dia_15_Binding = binder.bind(dia_15_field, Fila::getDia_15, Fila::setDia_15);
        Binder.Binding<Fila, String> dia_16_Binding = binder.bind(dia_16_field, Fila::getDia_16, Fila::setDia_16);
        Binder.Binding<Fila, String> dia_17_Binding = binder.bind(dia_17_field, Fila::getDia_17, Fila::setDia_17);
        Binder.Binding<Fila, String> dia_18_Binding = binder.bind(dia_18_field, Fila::getDia_18, Fila::setDia_18);
        Binder.Binding<Fila, String> dia_19_Binding = binder.bind(dia_19_field, Fila::getDia_19, Fila::setDia_19);
        Binder.Binding<Fila, String> dia_20_Binding = binder.bind(dia_20_field, Fila::getDia_20, Fila::setDia_20);
        Binder.Binding<Fila, String> dia_21_Binding = binder.bind(dia_21_field, Fila::getDia_21, Fila::setDia_21);
        Binder.Binding<Fila, String> dia_22_Binding = binder.bind(dia_22_field, Fila::getDia_22, Fila::setDia_22);
        Binder.Binding<Fila, String> dia_23_Binding = binder.bind(dia_23_field, Fila::getDia_23, Fila::setDia_23);
        Binder.Binding<Fila, String> dia_24_Binding = binder.bind(dia_24_field, Fila::getDia_24, Fila::setDia_24);
        Binder.Binding<Fila, String> dia_25_Binding = binder.bind(dia_25_field, Fila::getDia_25, Fila::setDia_25);
        Binder.Binding<Fila, String> dia_26_Binding = binder.bind(dia_26_field, Fila::getDia_26, Fila::setDia_26);
        Binder.Binding<Fila, String> dia_27_Binding = binder.bind(dia_27_field, Fila::getDia_27, Fila::setDia_27);
        Binder.Binding<Fila, String> dia_28_Binding = binder.bind(dia_28_field, Fila::getDia_28, Fila::setDia_28);
        Binder.Binding<Fila, String> dia_29_Binding = binder.bind(dia_29_field, Fila::getDia_29, Fila::setDia_29);
        Binder.Binding<Fila, String> dia_30_Binding = binder.bind(dia_30_field, Fila::getDia_30, Fila::setDia_30);
        Binder.Binding<Fila, String> dia_31_Binding = binder.bind(dia_31_field, Fila::getDia_31, Fila::setDia_31);


        // The first column gets the hierarchy indicator by default

        Random r = new Random();

        treeGrid.addColumn(Fila::getValorConcepto).setId("concepto").setCaption("Concepto").setWidth(330).setEditorBinding(concepto_Binding).setEditable(false);
        treeGrid.addColumn(Fila::getVer).setId("ver").setCaption("...").setWidth(120).setEditorBinding(selector_Binding).setEditable(false);
        StyleGenerator<Fila> csg = new StyleGenerator<Fila>() {
            @Override
            public String apply(Fila fila) {
                String s = "v-align-right";
                if (avisos.getValue().contains("Dia Entrada Semana")) if (r.nextInt(100) % 4 == 0) s += " " + CSS.GREENBGD;
                if (avisos.getValue().contains("Ofertas")) if (r.nextInt(100) % 4 == 0) s += " " + CSS.YELLOWBGD;
                if (avisos.getValue().contains("Paros")) if (r.nextInt(100) % 3 == 0) s += " " + CSS.CANCELLED;
                if (avisos.getValue().contains("CTA")) if (r.nextInt(100) % 3 == 0) s += " " + CSS.CANCELLED;
                if (avisos.getValue().contains("CTD")) if (r.nextInt(100) % 3 == 0) s += " " + CSS.CANCELLED;
                if (fila.getVer().contains("Precio final")) if (r.nextInt(100) % 4 == 0) s += " " + CSS.BLUEFGD;

                if (minVal.getValue() > 0 || maxVal.getValue() < 500) {
                    int v = r.nextInt(500);
                    if (v > minVal.getValue() && v < maxVal.getValue()) s += " " + CSS.BOLD;
                }

                return s;
            }
        };
        treeGrid.addColumn(Fila::getDia_1).setId("dia_1").setCaption("1").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_1_Binding);
        treeGrid.addColumn(Fila::getDia_2).setId("dia_2").setCaption("2").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_2_Binding);
        treeGrid.addColumn(Fila::getDia_3).setId("dia_3").setCaption("3").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_3_Binding);
        treeGrid.addColumn(Fila::getDia_4).setId("dia_4").setCaption("4").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_4_Binding);
        treeGrid.addColumn(Fila::getDia_5).setId("dia_5").setCaption("5").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_5_Binding);
        treeGrid.addColumn(Fila::getDia_6).setId("dia_6").setCaption("6").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_6_Binding);
        treeGrid.addColumn(Fila::getDia_7).setId("dia_7").setCaption("7").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_7_Binding);
        treeGrid.addColumn(Fila::getDia_8).setId("dia_8").setCaption("8").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_8_Binding);
        treeGrid.addColumn(Fila::getDia_9).setId("dia_9").setCaption("9").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_9_Binding);
        treeGrid.addColumn(Fila::getDia_10).setId("dia_10").setCaption("10").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_10_Binding);
        treeGrid.addColumn(Fila::getDia_11).setId("dia_11").setCaption("11").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_11_Binding);
        treeGrid.addColumn(Fila::getDia_12).setId("dia_12").setCaption("12").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_12_Binding);
        treeGrid.addColumn(Fila::getDia_13).setId("dia_13").setCaption("13").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_13_Binding);
        treeGrid.addColumn(Fila::getDia_14).setId("dia_14").setCaption("14").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_14_Binding);
        treeGrid.addColumn(Fila::getDia_15).setId("dia_15").setCaption("15").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_15_Binding);
        treeGrid.addColumn(Fila::getDia_16).setId("dia_16").setCaption("16").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_16_Binding);
        treeGrid.addColumn(Fila::getDia_17).setId("dia_17").setCaption("17").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_17_Binding);
        treeGrid.addColumn(Fila::getDia_18).setId("dia_18").setCaption("18").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_18_Binding);
        treeGrid.addColumn(Fila::getDia_19).setId("dia_19").setCaption("19").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_19_Binding);
        treeGrid.addColumn(Fila::getDia_20).setId("dia_20").setCaption("20").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_20_Binding);
        treeGrid.addColumn(Fila::getDia_21).setId("dia_21").setCaption("21").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_21_Binding);
        treeGrid.addColumn(Fila::getDia_22).setId("dia_22").setCaption("22").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_22_Binding);
        treeGrid.addColumn(Fila::getDia_23).setId("dia_23").setCaption("23").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_23_Binding);
        treeGrid.addColumn(Fila::getDia_24).setId("dia_24").setCaption("24").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_24_Binding);
        treeGrid.addColumn(Fila::getDia_25).setId("dia_25").setCaption("25").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_25_Binding);
        treeGrid.addColumn(Fila::getDia_26).setId("dia_26").setCaption("26").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_26_Binding);
        treeGrid.addColumn(Fila::getDia_27).setId("dia_27").setCaption("27").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_27_Binding);
        treeGrid.addColumn(Fila::getDia_28).setId("dia_28").setCaption("28").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_28_Binding);
        treeGrid.addColumn(Fila::getDia_29).setId("dia_29").setCaption("29").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_29_Binding);
        treeGrid.addColumn(Fila::getDia_30).setId("dia_30").setCaption("30").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_30_Binding);
        treeGrid.addColumn(Fila::getDia_31).setId("dia_31").setCaption("31").setWidth(90).setStyleGenerator(csg).setEditorBinding(dia_31_Binding);

        treeGrid.getEditor().setEnabled(false);
        treeGrid.getEditor().setBuffered(false);

        treeGrid.setFrozenColumnCount(2);

        treeGrid.setSelectionMode(Grid.SelectionMode.NONE);

        treeGrid.addItemClickListener(e -> {
            System.out.println("" + e.getRowIndex() + "-" + e.getColumn().getCaption());
            if (e.getColumn().getId().startsWith("dia_")) visualizar(e.getItem(), e.getColumn());
        });

        // preselect value
        //treeGrid.select(defaultItem);

        treeGrid.addListener(e -> {
            System.out.println(e);
        });

        /*
        treeGrid.setStyleGenerator((f -> {
            if(cellReference.getPropertyId().toString().equals("remove")){
                return "align-right";
            } else {
                return null;
            }
        });
        */

        return treeGrid;
    }

    private void visualizar(Fila item, Grid.Column<Fila, ?> columna) {
        mlp.setContent(crearPanelDetalle(item, columna));
        if (!mlp.isVisible()) mlp.setVisible(true);

    }

    private Component crearPanelDetalle(Fila item, Grid.Column<Fila,?> columna) {
        VerticalLayout vl = new VerticalLayout();
        vl.addStyleName(CSS.NOPADDING);

        Random r = new Random();

        if ("release".equalsIgnoreCase(item.getConcepto())) {
            Label h;
            HorizontalLayout hl;
            Button b;
            vl.addComponent(hl = new HorizontalLayout(
                    h = new Label("Release")
                    , b = new Button(VaadinIcons.CLOSE, e -> mlp.setVisible(false))
            ));
            hl.addStyleName(CSS.NOPADDING);
            h.addStyleName(ValoTheme.LABEL_H2);
            b.addStyleName(ValoTheme.BUTTON_BORDERLESS);

            vl.addComponent(h = new Label("Doble - Garantía TUI 2019"));
            h.addStyleName(ValoTheme.LABEL_H3);

            TextField a;
            vl.addComponent(a = new TextField("Release"));

            a.setValue("" + r.nextInt(14));

            vl.addComponent(new Button("Grabar", ev -> mlp.setVisible(false)));


        } else if ("est. mín.".equalsIgnoreCase(item.getConcepto())) {

            Label h;
            HorizontalLayout hl;
            Button b;
            vl.addComponent(hl = new HorizontalLayout(
                    h = new Label("Estancia mínima")
                    , b = new Button(VaadinIcons.CLOSE, e -> mlp.setVisible(false))
            ));
            hl.addStyleName(CSS.NOPADDING);
            h.addStyleName(ValoTheme.LABEL_H2);
            b.addStyleName(ValoTheme.BUTTON_BORDERLESS);

            vl.addComponent(h = new Label("Doble - Garantía TUI 2019"));
            h.addStyleName(ValoTheme.LABEL_H3);

            TextField a;
            vl.addComponent(a = new TextField("Estancia mínima"));

            a.setValue("" + r.nextInt(14));

            vl.addComponent(new Button("Grabar", ev -> mlp.setVisible(false)));

        } else if ("precio base".equalsIgnoreCase(item.getVer())) {
            // solo visualizar o editar datos, accsiones, ...

            Label h;
            HorizontalLayout hl;
            Button b;
            vl.addComponent(hl = new HorizontalLayout(
                    h = new Label("Garantía TUI 2019")
                    , b = new Button(VaadinIcons.CLOSE, e -> mlp.setVisible(false))
            ));
            hl.addStyleName(CSS.NOPADDING);
            h.addStyleName(ValoTheme.LABEL_H2);
            b.addStyleName(ValoTheme.BUTTON_BORDERLESS);

            vl.addComponent(h = new Label("Doble - Solo Alojamiento"));
            h.addStyleName(ValoTheme.LABEL_H3);


            Label a;
            vl.addComponent(a = new Label());
            a.setCaption("Habitación");
            Label j;
            vl.addComponent(j = new Label());
            j.setCaption("Adulto");
            Label c;
            vl.addComponent(c = new Label());
            c.setCaption("Niño");
            Label d;
            vl.addComponent(d = new Label());
            d.setCaption("Adulto extra");
            Label e;
            vl.addComponent(e = new Label());
            e.setCaption("Niño extra");
            Label f;
            vl.addComponent(f = new Label());
            f.setCaption("Régimen adulto");
            Label i;
            vl.addComponent(i = new Label());
            i.setCaption("Régimen niño");

            a.setValue("" + Helper.roundEuros(100d * r.nextDouble()));
            j.setValue("" + Helper.roundEuros(100d * r.nextDouble()));
            c.setValue("-30%");
            d.setValue("-25%");
            e.setValue("" + Helper.roundEuros(100d * r.nextDouble()));
            f.setValue("" + Helper.roundEuros(50d * r.nextDouble()));
            i.setValue("" + Helper.roundEuros(50d * r.nextDouble()));

            vl.addComponent(hl = new HorizontalLayout(
                    new Button("Modificar", ev -> modificarPrecio(vl))
                    , new Button("Modificar solo para este día", ev -> modificarPrecio(vl))
                    , new Button("Fechas", ev -> modificarFechas(vl))
            ));

        } else if ("% ocupación".equalsIgnoreCase(item.getVer()) || "cupo".equalsIgnoreCase(item.getVer()) || "cupo total".equalsIgnoreCase(item.getVer()) || "cupo contrato".equalsIgnoreCase(item.getVer())) {

            Label h;
            HorizontalLayout hl;
            Button b;
            vl.addComponent(hl = new HorizontalLayout(
                    h = new Label("Cupo general")
                    , b = new Button(VaadinIcons.CLOSE, e -> mlp.setVisible(false))
            ));
            hl.addStyleName(CSS.NOPADDING);
            h.addStyleName(ValoTheme.LABEL_H2);
            b.addStyleName(ValoTheme.BUTTON_BORDERLESS);

            vl.addComponent(h = new Label("Doble 23-Mayo-2020"));
            h.addStyleName(ValoTheme.LABEL_H3);


            Label x;
            vl.addComponent(x = new Label("" + r.nextInt(100)));
            x.setCaption("Cupo contratado");

            vl.addComponent(x = new Label("" + r.nextInt(100)));
            x.setCaption("Cupo reservado");

            vl.addComponent(x = new Label("" + r.nextInt(100)));
            x.setCaption("Cupo disponible");


        } else if ("precio final".equalsIgnoreCase(item.getVer())) {

            Label h;
            HorizontalLayout hl;
            Button b;
            vl.addComponent(hl = new HorizontalLayout(
                    h = new Label("Precio final")
                    , b = new Button(VaadinIcons.CLOSE, e -> mlp.setVisible(false))
            ));
            hl.addStyleName(CSS.NOPADDING);
            h.addStyleName(ValoTheme.LABEL_H2);
            b.addStyleName(ValoTheme.BUTTON_BORDERLESS);

            vl.addComponent(h = new Label("Doble - Media pensión<br/>23-Mayo-2020<br/>2 + 0", ContentMode.HTML));
            h.addStyleName(ValoTheme.LABEL_H3);


            StringWriter sw;
            PrintWriter pw = new PrintWriter(sw = new StringWriter());

            pw.println("<table class='onetomanytable'>");
            pw.println("<thead><tr>");
            pw.println("<th>Concepto</th><th>Importe</th>");
            pw.println("</tr></thead>");
            pw.println("<tbody>");
            pw.println("<tr><td width='230px'>Habitación</td><td class='numeric' width='90px'>100.33</td></tr>");
            pw.println("<tr><td>Adulto 1 (estancia)</td><td class='numeric'>90.00</td></tr>");
            pw.println("<tr><td>Adulto 1 /régimen)</td><td class='numeric'>70.15</td></tr>");
            pw.println("<tr><td>Niño 1 (estancia)</td><td class='numeric'>90.00</td></tr>");
            pw.println("<tr><td>Niño 1 /régimen)</td><td class='numeric'>35.10</td></tr>");
            pw.println("<tr><td>Supl. estancia mínima (10%)</td><td class='numeric'>160.25</td></tr>");
            pw.println("<tr><td>Oferta EB 30%</td><td class='numeric'>-200.20</td></tr>");
            pw.println("</tbody>");
            pw.println("<tfoot><tr>");
            pw.println("<tr><th>Total</th><th class='numeric'>356.24</th></tr>");
            pw.println("</tr></tfoot>");
            pw.println("</table>");

            vl.addComponent(h = new Label(sw.toString(), ContentMode.HTML));
            h.setCaption("Cálculo");

            vl.addComponent(hl = new HorizontalLayout(
                    new Button("Modificar", ev -> modificarPrecioFinal(vl))
                    , new Button("Copiar a otras fechas", ev -> modificarFechas(vl))
            ));

        }

        return vl;
    }

    @Getter@Setter@AllArgsConstructor
    class Rango {

        private final UUID uuid = UUID.randomUUID();

        private LocalDate del;
        private LocalDate al;

        @Override
        public int hashCode() {
            return getClass().hashCode();
        }

        @Override
        public boolean equals(Object obj) {
            return this == obj || (obj != null && obj instanceof Rango && uuid.equals(((Rango) obj).getUuid()));
        }


    }

    private void modificarFechas(VerticalLayout vl) {
        vl.removeAllComponents();

        Label h;
        HorizontalLayout hl;
        Button b;
        vl.addComponent(hl = new HorizontalLayout(
                h = new Label("Garantía TUI 2019")
                , b = new Button(VaadinIcons.CLOSE, e -> mlp.setVisible(false))
        ));
        hl.addStyleName(CSS.NOPADDING);
        h.addStyleName(ValoTheme.LABEL_H2);
        b.addStyleName(ValoTheme.BUTTON_BORDERLESS);

        vl.addComponent(h = new Label("Tarifa 3"));
        h.addStyleName(ValoTheme.LABEL_H3);

        Grid<Rango> rg = new Grid<>();
        DateField del_field = new DateField();
        DateField al_field = new DateField();
        Binder<Rango> binder = rg.getEditor().getBinder();
        Binder.Binding<Rango, LocalDate> del_Binding = binder.bind(del_field, Rango::getDel, Rango::setDel);
        Binder.Binding<Rango, LocalDate> al_Binding = binder.bind(al_field, Rango::getAl, Rango::setAl);
        rg.addColumn(Rango::getDel).setId("del").setCaption("Del").setWidth(120).setEditorBinding(del_Binding);
        rg.addColumn(Rango::getAl).setId("al").setCaption("Al").setWidth(120).setEditorBinding(al_Binding);

        rg.getEditor().setEnabled(true);
        rg.getEditor().setBuffered(false);


        rg.setWidth("260px");

        rg.setItems(new Rango(LocalDate.of(2020, 05, 01), LocalDate.of(2020, 05, 23))
                , new Rango(LocalDate.of(2020, 05, 01), LocalDate.of(2020, 05, 23))
                , new Rango(LocalDate.of(2020, 05, 01), LocalDate.of(2020, 05, 23))
                , new Rango(LocalDate.of(2020, 05, 01), LocalDate.of(2020, 05, 23))
                , new Rango(LocalDate.of(2020, 05, 01), LocalDate.of(2020, 05, 23))
                , new Rango(LocalDate.of(2020, 05, 01), LocalDate.of(2020, 05, 23))
                , new Rango(LocalDate.of(2020, 05, 01), LocalDate.of(2020, 05, 23))
        );

        vl.addComponent(rg);

        vl.addComponent(new Button("Grabar", ev -> mlp.setVisible(false)));

    }

    private void modificarPrecio(VerticalLayout vl) {

        vl.removeAllComponents();

        Label h;
        HorizontalLayout hl;
        Button b;
        vl.addComponent(hl = new HorizontalLayout(
                h = new Label("Garantía TUI 2019")
                , b = new Button(VaadinIcons.CLOSE, e -> mlp.setVisible(false))
        ));
        hl.addStyleName(CSS.NOPADDING);
        h.addStyleName(ValoTheme.LABEL_H2);
        b.addStyleName(ValoTheme.BUTTON_BORDERLESS);

        vl.addComponent(h = new Label("Doble - Solo Alojamiento"));
        h.addStyleName(ValoTheme.LABEL_H3);


        TextField a;
        vl.addComponent(a = new TextField("Habitación"));
        TextField j;
        vl.addComponent(j = new TextField("Adulto"));
        TextField c;
        vl.addComponent(c = new TextField("Niño"));
        TextField d;
        vl.addComponent(d = new TextField("Adulto extra"));
        TextField e;
        vl.addComponent(e = new TextField("Niño extra"));
        TextField f;
        vl.addComponent(f = new TextField("Régimen adulto"));
        TextField i;
        vl.addComponent(i = new TextField("Régimen niño"));

        Random r = new Random();

        a.setValue("" + Helper.roundEuros(100d * r.nextDouble()));
        j.setValue("" + Helper.roundEuros(100d * r.nextDouble()));
        c.setValue("-30%");
        d.setValue("-25%");
        e.setValue("" + Helper.roundEuros(100d * r.nextDouble()));
        f.setValue("" + Helper.roundEuros(50d * r.nextDouble()));
        i.setValue("" + Helper.roundEuros(50d * r.nextDouble()));

        vl.addComponent(new Button("Grabar", ev -> mlp.setVisible(false)));

    }

    private void modificarPrecioFinal(VerticalLayout vl) {

        vl.removeAllComponents();

        Label h;
        HorizontalLayout hl;
        Button b;
        vl.addComponent(hl = new HorizontalLayout(
                h = new Label("Modifcar precio final")
                , b = new Button(VaadinIcons.CLOSE, e -> mlp.setVisible(false))
        ));
        hl.addStyleName(CSS.NOPADDING);
        h.addStyleName(ValoTheme.LABEL_H2);
        b.addStyleName(ValoTheme.BUTTON_BORDERLESS);

        vl.addComponent(h = new Label("Doble - Solo Alojamiento"));
        h.addStyleName(ValoTheme.LABEL_H3);


        TextField a;
        vl.addComponent(a = new TextField("Precio"));

        Random r = new Random();

        a.setValue("" + Helper.roundEuros(100d * r.nextDouble()));

        vl.addComponent(new Button("Grabar", ev -> mlp.setVisible(false)));

    }

    private List<Fila> aplanar(List<Fila> plana, List<Fila> data) {
        return aplanar(plana, "", data);
    }

    private List<Fila> aplanar(List<Fila> plana, String prefijo, List<Fila> data) {
        for (Fila f : data) {
            plana.add(f);
            f.setClave(prefijo + "#" + f.getConcepto());
            aplanar(plana, f.getClave(), f.getHijos());
        }
        return plana;
    }

    private List<Fila> getDatos() {
        List<Fila> hoteles = new ArrayList<>();
        hoteles.add(new Fila(true, null, "", "FECHA", "", "", "", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM", "LUN", "MAR", "MIE", new ArrayList<>()));
        hoteles.add(new Fila("Aloha", "Hotel", "Ocupación", "", crearHabs()));
        return hoteles;
    }

    private List<Fila> crearHabs() {
        List<Fila> habs = new ArrayList<>();
        for (String x : List.of("Doble", "Suite")) {
            habs.add(new Fila(x, "Tipo Habitación", "Cupos", "", crearCupos()));
        }
        return habs;
    }

    private List<Fila> crearCupos() {
        List<Fila> cupos = new ArrayList<>();
        cupos.add(new Fila("Online", "Cupo", "Cupos", "", crearContratos()));
        cupos.add(new Fila("Garantía TUI", "Cupo", "Cupos", "", crearContratosTUI()));
        return cupos;
    }

    private List<Fila> crearContratos() {
        List<Fila> contratos = new ArrayList<>();
        for (String x : List.of("Web", "TUI", "Booking/Expedia")) {
            contratos.add(new Fila(x, "Contrato", "Cupos", "", crearRates()));
        }
        return contratos;
    }

    private List<Fila> crearContratosTUI() {
        List<Fila> contratos = new ArrayList<>();
        for (String x : List.of("Garantía 2019")) {
            contratos.add(new Fila(x, "Contrato", "Cupos", "", crearRates()));
        }
        return contratos;
    }

    private List<Fila> crearRates() {
        List<Fila> cupos = new ArrayList<>();
        cupos.add(new Fila("Release", "Contrato", "Producción", "Release", new ArrayList<>()));
        cupos.add(new Fila("Est. mín.", "Contrato", "Producción", "Estancia mínima", new ArrayList<>()));
        for (String x : List.of("SA", "MP", "PC")) {
            cupos.add(new Fila(x, "Contrato", "Producción", "Precio base", crearCombinaciones()));
        }
        return cupos;
    }

    private List<Fila> crearCombinaciones() {
        List<Fila> combs = new ArrayList<>();
        for (String x : List.of("1+0", "2+0", "2+1", "3+0")) {
            combs.add(new Fila(x, "Contrato", "Producción", "Precio final", new ArrayList<>()));
        }
        return combs;
    }

    @Override
    public String toString() {
        return "Hotel sales control view";
    }





    // Define a sub-window by inheritance
    class DialogoAbrirCerrar extends Window {
        public DialogoAbrirCerrar() {
            super("Abrir / cerrar ventas"); // Set window caption

            setWidth("400px");

            center();

            setModal(true);

            // Disable the close button
            setClosable(true);
            setResizable(false);

            DateField del = new DateField("Del");
            DateField al = new DateField("Al");
            HorizontalLayout hl;
            Button abrir = new Button("Abrir", e -> close());
            abrir.addStyleName(ValoTheme.BUTTON_FRIENDLY);
            Button cerrar = new Button("Cerrar", e -> close());
            cerrar.addStyleName(ValoTheme.BUTTON_DANGER);
            setContent(new VerticalLayout(del, al, new Label(""), hl = new HorizontalLayout(abrir, cerrar)));

            //setContent(new Button("Close me", event -> close()));
        }
    }


    // Define a sub-window by inheritance
    class DialogoCrearContrato extends Window {
        public DialogoCrearContrato() {
            super("Crear contrato"); // Set window caption

            setWidth("400px");

            center();

            setModal(true);

            // Disable the close button
            setClosable(true);
            setResizable(false);

            TextField titulo = new TextField("Título");
            DateField del = new DateField("Del");
            DateField al = new DateField("Al");
            ComboBox<String> agencia = new ComboBox<>("Agencia", List.of("Logitravel", "Booking.com", "Expedia"));
            ComboBox<String> grupo = new ComboBox<>("Grupo agencias", List.of("Nacional", "Británico", "Alemán"));

            HorizontalLayout hl;
            Button abrir = new Button("Crear contrato", e -> close());
            abrir.addStyleName(ValoTheme.BUTTON_FRIENDLY);
            setContent(new VerticalLayout(titulo, del, al, agencia, grupo, new Label(""), hl = new HorizontalLayout(abrir)));

            //setContent(new Button("Close me", event -> close()));
        }
    }

    // Define a sub-window by inheritance
    class DialogoCrearOferta extends Window {
        public DialogoCrearOferta() {
            super("Crear oferta"); // Set window caption

            setWidth("400px");

            center();

            setModal(true);

            // Disable the close button
            setClosable(true);
            setResizable(false);

            RadioButtonGroup tipo = new RadioButtonGroup("Tipo", List.of("Upgrade régimen", "Descuento", "Early booking", "Niños gratis", "Precio", "Upgrade habitación", "4x3"));

            HorizontalLayout hl;
            Button abrir = new Button("Crear oferta", e -> close());
            abrir.addStyleName(ValoTheme.BUTTON_FRIENDLY);
            setContent(new VerticalLayout(tipo, new Label(""), hl = new HorizontalLayout(abrir)));

            //setContent(new Button("Close me", event -> close()));
        }
    }

}
