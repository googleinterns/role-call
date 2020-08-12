package com.google.rolecall.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("dashboardServices")
@Transactional(rollbackFor = Exception.class)
public class DashboardServices {
  
}