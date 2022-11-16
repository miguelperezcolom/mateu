package io.mateu.util.rest;

import io.mateu.util.servlet.CORSFilter;
import io.swagger.jaxrs.config.BeanConfig;
import org.glassfish.jersey.server.ResourceConfig;

public abstract class MateuRestApiResourceConfig extends ResourceConfig {

    public MateuRestApiResourceConfig() {

        packages(getPackagesToBeScanned());

        register(CORSFilter.class);
        register(io.swagger.jaxrs.listing.ApiListingResource.class);
        register(io.swagger.jaxrs.listing.SwaggerSerializers.class);



        BeanConfig beanConfig = new BeanConfig();
        //beanConfig.setVersion("1.0.5");
        beanConfig.setSchemes(new String[]{"http", "https"});
        //beanConfig.setSchemes(new String[]{SwaggerSetupFilter.scheme});
        //beanConfig.setHost(SwaggerSetupFilter.name + ":" + SwaggerSetupFilter.port);
        //beanConfig.setBasePath(getClass().getAnnotation(ApplicationPath.class).value());
        beanConfig.setResourcePackage(getPackagesToBeScanned());
        beanConfig.setScan(true);

    }

    public abstract String getPackagesToBeScanned();

}
