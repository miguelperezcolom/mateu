package io.mateu.mdd.core.annotations;

import com.vaadin.data.provider.AbstractDataProvider;
import com.vaadin.ui.ItemCaptionGenerator;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Created by miguel on 18/1/17.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.PARAMETER}) //can use in method only.
public @interface DataProvider {

    Class<? extends AbstractDataProvider> dataProvider();

    Class<? extends ItemCaptionGenerator> itemCaptionGenerator() default VoidItemCaptionGenerator.class;

}