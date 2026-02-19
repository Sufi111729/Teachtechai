package com.sufi.approvalhub.mapper;

import com.sufi.approvalhub.domain.entity.StudentProfile;
import com.sufi.approvalhub.dto.admin.PendingStudentDto;
import com.sufi.approvalhub.dto.teacher.TeacherPendingStudentDto;
import com.sufi.approvalhub.dto.student.StudentProfileDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(config = MapperConfigBase.class)
public interface StudentMapper {
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "name", source = "user.name")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "status", source = "user.status")
    @Mapping(target = "createdAt", source = "user.createdAt")
    @Mapping(target = "assignedTeacherCode", source = "assignedTeacher.teacherCode")
    PendingStudentDto toPendingStudentDto(StudentProfile profile);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "name", source = "user.name")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "status", source = "user.status")
    TeacherPendingStudentDto toTeacherPendingStudentDto(StudentProfile profile);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "name", source = "user.name")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "role", source = "user.role")
    @Mapping(target = "status", source = "user.status")
    @Mapping(target = "assignedTeacherCode", source = "assignedTeacher.teacherCode")
    @Mapping(target = "assignedTeacherName", source = "assignedTeacher.user.name")
    StudentProfileDto toStudentProfileDto(StudentProfile profile);
}
