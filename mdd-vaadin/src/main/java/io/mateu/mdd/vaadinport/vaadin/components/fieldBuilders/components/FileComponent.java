package io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.components;

import com.google.common.collect.Lists;
import com.vaadin.data.HasValue;
import com.vaadin.server.ExternalResource;
import com.vaadin.shared.Registration;
import com.vaadin.shared.ui.ValueChangeMode;
import com.vaadin.ui.*;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.data.FileLocator;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.model.multilanguage.Literal;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class FileComponent extends Composite implements HasValue<io.mateu.mdd.core.model.common.File>, Component.Focusable {
    private final MDDBinder binder;
    private final Link l;
    private final Upload upload;
    private io.mateu.mdd.core.model.common.File file;
    private Map<UUID, ValueChangeListener> listeners = new HashMap<>();


    public FileComponent(FieldInterfaced field, MDDBinder binder) {
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

                    if (file == null) file = new io.mateu.mdd.core.model.common.File();

                    file.set(filex.getName(), filex.getAbsolutePath());





                    if (file != null) if (!binder.getMergeables().contains(file)) binder.getMergeables().add(file);
                    ValueChangeEvent ce = new ValueChangeEvent(FileComponent.this, FileComponent.this, true);
                    listeners.values().forEach(l -> l.valueChange(ce));



                } catch (Exception e) {
                    MDD.alert(e);
                }

            }
        };
        MyUploader receiver = new MyUploader();


        upload = new Upload(null, receiver);
        //upload.setImmediateMode(false);
        upload.addSucceededListener(receiver);

        HorizontalLayout h = new HorizontalLayout();
        h.setSpacing(true);
        h.addComponent(l = new Link());
        h.addComponent(new Button("X", new Button.ClickListener() {
            @Override
            public void buttonClick(Button.ClickEvent clickEvent) {
                file = null;



                if (file != null) if (!binder.getMergeables().contains(file)) binder.getMergeables().add(file);
                ValueChangeEvent ce = new ValueChangeEvent(FileComponent.this, FileComponent.this, true);
                listeners.values().forEach(l -> l.valueChange(ce));


            }
        }));
        h.addComponent(upload);

        // Open the URL in a new window/tab
        l.setTargetName("_blank");

         setCompositionRoot(h);

         upload.addChangeListener(e -> {


         });


    }

    @Override
    public void setValue(io.mateu.mdd.core.model.common.File o) {
        file = o;

        try {
            l.setCaption((file != null) ? file.getName() : null);
            l.setResource((file != null) ? new ExternalResource(file.toFileLocator().getUrl()):null);
        } catch (Exception e) {
            MDD.alert(e);
        }
        upload.setComponentError(null);
    }

    @Override
    public io.mateu.mdd.core.model.common.File getValue() {
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
    public Registration addValueChangeListener(ValueChangeListener<io.mateu.mdd.core.model.common.File> valueChangeListener) {
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
