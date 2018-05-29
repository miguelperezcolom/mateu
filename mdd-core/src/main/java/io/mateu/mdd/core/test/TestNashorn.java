package io.mateu.mdd.core.test;

import io.mateu.mdd.core.data.Data;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

/**
 * Created by miguel on 11/4/17.
 */
public class TestNashorn {

    public static void main(String... args) throws ScriptException, NoSuchMethodException {

        ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
        ScriptEngine nashorn = scriptEngineManager.getEngineByName("nashorn");
        nashorn.eval("print('Hola Mundo')");


        nashorn.put("n", "Mateu");
        nashorn.eval("print('Hola ' + n + '!')");

        nashorn.eval("function hello(name) { print('Hello, ' + name) }");
        Invocable inv = (Invocable) nashorn;
        inv.invokeFunction("hello", "Scripting!");

        Object r = nashorn.eval("n");
        System.out.println("ha devuelto " + r);


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
