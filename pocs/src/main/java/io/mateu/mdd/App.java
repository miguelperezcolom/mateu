package io.mateu.mdd;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Hello world!
 *
 */
public class App 
{
    public static void main( String[] args ) throws JsonProcessingException {

        ObjectMapper mapper = new ObjectMapper();
        POJO1 obj = new POJO1();

//Object to JSON in String
        System.out.println(mapper.writeValueAsString(obj));



    }
}
