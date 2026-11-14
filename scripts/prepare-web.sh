#!/bin/bash
# Copies the web app into www/ and adjusts it for the iPhone app.
set -e
rm -rf www && mkdir www && cp -r app/. www/
rm -f www/demo-reel.mp4
cp resources/ios-native.js www/ios-native.js
BASE='https://onefaceapp.com/app/'
# inside the iPhone app the page address is not a web address, so links that get shared must point to the website
for f in www/*.js; do sed -i "s#location\.origin+location\.pathname#'$BASE'#g" "$f"; done
grep -q '</body>' www/index.html
sed -i 's#</body>#<script src="ios-native.js"></script></body>#' www/index.html
grep -q 'ios-native.js' www/index.html
echo "web ready: $(ls www | wc -l) files"
