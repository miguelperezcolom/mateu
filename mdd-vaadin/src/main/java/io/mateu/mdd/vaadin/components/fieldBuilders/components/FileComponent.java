package io.mateu.mdd.vaadin.components.fieldBuilders.components;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.vaadin.data.HasValue;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.ClassResource;
import com.vaadin.server.ExternalResource;
import com.vaadin.server.FileResource;
import com.vaadin.shared.Registration;
import com.vaadin.ui.*;
import io.mateu.mdd.shared.CSS;
import io.mateu.mdd.shared.VaadinHelper;
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
public class FileComponent extends Composite implements HasValue<File>, Component.Focusable {
    private final MDDBinder binder;
    private final Link hyperLink;
    private final Upload upload;
    private final Image image;
    private File file;
    private Map<UUID, ValueChangeListener> listeners = new HashMap<>();


    public FileComponent(FieldInterfaced field, MDDBinder binder) {
        this.binder = binder;

        class MyUploader implements Upload.Receiver, Upload.SucceededListener {
            public File filex;

            public OutputStream receiveUpload(String fileName,
                                              String mimeType) {
                // Create and return a file output stream

                log.info("receiveUpload(" + fileName + "," + mimeType + ")");

                FileOutputStream os = null;
                if (fileName != null && !"".equals(fileName)) {

                    String extension = ".tmp";
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


                log.info("uploadSucceeded(" + filex.getAbsolutePath() + ")");

                try {

                    file = filex;

                    ValueChangeEvent ce = new ValueChangeEvent(FileComponent.this, FileComponent.this, true);
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
                    u = VaadinHelper.getAdaptedUIRootPath();
                    if (!u.endsWith("/")) u += "/";
                    u += "APP/connector/0/" + image.getConnectorId() + "/source/" + new FileResource(file).getFilename();
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

                    file = null;

                }

                ValueChangeEvent ce = new ValueChangeEvent(FileComponent.this, FileComponent.this, true);
                listeners.values().forEach(l -> l.valueChange(ce));

            }
        }));


        v.addComponent(upload);

        // Open the URL in a new window/tab
        hyperLink.setTargetName("_blank");

         setCompositionRoot(h);

         upload.addChangeListener(e -> {


             log.info("UPLOAD HA CAMBIADO!");


         });


    }

    @Override
    public void setValue(File o) {
        file = o;

        try {

            boolean esFoto = false;
            //if (file != null && FileType.URL.equals(file.getType()) && (file.getUrl() != null && (file.getUrl().toLowerCase().contains("githubusercontent") || file.getUrl().toLowerCase().contains("googleusercontent")))) esFoto = true;

            if (file != null && file.getName () != null && (
                    file.getName().toLowerCase().endsWith(".jpg")
                            || file.getName().toLowerCase().endsWith(".jpeg")
                            || file.getName().toLowerCase().endsWith(".gif")
                            || file.getName().toLowerCase().endsWith(".png")
                            || file.getName().toLowerCase().endsWith(".svg")
                            || file.getName().toLowerCase().endsWith(".webp")
                    )) {
                hyperLink.setVisible(false);
                image.setVisible(true);
                image.setSource(file != null?new FileResource(file):new ClassResource("/images/noimage.png"));
            } else {
                hyperLink.setCaption((file != null) ? file.getName() : null);
                hyperLink.setResource(file != null ? new FileResource(file):new ClassResource("/images/noimage.png"));
                hyperLink.setVisible(true);
                image.setVisible(false);
            }

            if (file != null) {
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
    public File getValue() {
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
    public Registration addValueChangeListener(ValueChangeListener<File> valueChangeListener) {
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
