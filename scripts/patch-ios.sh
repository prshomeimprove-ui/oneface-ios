#!/bin/bash
# Run after "npx cap add ios": sets icon, splash, permissions, push and iPhone-only.
set -e
APP=ios/App/App
PL=$APP/Info.plist
pb() { /usr/libexec/PlistBuddy -c "Set :$1 $2" "$PL" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :$1 ${3:-string} $2" "$PL"; }
pb CFBundleDisplayName "One Face"
pb NSCameraUsageDescription "One Face uses the camera so you can take photos and videos to share, and for video calls."
pb NSMicrophoneUsageDescription "One Face uses the microphone for voice messages, videos and calls."
pb NSPhotoLibraryUsageDescription "One Face lets you choose photos and videos from your library to share."
pb NSPhotoLibraryAddUsageDescription "One Face can save photos and videos to your library."
pb NSLocationWhenInUseUsageDescription "One Face uses your approximate location to show people and places near you."
pb ITSAppUsesNonExemptEncryption false bool
/usr/libexec/PlistBuddy -c "Delete :UIBackgroundModes" "$PL" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :UIBackgroundModes array" "$PL"
/usr/libexec/PlistBuddy -c "Add :UIBackgroundModes:0 string remote-notification" "$PL"

cat > $APP/App.entitlements <<'E'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>aps-environment</key><string>production</string></dict></plist>
E

# icon (1024, no transparency)
cp resources/icon-1024.png "$APP/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
# splash
for f in "$APP"/Assets.xcassets/Splash.imageset/*.png; do cp resources/splash.png "$f"; done

# project settings for the App target only
ruby -e '
require "xcodeproj"
p = Xcodeproj::Project.open("ios/App/App.xcodeproj")
t = p.targets.find { |x| x.name == "App" }
t.build_configurations.each do |c|
  s = c.build_settings
  s["CODE_SIGN_ENTITLEMENTS"] = "App/App.entitlements"
  s["DEVELOPMENT_TEAM"] = ENV["TEAM_ID"]
  s["CODE_SIGN_STYLE"] = "Automatic"
  s["TARGETED_DEVICE_FAMILY"] = "1"
  s["IPHONEOS_DEPLOYMENT_TARGET"] = [s["IPHONEOS_DEPLOYMENT_TARGET"].to_f, 15.0].max.to_s
end
p.save
puts "project patched"
'
