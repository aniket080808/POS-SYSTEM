package com.aniket.service;



import com.aniket.payload.AdminAnalysis.DashboardSummaryDTO;
import com.aniket.payload.AdminAnalysis.StoreRegistrationStatDTO;
import com.aniket.payload.AdminAnalysis.StoreStatusDistributionDTO;


import java.util.List;

public interface AdminDashboardService {

    DashboardSummaryDTO getDashboardSummary();

    List<StoreRegistrationStatDTO> getLast7DayRegistrationStats();

    StoreStatusDistributionDTO getStoreStatusDistribution();
}
