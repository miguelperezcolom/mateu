package test;

import com.vaadin.navigator.View;
import io.mateu.mdd.vaadin.controllers.MateuViewProvider;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class MateuViewProviderTest {

    @Test
    public void testHome() {

        View v = new MateuViewProvider(new ViewStack()).getView("");

        assertEquals(null, v);

    }

}
