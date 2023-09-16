package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.poller;

import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.poller.dtos.ProductDto;
import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.poller.dtos.ProductsListDto;
import io.mateu.util.Helper;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class InsProdClient {

  public List<ProductDto> getProducts() throws Exception {
    return Helper.fromJson(
            Helper.leerFichero(
                getClass().getResourceAsStream("/mock/usecases/processdefinition/products.json")),
            ProductsListDto.class)
        .getContent();
  }

  public ProductDto getProduct(String key) throws Exception {
    return Helper.fromJson(
        Helper.leerFichero(
            getClass().getResourceAsStream("/mock/usecases/processdefinition/sample-product.json")),
        ProductDto.class);
  }
}
