@echo off
set "JAVA_HOME=C:\Users\User\AppData\Local\Programs\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
set "GRADLE_USER_HOME=D:\gradle_cache"
if not exist "%GRADLE_USER_HOME%" mkdir "%GRADLE_USER_HOME%"
set "JAVA_HOME=C:\Users\User\AppData\Local\Programs\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
set "PATH=%JAVA_HOME%\bin;C:\Users\User\AppData\Local\Android\Sdk\platform-tools;%PATH%"
echo ==== java.home ====
java -XshowSettings:properties -version 2>&1 | findstr "java.home"
echo ==== cwd ====
cd /d "C:\Users\User\OneDrive\Desktop\Reto Tecnico\Mini App de Gestión de Tareas\Frontend"
echo ==== run android ====
npx rnc-cli run-android
pause
