package com.google.rolecall.config;

import java.util.concurrent.Executor;
import static com.google.common.truth.Truth.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.aop.interceptor.SimpleAsyncUncaughtExceptionHandler;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class AsyncConfigUnitTests {
  
  @Test
  public void getAsyncExecutor_success() throws Exception {
    // Setup
    MockEnvironment env = new MockEnvironment();

    String poolSize = "1";
    env.setProperty("thread.pool.size",poolSize);
    String queueCapacity = "2";
    env.setProperty("max.queue.capacity", queueCapacity);
    String threadTimeout = "true";
    env.setProperty("allow.core.thread.timeout", threadTimeout);
    String waitTaskCompleteOnShutdown = "true";
    env.setProperty("wait.for.task.completion.on.shutdown", waitTaskCompleteOnShutdown);
    String awaitTermination = "3";
    env.setProperty("await.termination", awaitTermination);
    String threadNamePrefix = "name";
    env.setProperty("thread.name.prefix", threadNamePrefix);

    AsyncConfig config = new AsyncConfig(env);

    // Execute
    Executor result = config.getAsyncExecutor();

    // Assert
    assertThat(result).isInstanceOf(ThreadPoolTaskExecutor.class);
    ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) result;
    assert(String.valueOf(executor.getMaxPoolSize())).equals(poolSize);
    assert(executor.getThreadNamePrefix()).equals(threadNamePrefix);
    executor.shutdown();
  }

  @Test
  public void getAsyncUncaughtExceptionHandler_success() throws Exception {
     // Setup
     MockEnvironment env = new MockEnvironment();
     AsyncConfig config = new AsyncConfig(env);

    // Execute
    AsyncUncaughtExceptionHandler handler = config.getAsyncUncaughtExceptionHandler();

    // Assert
    assertThat(handler).isInstanceOf(SimpleAsyncUncaughtExceptionHandler.class);
  }
}
