package com.google.rolecall.config;

import com.google.api.gax.rpc.ApiException;
import com.google.cloud.secretmanager.v1.AccessSecretVersionResponse;
import com.google.cloud.secretmanager.v1.SecretPayload;
import static com.google.common.truth.Truth.assertThat;
import com.google.protobuf.ByteString;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.Assert.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;

import java.io.IOException;

import org.springframework.mock.env.MockEnvironment;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class DataSourceUnitTests {

  private DataSourceConfig config;

  private String dbName = "dbname";
  private String url = "url";
  private String username = "username";
  private String password = "password";
  private String connection = "connection";
  private String projectId = "proj";
  private String secretName = "secret";

  @BeforeEach
  public void init() {
    MockEnvironment enviroment = new MockEnvironment();
    config = spy(new DataSourceConfig(enviroment));

    enviroment.setProperty("spring.cloud.gcp.sql.databaseName", dbName);
    enviroment.setProperty("spring.datasource.url", url);
    enviroment.setProperty("spring.datasource.username", username);
    enviroment.setProperty("spring.datasource.password", password);
    enviroment.setProperty("spring.cloud.gcp.sql.instance-connection-name", connection);
    enviroment.setProperty("spring.cloud.gcp.projectId", projectId);
    enviroment.setProperty("cloud.secret.name", secretName);
  }

  @Test
  public void getLocalDataSource_success() throws Exception {
    // Execute
    DataSource result = config.getDataSourceLocalMySql();

    // Assert
    assertThat(result).isInstanceOf(HikariDataSource.class);
    HikariDataSource src = (HikariDataSource) result;
    assertThat(src.getUsername()).isEqualTo(username);
    assertThat(src.getPassword()).isEqualTo(password);
    assertThat(src.getJdbcUrl()).isEqualTo(url);
    src.close();
  }

  @Test
  public void getCloudDataSource_success() throws Exception {
    // Mock
    try {
      doReturn(AccessSecretVersionResponse.newBuilder()
          .setPayload(SecretPayload.newBuilder()
          .setData(ByteString.copyFrom(password.getBytes())))
          .build())
          .when(config).getSecretResponse(eq(projectId), eq(secretName));
    } catch (Exception e) {
      e.printStackTrace();
    }

    // Execute
    HikariConfig result = config.getCloudConfig();

    // Assert
    assertThat(result.getUsername()).isEqualTo(username);
    assertThat(result.getPassword()).isEqualTo(password);
    assertThat(result.getJdbcUrl()).isEqualTo(String.format("jdbc:mysql:///%s", dbName));
  }

  @Test
  public void getCloudDataSourceWrongEnv_failure() throws Exception {
    // Mock
    doThrow(new IOException()).when(config).getSecretResponse(eq(projectId), eq(secretName));

    // Execute
    RuntimeException ex = assertThrows(RuntimeException.class, config::getCloudConfig);

    // Assert
    assertThat(ex).hasMessageThat().isEqualTo("Unable to access secret manager. "
      + "Applications calling this method should be run on App Engine.");
  }

  @Test
  public void getCloudDataSourceWrongSecret_failure() throws Exception {
    // Mock
    doThrow(mock(ApiException.class)).when(config).getSecretResponse(eq(projectId), eq(secretName));

    // Execute
    RuntimeException ex = assertThrows(RuntimeException.class, config::getCloudConfig);

    // Assert
    assertThat(ex).hasMessageThat().isEqualTo("Unable to get cloud db password. Call for password failed."
        + " Check spring.cloud.gcp.projectId and cloud.secret.name for correctness.");
  }

  @Test
  public void getCloudDataSourceUnexpectedException_failure() throws Exception {
    // Mock
    Exception exception = mock(Exception.class);
    doThrow(exception).when(config).getSecretResponse(eq(projectId), eq(secretName));
    doReturn("Error message").when(exception).getMessage();

    // Execute
    RuntimeException ex = assertThrows(RuntimeException.class, config::getCloudConfig);

    // Assert
    assertThat(ex).hasMessageThat().isEqualTo("Failed to get cloud db password for UNKNOWN reason: \n"
        + "Error message");
  }
}
