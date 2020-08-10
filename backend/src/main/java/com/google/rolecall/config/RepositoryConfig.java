package com.google.rolecall.config;

import java.util.HashMap;
import java.util.Map;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.orm.jpa.JpaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/*
 * Initializes the entity manager factory for all transactions.
 * Does NOT initialize the DataSource which is setup via configurations in 
 * application-dev.properties in Dev.  
 */
@Configuration
@EnableJpaRepositories("com.google.rolecall.repos")
@EnableTransactionManagement
@Profile({"dev","prod"})
public class RepositoryConfig {

  private final DataSource dataSource;

  @Bean
  @Primary
  public LocalContainerEntityManagerFactoryBean entityManagerFactory() {

    HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
    vendorAdapter.setGenerateDdl(true);

    LocalContainerEntityManagerFactoryBean factory = new LocalContainerEntityManagerFactoryBean();

    // TODO: Remove tempory AntiPattern
    Map<String,Boolean> properties = new HashMap<>();
    properties.put("hibernate.enable_lazy_load_no_trans", true);

    // TODO: Add shared caching here
    factory.setJpaVendorAdapter(vendorAdapter);
    factory.setJpaPropertyMap(properties);
    factory.setPackagesToScan("com.google.rolecall.models");
    factory.setDataSource(dataSource);

    return factory;
  }

  @Bean
  @Primary
  public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {

    JpaTransactionManager txnManager = new JpaTransactionManager();

    txnManager.setEntityManagerFactory(entityManagerFactory);
    txnManager.setRollbackOnCommitFailure(true);

    return txnManager;
  }

  @Autowired
  public RepositoryConfig(DataSource dataSource) {
    this.dataSource = dataSource;
  }
}
