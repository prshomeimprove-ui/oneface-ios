// One Face: iPhone-only code. Runs only inside the iPhone app, never on the website.
(function () {
  var C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  window.OF_NATIVE = true;
  var PN = C.Plugins && C.Plugins.PushNotifications;
  if (!PN) return;
  var KEY = 'of_ios_token';
  function saved() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function keep(t) { try { localStorage.setItem(KEY, t); } catch (e) {} }
  function forget() { try { localStorage.removeItem(KEY); } catch (e) {} }

  async function store(token) {
    keep(token);
    try { if (typeof S !== 'undefined' && S.user) await SB.rpc('register_device', { p_token: token, p_platform: 'ios' }); } catch (e) {}
  }
  PN.addListener('registration', function (t) { store(t.value); });
  PN.addListener('registrationError', function () {});
  PN.addListener('pushNotificationActionPerformed', function (a) {
    try {
      var u = a && a.notification && a.notification.data && a.notification.data.url; if (!u) return;
      var i = u.indexOf('#'); if (i >= 0) location.hash = u.slice(i);
    } catch (e) {}
  });

  // the website's own functions are replaced here with the iPhone versions
  window.pushStatus = async function () {
    try {
      var p = await PN.checkPermissions();
      if (p.receive === 'denied') return 'denied';
      return p.receive === 'granted' && saved() ? 'on' : 'off';
    } catch (e) { return 'off'; }
  };
  window.enablePush = async function () {
    try {
      var p = await PN.requestPermissions();
      if (p.receive !== 'granted') return false;
      await PN.register();
      for (var i = 0; i < 40 && !saved(); i++) await new Promise(function (r) { setTimeout(r, 250); });
      var t = saved(); if (!t) return false;
      await SB.rpc('register_device', { p_token: t, p_platform: 'ios' });
      return true;
    } catch (e) { return false; }
  };
  window.disablePush = async function () {
    try { var t = saved(); if (t) await SB.from('push_devices').delete().eq('token', t); forget(); } catch (e) {}
  };

  // each time the app opens and the person is signed in: refresh the phone's token quietly
  var tries = 0, iv = setInterval(async function () {
    tries++;
    try {
      if (typeof S !== 'undefined' && S.user) {
        clearInterval(iv);
        var p = await PN.checkPermissions();
        if (p.receive === 'granted') await PN.register();
      }
    } catch (e) {}
    if (tries > 60) clearInterval(iv);
  }, 2000);
})();
