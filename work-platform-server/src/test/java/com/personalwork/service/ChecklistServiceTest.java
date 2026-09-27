package com.personalwork.service;

import com.personalwork.dao.ChecklistMapper;
import com.personalwork.dao.ProjectTimeMapper;
import com.personalwork.domain.dto.ChecklistDto;
import com.personalwork.domain.dto.ChecklistScheduleTimeDto;
import com.personalwork.security.bean.UserDetail;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Proxy;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * <p>清单服务单元测试。</p>
 */
class ChecklistServiceTest {

    /**
     * <p>清理测试用户上下文。</p>
     */
    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    /**
     * <p>清单列表应包含其关联的全部日程时间段。</p>
     */
    @Test
    void listShouldAttachScheduleTimesToMatchingChecklist() {
        UserDetail user = new UserDetail("admin", "admin", "", "", 1);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(user, null));
        ChecklistDto checklist = new ChecklistDto();
        checklist.setId(10);
        ChecklistScheduleTimeDto scheduleTime = new ChecklistScheduleTimeDto();
        scheduleTime.setChecklistId(10);
        scheduleTime.setStartTime("09:00");
        ChecklistMapper checklistMapper = createMapperProxy(ChecklistMapper.class, "listByUserId", List.of(checklist));
        ProjectTimeMapper projectTimeMapper = createMapperProxy(ProjectTimeMapper.class,
                "listChecklistScheduleTimesByUser", List.of(scheduleTime));

        List<ChecklistDto> result = new ChecklistService(checklistMapper, projectTimeMapper).list();

        assertEquals(1, result.get(0).getScheduleTimes().size());
        assertEquals("09:00", result.get(0).getScheduleTimes().get(0).getStartTime());
        assertTrue(result.get(0).getScheduleTimes().contains(scheduleTime));
    }

    /**
     * <p>创建仅响应指定方法的 Mapper 内存代理，避免测试依赖 JVM 字节码代理。</p>
     *
     * @param mapperType Mapper 接口类型
     * @param methodName 需要返回数据的方法名
     * @param result 指定方法的返回值
     * @return Mapper 内存代理
     * @param <T> Mapper 类型
     */
    @SuppressWarnings("unchecked")
    private static <T> T createMapperProxy(Class<T> mapperType, String methodName, Object result) {
        return (T) Proxy.newProxyInstance(mapperType.getClassLoader(), new Class[]{mapperType}, (proxy, method, args) -> {
            if (methodName.equals(method.getName())) {
                return result;
            }
            throw new UnsupportedOperationException("测试未实现 Mapper 方法: " + method.getName());
        });
    }
}
