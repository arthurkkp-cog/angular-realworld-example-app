package io.spring.conduit.service;

import io.spring.conduit.domain.FollowRelation;
import io.spring.conduit.domain.User;
import io.spring.conduit.repository.FollowRelationRepository;
import io.spring.conduit.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final FollowRelationRepository followRelationRepository;

    public ProfileService(UserRepository userRepository, FollowRelationRepository followRelationRepository) {
        this.userRepository = userRepository;
        this.followRelationRepository = followRelationRepository;
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean isFollowing(User follower, User following) {
        if (follower == null || following == null) {
            return false;
        }
        return followRelationRepository.existsByFollowerIdAndFollowingId(follower.getId(), following.getId());
    }

    @Transactional
    public void follow(User follower, User following) {
        if (!isFollowing(follower, following)) {
            FollowRelation relation = new FollowRelation(follower.getId(), following.getId());
            followRelationRepository.save(relation);
        }
    }

    @Transactional
    public void unfollow(User follower, User following) {
        followRelationRepository.deleteByFollowerIdAndFollowingId(follower.getId(), following.getId());
    }
}
