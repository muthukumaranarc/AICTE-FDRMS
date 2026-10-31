package com.Muthu.AICTE_FDRMS.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS and Security Headers are centrally orchestrated in SecurityConfig.java
}
