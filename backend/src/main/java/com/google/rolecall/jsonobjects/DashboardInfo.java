package com.google.rolecall.jsonobjects;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import java.util.List;
import javax.annotation.Nullable;

@AutoValue
public abstract class DashboardInfo {
  
  @Nullable
  @JsonProperty("performances")
  public abstract List<PerformanceInfo> performances();

  public static Builder newBuilder() {
    return new AutoValue_DashboardInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder { 

    @JsonProperty("performances")
    public abstract Builder setPerformances(List<PerformanceInfo> performances);

    public abstract DashboardInfo build();
  }
}
