package com.example.demo.infra.ui.menus.useCases.processDefinition.poller.dtos;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductsListDto {

  List<ProductDto> content;
}
