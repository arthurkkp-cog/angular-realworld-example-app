package io.spring.conduit.repository;

import io.spring.conduit.domain.FollowRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRelationRepository extends JpaRepository<FollowRelation, FollowRelation.FollowRelationId> {
    
    @Query("SELECT fr FROM FollowRelation fr WHERE fr.followerId = :followerId AND fr.followingId = :followingId")
    Optional<FollowRelation> findByFollowerIdAndFollowingId(@Param("followerId") String followerId, @Param("followingId") String followingId);
    
    @Query("SELECT fr.followingId FROM FollowRelation fr WHERE fr.followerId = :followerId")
    List<String> findFollowingIdsByFollowerId(@Param("followerId") String followerId);
    
    @Query("SELECT COUNT(fr) > 0 FROM FollowRelation fr WHERE fr.followerId = :followerId AND fr.followingId = :followingId")
    boolean existsByFollowerIdAndFollowingId(@Param("followerId") String followerId, @Param("followingId") String followingId);
    
    void deleteByFollowerIdAndFollowingId(String followerId, String followingId);
}
