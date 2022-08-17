package com.google.rolecall.services;

import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.api.gax.rpc.UnimplementedException;
import com.google.rolecall.models.User;
import com.google.rolecall.models.UserAsset;
import com.google.rolecall.repos.UserAssetRepository;

@Service("profilePictureServices")
@Transactional(rollbackFor = Exception.class)
public class ProfilePictureServices {
    private final UserAssetRepository assetRepo;

    public InputStreamResource getProfilePicture(Integer imageId, UserAsset.FileType fileType) {
        try {

        } catch(Exception e) {

        }
        return new InputStreamResource();
    }

    public UserAsset createProfilePicture(User owner) {
        throw new UnimplementedException("Unimplemented");
    }

    public void deleteProfilePicture(User owner) {
        throw new UnimplementedException("Unimplemented");
    }

    public ProfilePictureServices(UserAssetRepository assetRepo) {
        this.assetRepo = assetRepo;
    }
}