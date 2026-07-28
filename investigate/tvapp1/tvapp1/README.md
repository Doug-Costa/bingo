# Terminal 1
cd /media/marcos/hd5001/react-native/loto1
export ELECTRON_DISABLE_SANDBOX=1
npx react-native start --reset-cache

# Terminal 2 (uma vez para instalar)
cd /media/marcos/hd5001/react-native/loto1
export ELECTRON_DISABLE_SANDBOX=1
npx react-native run-android

# Depois de instalado, só editar e salvar - Metro recarrega sozinho!


# Gerar APK release
cd /media/marcos/hd5001/react-native/loto1/android

cd android
./gradlew --stop
cd ..
rm -rf android/.gradle
rm -rf ~/.gradle/caches
rm -rf ~/.gradle/daemon
rm -rf ~/.gradle/wrapper
rm -rf node_modules
npm install --legacy-peer-deps
cd android
./gradlew clean
cd ..
npx react-native run-android


./gradlew assembleRelease

# O APK estará em:
ls -la app/build/outputs/apk/release/


# Instalar APK via USB
adb install android/app/build/outputs/apk/release/app-release.apk

# OU copiar para o celular e instalar manualmente

O export ELECTRON_DISABLE_SANDBOX=1 é só para desenvolvimento

Para gerar APK release, não precisa dessa variável



export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

java -version
javac -version
echo $JAVA_HOME

echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc


cd /caminho/do/projeto

nvm use 20

sed -i 's/gradle-9.0.0-bin.zip/gradle-8.10-bin.zip/g' android/gradle/wrapper/gradle-wrapper.properties




sed -i 's/Jvm.current()?.javaVersion?.majorVersion/Jvm.current().javaVersion?.majorVersion/g' \
node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/src/main/kotlin/com/facebook/react/ReactPlugin.kt

sed -i '/org.gradle.configurationcache.extensions.serviceOf/d' \
node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/build.gradle.kts

sed -i '/serviceOf<ModuleRegistry>()/d' \
node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/build.gradle.kts

cd android
./gradlew --stop
cd ..

rm -rf android/.gradle
rm -rf ~/.gradle/caches
rm -rf ~/.gradle/daemon
rm -rf ~/.gradle/wrapper
rm -rf node_modules

npm install --legacy-peer-deps

cd android
./gradlew clean
./gradlew assembleRelease --stacktrace



sed -i 's/Jvm.current()?.javaVersion?.majorVersion/Jvm.current().javaVersion?.majorVersion/g' \
node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/src/main/kotlin/com/facebook/react/ReactPlugin.kt

sed -i '/org.gradle.configurationcache.extensions.serviceOf/d' \
node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/build.gradle.kts

sed -i '/serviceOf<ModuleRegistry>()/d' \
node_modules/@react-native/gradle-plugin/react-native-gradle-plugin/build.gradle.kts