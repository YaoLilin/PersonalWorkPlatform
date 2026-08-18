# 基础镜像
FROM eclipse-temurin:17-jre
# 将 jar 包拷贝到镜像根目录
COPY personal-work-server.jar /personal-work-server.jar
# 暴露端口
EXPOSE 8080
# 启动后执行的命令
ENTRYPOINT ["java", "-jar", "/personal-work-server.jar" ,"--spring.profiles.active=dev-docker"]
