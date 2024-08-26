package com.personalwork.dao;

import com.personalwork.modal.entity.UserDo;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

@Repository
@Mapper
public interface UserMapper {
    UserDo getById(Integer id);
    UserDo getByName(String name);
    boolean insert(UserDo userDo);
    boolean update(UserDo userDo);
    boolean delete(Integer id);

}
