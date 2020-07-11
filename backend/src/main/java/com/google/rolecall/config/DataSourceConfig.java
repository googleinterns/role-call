package com.google.rolecall.config;

import com.google.api.gax.rpc.ApiException;
import com.google.cloud.secretmanager.v1.AccessSecretVersionResponse;
import com.google.cloud.secretmanager.v1.SecretManagerServiceClient;
import com.google.cloud.secretmanager.v1.SecretVersionName;
import com.google.common.annotations.VisibleForTesting;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.io.IOException;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

/**
 * Configures the database connection as a DataSource object through profile specific
 * inititializing functions.
 */
@Configuration
public class DataSourceConfig {

  private final Environment env;

  /*
   * Conncects to a mysql database given valid spring.datasource.url, 
   * spring.datasource.username, spring.datasource.password found in application-dev.properties. 
   */
  @Profile("dev")
  @Bean
  public DataSource getDataSourceLocalMySql() {

    String url = env.getProperty("spring.datasource.url");
    String userName = env.getProperty("spring.datasource.username");
    String password = env.getProperty("spring.datasource.password");

    DataSourceBuilder dataSourceBuilder = DataSourceBuilder.create();

    dataSourceBuilder.driverClassName("com.mysql.cj.jdbc.Driver");
    dataSourceBuilder.url(url);
    dataSourceBuilder.username(userName);
    dataSourceBuilder.password(password);

    return dataSourceBuilder.build();
  }

  /*
   * Connects to a cloud sql mysql database when the server is running on a GCP App Engine
   * instance located in the same project. Requires a secret in the secret manager containing the
   * database password in addition to spring.cloud.gcp.sql.databaseName, 
   * spring.datasource.username, and spring.cloud.gcp.sql.instance-connection-name found through 
   * application-prod.properties.
   */
  @Profile("prod")
  @Bean
  public DataSource getDataSourceCloudSql() {
    return new HikariDataSource(getCloudConfig());
  }

  @VisibleForTesting
  HikariConfig getCloudConfig() throws RuntimeException {
    String dbName = env.getProperty("spring.cloud.gcp.sql.databaseName");
    String userName = env.getProperty("spring.datasource.username");
    String password = getCloudDbPassword();
    String cloudSqlInstance = env.getProperty("spring.cloud.gcp.sql.instance-connection-name");

    HikariConfig config = new HikariConfig();

    config.setJdbcUrl(String.format("jdbc:mysql:///%s", dbName));
    config.setUsername(userName);
    config.setPassword(password);
    config.addDataSourceProperty("socketFactory", "com.google.cloud.sql.mysql.SocketFactory");
    config.addDataSourceProperty("cloudSqlInstance", cloudSqlInstance);

    return config;
  }

  /* 
   * Fetches the latest version of the cloud sql database password from the GCP secret manager
   * through a given project id and secret name (set in application-prod.properties).
   */
  @VisibleForTesting
  String getCloudDbPassword() throws RuntimeException {
    String password;
    String projectId = env.getProperty("spring.cloud.gcp.projectId");
    String secretName = env.getProperty("cloud.secret.name");
    try {
      password = getSecretResponse(projectId, secretName).getPayload().getData().toStringUtf8();
    } catch (IOException e) {
      throw new RuntimeException("Unable to access secret manager. "
          + "Applications calling this method should be run on App Engine.");
    } catch (ApiException e) {
      throw new RuntimeException("Unable to get cloud db password. Call for password failed. "
          + "Check spring.cloud.gcp.projectId and cloud.secret.name for correctness.");
    } catch (Exception e) {
      throw new RuntimeException("Failed to get cloud db password for UNKNOWN reason: \n" 
          + e.getMessage());
    }

    return password;
  }

  @VisibleForTesting
  AccessSecretVersionResponse getSecretResponse(String projectId, String secretName) 
      throws Exception {
    SecretManagerServiceClient  client = SecretManagerServiceClient.create();
    SecretVersionName name = SecretVersionName.of(projectId, secretName, "latest");

    return client.accessSecretVersion(name);
  }

  @Autowired
  public DataSourceConfig(Environment env) {
    this.env = env;
  }
}
