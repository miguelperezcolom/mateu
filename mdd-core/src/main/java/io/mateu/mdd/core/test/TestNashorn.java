package io.mateu.mdd.core.test;

import io.mateu.util.data.Data;
import lombok.extern.slf4j.Slf4j;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

/**
 * Created by miguel on 11/4/17.
 */
@Slf4j
public class TestNashorn {

    public static void main(String... args) throws ScriptException, NoSuchMethodException {

        //test1();

        test2();

    }

    private static void test2() throws ScriptException {
        ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
        ScriptEngine nashorn = scriptEngineManager.getEngineByName("nashorn");

        nashorn.put("$this", new SamplePojo());

        test(nashorn, "$this.name");

        test(nashorn, "$this.check");
        test(nashorn, "false || $this.name");
        test(nashorn, "$this.name = null");
        test(nashorn, "false || $this.name");

        test(nashorn, "this");

        test(nashorn, "$this");

        test(nashorn, "!!$this.name");
        test(nashorn, "$this.name = ''");
        test(nashorn, "!!$this.name");
        test(nashorn, "$this.name = 'a'");
        test(nashorn, "!!$this.name");
    }

    private static void test(ScriptEngine nashorn, String s) throws ScriptException {
        System.out.println(s += " ==> " + nashorn.eval(s));
    }

    private static void test1() throws ScriptException, NoSuchMethodException {
        ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
        ScriptEngine nashorn = scriptEngineManager.getEngineByName("nashorn");
        nashorn.eval("print('Hola Mundo')");


        nashorn.put("n", "Mateu");
        nashorn.eval("print('Hola ' + n + '!')");

        nashorn.eval("function hello(value) { print('Hello, ' + value) }");
        Invocable inv = (Invocable) nashorn;
        inv.invokeFunction("hello", "Scripting!");

        Object r = nashorn.eval("n");
        log.debug("ha devuelto " + r);


        Data d = new Data("string", "Ajjeohwohqd", "int", 2, "bool", true, "double", 2.5);
        nashorn.put("d", d);
        nashorn.eval("for (var i in d) { print(i + '=' + d[i])}");
        nashorn.eval("print('d[string]= ' + d)");

        nashorn.eval("print('**********')");

        nashorn.eval("print('d[string]= ' + JSON.stringify(d))");



        nashorn.put("d", d);
        nashorn.eval("for (var i in d) { print(i + '=' + d[i])}");
        nashorn.eval("print('d[string]= ' + d)");
        nashorn.eval("print('d[string]= ' + JSON.stringify(d))");
        nashorn.eval("print('d[string]= ' + d.string)");
    }


}
