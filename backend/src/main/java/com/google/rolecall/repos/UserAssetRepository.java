package com.google.rolecall.repos;

import com.google.rolecall.models.UserAsset;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAssetRepository extends JpaRepository<UserAsset, Integer> {
}
