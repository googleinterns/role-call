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
    JPEG("jpeg"),
    PNG("png"),
    HEIC("heic");

    public final String name;

    private FileType(String name) {
      this.name = name;
    }
  }

  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Integer id;

  @Enumerated(EnumType.STRING)
  private AssetType type;

  @Enumerated(EnumType.STRING)
  private FileType fileType;

  @Column(nullable = false)
  private Date dateUploaded;

  @Column(nullable = false)
  private Boolean isDeleted;

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

  public Boolean isDeleted() {
    return isDeleted;
  }

  public User getOwner() {
    return owner;
  }

  public void setOwner(User owner) {
    this.owner = owner;
  }

  public void delete() {
    this.isDeleted = true;
  }

  public UserAsset(AssetType type, FileType fileType) {
    this.type = type;
    this.fileType = fileType;
    isDeleted = false;
    dateUploaded = new Date(System.currentTimeMillis());
  }
}