package com.google.rolecall.models;

import java.sql.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.springframework.http.MediaType;

import com.google.rolecall.jsonobjects.UserAssetInfo;

/* Asset owned by each user.*/
@Entity
@Table
public class UserAsset {

  public enum AssetType {
    PROFILEPICTURE("profilepicture");

    // String suggesting where to find the asset type such as a directory.
    public final String location;

    private AssetType(String location) {
      this.location = location;
    }
  }

  public enum FileType {
    JPG("jpg", MediaType.IMAGE_JPEG),
    PNG("png", MediaType.IMAGE_PNG);

    public final String name;
    public final MediaType responseType;

    private FileType(String name, MediaType responseType) {
      this.name = name;
      this.responseType = responseType;
    }
  }

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Integer id;

  @Enumerated(EnumType.STRING)
  private AssetType type;

  @Enumerated(EnumType.STRING)
  private FileType fileType;

  @Column(nullable = false)
  private Date dateUploaded;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  private User owner;

  public Integer getId() {
    return id;
  }

  public AssetType getType() {
    return type;
  }

  public FileType getFileType() {
    return fileType;
  }

  public Date getDateUploaded() {
    return dateUploaded;
  }

  public User getOwner() {
    return owner;
  }

  public void setOwner(User owner) {
    this.owner = owner;
  }

  public String getFileName() {
    return String.format("%d.%s", this.getId(), this.getFileType().name);
  }

  public UserAssetInfo toUserAssetInfo() {
    return UserAssetInfo.newBuilder()
        .setId(id)
        .setType(type.name())
        .setFileType(fileType.name)
        .setDateUploaded(dateUploaded.getTime())
        .setOwnerId(owner.getId())
        .build();
  }

  public UserAsset(AssetType type, FileType fileType) {
    this.type = type;
    this.fileType = fileType;
    dateUploaded = new Date(System.currentTimeMillis());
  }

  public UserAsset() {
  }
}