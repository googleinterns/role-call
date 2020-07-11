package com.google.rolecall.config;

import java.util.concurrent.Executor;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.aop.interceptor.SimpleAsyncUncaughtExceptionHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/* 
 * This class enables asyncronous calls by initializing a default thread executor and an
 * accompanying exception handler for all asyncronous methods in the application. Targets
 * methods annotated with @async.
 */
@EnableAsync
@Configuration
public class AsyncConfig implements AsyncConfigurer {

  private final Environment env;

  @Override
  public Executor getAsyncExecutor() {
    int poolSize = Integer.parseInt(env.getProperty("thread.pool.size"));
    int queueCapacity = Integer.parseInt(env.getProperty("max.queue.capacity"));
    boolean threadTimeout = Boolean.parseBoolean(env.getProperty("allow.core.thread.timeout"));
    boolean waitTaskCompleteOnShutdown = Boolean.parseBoolean(
        env.getProperty("wait.for.task.completion.on.shutdown"));
    int awaitTermination = Integer.parseInt(env.getProperty("await.termination"));
    String threadNamePrefix = env.getProperty("thread.name.prefix");

    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    
    executor.setQueueCapacity(queueCapacity);
    executor.setMaxPoolSize(poolSize);
    executor.setAllowCoreThreadTimeOut(threadTimeout);
    executor.setWaitForTasksToCompleteOnShutdown(waitTaskCompleteOnShutdown);
    executor.setAwaitTerminationSeconds(awaitTermination);
    executor.setThreadNamePrefix(threadNamePrefix);

    executor.initialize();

    return executor;
  }

  @Override
  public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
    // TODO: Make comprehensive expetion handler
    return new SimpleAsyncUncaughtExceptionHandler();
  }

  @Autowired
  public AsyncConfig(Environment env) {
    this.env = env;
  }
}
