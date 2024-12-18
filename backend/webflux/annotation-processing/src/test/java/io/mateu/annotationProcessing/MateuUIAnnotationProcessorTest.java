package io.mateu.annotationProcessing;

import java.net.URLEncoder;
import org.junit.Test;

public class MateuUIAnnotationProcessorTest {

  @Test
  public void test() {
    System.out.println(URLEncoder.encode("/mateu-favicon.png"));
  }
}
