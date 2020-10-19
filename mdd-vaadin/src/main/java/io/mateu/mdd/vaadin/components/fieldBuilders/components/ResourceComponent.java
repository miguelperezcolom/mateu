package io.mateu.mdd.vaadin.components.fieldBuilders.components;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.vaadin.data.HasValue;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.ClassResource;
import com.vaadin.server.ExternalResource;
import com.vaadin.shared.Registration;
import com.vaadin.ui.*;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.interfaces.FileType;
import io.mateu.mdd.shared.interfaces.IResource;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.util.Helper;
import io.mateu.util.interfaces.GeneralRepository;
import io.mateu.util.notification.Notifier;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
public class ResourceComponent extends Composite implements HasValue<IResource>, Component.Focusable {
    private final MDDBinder binder;
    private final Link hyperLink;
    private final Upload upload;
    private final Image image;
    private final ComboBox<FileType> cb;
    private final TextField url;
    private IResource file;
    private Map<UUID, ValueChangeListener> listeners = new HashMap<>();


    public ResourceComponent(FieldInterfaced field, MDDBinder binder) {
        this.binder = binder;

        class MyUploader implements Upload.Receiver, Upload.SucceededListener {
            public File filex;

            public OutputStream receiveUpload(String fileName,
                                              String mimeType) {
                // Create and return a file output stream

                System.out.println("receiveUpload(" + fileName + "," + mimeType + ")");

                FileOutputStream os = null;
                if (fileName != null && !"".equals(fileName)) {

                    String id = UUID.randomUUID().toString();
                    String extension = ".tmp";
                    if (fileName == null || "".equals(fileName.trim())) fileName = "" + id + extension;
                    if (fileName.lastIndexOf(".") < fileName.length() - 1) {
                        extension = fileName.substring(fileName.lastIndexOf("."));
                        fileName = fileName.substring(0, fileName.lastIndexOf("."));
                    }
                    File temp = null;
                    try {
                        temp = File.createTempFile(fileName, extension);
                        os = new FileOutputStream(filex = temp);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }

                return os;
            }

            public void uploadSucceeded(Upload.SucceededEvent event) {
                // Show the uploaded file in the image viewer
                //image.setSource(new FileResource(file));

                String baseUrl = System.getProperty("tmpurl");
                URL url = null;
                try {
                    if (baseUrl == null) {
                        url = filex.toURI().toURL();
                    } else url = new URL(baseUrl + "/" + filex.getName());
                } catch (MalformedURLException e) {
                    e.printStackTrace();
                }


                System.out.println("uploadSucceeded(" + filex.getAbsolutePath() + ")");

                try {

                    if (file == null) file = Helper.getImpl(GeneralRepository.class).getNewResource();

                    file.set(filex.getName(), filex.getAbsolutePath());





                    ValueChangeEvent ce = new ValueChangeEvent(ResourceComponent.this, ResourceComponent.this, true);
                    listeners.values().forEach(l -> l.valueChange(ce));



                } catch (Exception e) {
                    Notifier.alert(e);
                }

            }
        };
        MyUploader receiver = new MyUploader();

        upload = new Upload(null, receiver);
        //upload.setImmediateMode(false);
        upload.addSucceededListener(receiver);

        HorizontalLayout h = new HorizontalLayout();
        h.setSpacing(true);


        h.addComponent(hyperLink = new Link());

        h.addComponent(image = new Image());
        image.setWidth("130px");
        image.setVisible(false);
        image.addClickListener(e -> {
            if (file != null) {
                String u = null;
                try {
                    u = file.toFileLocator().getUrl();
                } catch (Exception e1) {
                    Notifier.alert(e1);
                }
                if (!Strings.isNullOrEmpty(u)) getUI().getPage().open(u, "_blank");
            }
        });


        VerticalLayout v;
        h.addComponent(v = new VerticalLayout());
        v.addStyleName(CSS.NOPADDING);


        v.addComponent(new Button(VaadinIcons.CLOSE, new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent clickEvent) {
                if (file != null) {

                    file.setName(null);
                    file.setUrl(null);
                    file.setBytes(null);
                    file.setUrl(null);

                }


                ValueChangeEvent ce = new ValueChangeEvent(ResourceComponent.this, ResourceComponent.this, true);
                listeners.values().forEach(l -> l.valueChange(ce));


            }
        }));


        url = new TextField();


        cb = new ComboBox<>(null, Lists.newArrayList(FileType.BYTES, FileType.URL));
        cb.setWidth("120px");
        cb.setValue(FileType.BYTES);
        cb.setEmptySelectionAllowed(false);
        cb.addValueChangeListener(e -> {

            if (file == null) {
                try {
                    file = Helper.getImpl(GeneralRepository.class).getNewResource();

                    if (FileType.BYTES.equals(e.getValue())) {
                        upload.setVisible(true);
                        url.setVisible(false);
                        file.setType(e.getValue());
                    } else {
                        upload.setVisible(false);
                        url.setVisible(true);
                        file.setType(e.getValue());
                    }

                } catch (Exception ex) {
                    Notifier.alert(ex);
                }
            }


            ValueChangeEvent ce = new ValueChangeEvent(ResourceComponent.this, ResourceComponent.this, true);
            listeners.values().forEach(l -> l.valueChange(ce));


        });
        v.addComponent(cb);


        url.setWidth("250px");
        url.setVisible(false);
        url.addValueChangeListener(e -> {

            if (file == null) {
                try {
                    file = Helper.getImpl(GeneralRepository.class).getNewResource();
                } catch (Exception ex) {
                    Notifier.alert(ex);
                }
            }

            if (FileType.URL.equals(cb.getValue())) {

                if (file != null) try {
                    file.set(e.getValue());
                } catch (Exception e1) {
                    Notifier.alert(e1);
                }


                ValueChangeEvent ce = new ValueChangeEvent(ResourceComponent.this, null, true);
                listeners.values().forEach(l -> l.valueChange(ce));

            }


        });

        v.addComponent(upload);
        v.addComponent(url);

        // Open the URL in a new window/tab
        hyperLink.setTargetName("_blank");

         setCompositionRoot(h);

         upload.addChangeListener(e -> {


             System.out.println("UPLOAD HA CAMBIADO!");


         });


    }

    @Override
    public void setValue(IResource o) {
        file = o;

        try {

            boolean esFoto = false;
            if (file != null && FileType.URL.equals(file.getType()) && (file.getUrl() != null && (file.getUrl().toLowerCase().contains("githubusercontent") || file.getUrl().toLowerCase().contains("googleusercontent")))) esFoto = true;

            if (esFoto || (file != null && file.getName () != null && (
                    file.getName().toLowerCase().endsWith(".jpg")
                            || file.getName().toLowerCase().endsWith(".jpeg")
                            || file.getName().toLowerCase().endsWith(".gif")
                            || file.getName().toLowerCase().endsWith(".png")
                            || file.getName().toLowerCase().endsWith(".svg")
                            || file.getName().toLowerCase().endsWith(".webp")
                    ))) {
                hyperLink.setVisible(false);
                image.setVisible(true);
                String u = file.toFileLocator().getUrl();
                image.setSource(!Strings.isNullOrEmpty(u)?new ExternalResource(u):new ClassResource("/images/noimage.png"));
            } else {
                hyperLink.setCaption((file != null) ? file.getName() : null);
                if (file != null && file.getName() != null) hyperLink.setResource((file != null && file.toFileLocator().getUrl() != null) ? new ExternalResource(file.toFileLocator().getUrl()):new ClassResource("/images/noimage.png"));
                hyperLink.setVisible(true);
                image.setVisible(false);
            }

            if (file != null && file.toFileLocator().getUrl() != null && !"".equals(file.toFileLocator().getUrl())) {
                cb.setValue(file.getType());
                url.setValue((file.getUrl() != null)?file.getUrl():"");
            } else {
                image.setVisible(true);
                hyperLink.setVisible(false);
                image.setSource(new ClassResource("/images/noimage.png"));
            }

        } catch (Exception e) {
            Notifier.alert(e);
        }
        upload.setComponentError(null);
    }

    @Override
    public IResource getValue() {
        //if (file != null && file.getName() == null) file = null;
        return file;
    }

    @Override
    public void setRequiredIndicatorVisible(boolean b) {
        //upload.setRequiredIndicatorVisible(b);
    }

    @Override
    public boolean isRequiredIndicatorVisible() {
        return false;
        //return tf.isRequiredIndicatorVisible();
    }

    @Override
    public void setReadOnly(boolean b) {
        //tf.setReadOnly(b);
    }

    @Override
    public boolean isReadOnly() {
        //return tf.isReadOnly();
        return false;
    }

    @Override
    public Registration addValueChangeListener(ValueChangeListener<IResource> valueChangeListener) {
        UUID _id = UUID.randomUUID();
        listeners.put(_id, valueChangeListener);
        return new Registration() {

            UUID id = _id;

            @Override
            public void remove() {
                listeners.remove(id);
            }
        };
    }

    @Override
    public void focus() {
        upload.focus();
    }

    @Override
    public int getTabIndex() {
        return upload.getTabIndex();
    }

    @Override
    public void setTabIndex(int i) {
        upload.setTabIndex(i);
    }
}
