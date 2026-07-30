package com.aniket.service;

import com.aniket.exception.UserException;
import com.aniket.payload.request.OnboardingRequestDTO;
import com.aniket.payload.response.AuthResponse;

public interface OnboardingService {
    AuthResponse completeOnboarding(OnboardingRequestDTO dto) throws UserException;
}
