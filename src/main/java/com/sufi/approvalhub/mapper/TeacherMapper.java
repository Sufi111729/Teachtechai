package com.sufi.approvalhub.mapper;

import com.sufi.approvalhub.domain.entity.TeacherProfile;
import com.sufi.approvalhub.dto.admin.PendingTeacherDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = MapperConfigBase.class)
public interface TeacherMapper {
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "name", source = "user.name")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "status", source = "user.status")
    @Mapping(target = "createdAt", source = "user.createdAt")
    PendingTeacherDto toPendingTeacherDto(TeacherProfile profile);
}
