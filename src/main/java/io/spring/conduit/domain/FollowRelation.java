package io.spring.conduit.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "follow_relations")
@IdClass(FollowRelation.FollowRelationId.class)
public class FollowRelation {

    @Id
    @Column(name = "follower_id")
    private String followerId;

    @Id
    @Column(name = "following_id")
    private String followingId;

    public FollowRelation() {
    }

    public FollowRelation(String followerId, String followingId) {
        this.followerId = followerId;
        this.followingId = followingId;
    }

    public String getFollowerId() {
        return followerId;
    }

    public void setFollowerId(String followerId) {
        this.followerId = followerId;
    }

    public String getFollowingId() {
        return followingId;
    }

    public void setFollowingId(String followingId) {
        this.followingId = followingId;
    }

    public static class FollowRelationId implements Serializable {
        private String followerId;
        private String followingId;

        public FollowRelationId() {
        }

        public FollowRelationId(String followerId, String followingId) {
            this.followerId = followerId;
            this.followingId = followingId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            FollowRelationId that = (FollowRelationId) o;
            return Objects.equals(followerId, that.followerId) && Objects.equals(followingId, that.followingId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(followerId, followingId);
        }
    }
}
