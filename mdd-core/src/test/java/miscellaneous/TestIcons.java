package miscellaneous;

import io.mateu.mdd.core.model.common.Icon;
import io.mateu.mdd.core.model.util.EmailHelper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class TestIcons {

    @Test
    public void test1() {
        //System.setProperty("appconf", "d:/miguel/quotravel.properties");

        EmailHelper.setTesting(true);

        Icon.createDefaultSet();

        WorkflowEngine.exit(0);

        assertEquals(1, 1);
    }

}
