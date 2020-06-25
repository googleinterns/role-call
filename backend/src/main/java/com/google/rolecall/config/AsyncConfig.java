package com.google.rolecall.config;

import java.util.concurrent.Executor;

import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.aop.interceptor.SimpleAsyncUncaughtExceptionHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/** This class enables asyncronous calls by initializing a default thread executor and an
 * accompanying exception handler for all asyncronous methods in the application. Targets
 * methods annotated with @async.
 */
@EnableAsync
@Configuration
public class AsyncConfig implements AsyncConfigurer {

  @Value("${thread.pool.size}")
  private int poolSize;

  @Value("${max.queue.capacity}")
  private int queueCapacity;

  @Value("${allow.core.thread.timeout}")
  private boolean threadTimeout;

  @Value("${wait.for.task.completion.on.shutdown}")
  private boolean waitTaskCompleteOnShutdown;

  @Value("${await.termination}")
  private int awaitTermination;

  @Value("${thread.name.prefix}")
  private String threadNamePrefix;
  

  @Override
  public Executor getAsyncExecutor() {
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
}
