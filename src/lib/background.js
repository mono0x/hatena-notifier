
var INTERVAL = 5 * 60;
var TIMEOUT  = 10;

var ICON_URL = 'http://cdn.www.st-hatena.com/images/header/notify.png';
var LOGIN_URL = 'https://www.hatena.ne.jp/login';

var errorShown = false;

function notify(image, title, text, url) {
  var notification = webkitNotifications.createNotification(image, title, text);
  notification.onclick = function() {
    chrome.tabs.create({ url: url });
    notification.cancel();
  };
  notification.show();
  setTimeout(function() {
    notification.cancel();
  }, TIMEOUT * 1000);
}

setInterval(function() {
  $.ajax({
    url: 'http://www.hatena.ne.jp/notify/notices.iframe'
  }).done(function(data) {
    var doc = $(data);
    var items = doc.find('#window-star li:not(:first-child)');
    items.each(function() {
      var item = $(this);
      var timestamp = parseInt(item.find('.timestamp').data('timestamp'), 10);
      var url = item.find('> a').attr('href');
      var image = item.find('.profile-image').attr('src');
      var body = item.find('.notify-body');
      body.find('img.star').each(function() {
        var star = $(this);
        star.after(/\/star\.gif$/.test(star.attr('src')) ? '☆' : '★');
      });
      if((+new Date) / 1000 - timestamp <= INTERVAL) {
        notify(image, 'あなたへのお知らせ', body.text(), url);
      }
    });
    errorShown = false;
  }).fail(function(xhr, textStatus, errorThrown) {
    if(!errorShown) {
      notify(ICON_URL, 'エラー', xhr.statusText, LOGIN_URL);
      errorShown = true;
    }
  });
}, INTERVAL * 1000);
