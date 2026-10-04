(function () {
  'use strict';
  var assets = window.EXHIBIT_ASSETS || {};
  var contexts = {
    hanhtrinh: ['vn-nharong', 'Từ bến Nhà Rồng, theo dấu hành trình tìm đường cứu nước.'],
    doclap: ['vn-badinh1945', 'Mùa thu độc lập — khát vọng của cả một dân tộc.'],
    xahoi: ['vn-production', 'Xây dựng cuộc sống ấm no từ lao động và trách nhiệm.'],
    dang: ['vn-party', 'Đảng gắn bó với nhân dân, tận tâm phụng sự nhân dân.'],
    nhanuoc: ['vn-constitution', 'Một nhà nước của dân, do dân và vì dân.'],
    doanket: ['vn-culture', 'Đoàn kết là sức mạnh để cùng đi tới.'],
    quocte: ['vn-geneva', 'Tinh thần đoàn kết quốc tế, khát vọng hòa bình.'],
    vanhoa: ['vn-culture', 'Văn hóa soi đường, nuôi dưỡng con người.'],
    daoduc: ['vn-planting', 'Học theo Bác từ những việc làm giản dị mỗi ngày.'],
    thanhnien: ['vn-planting', 'Gieo những mầm xanh, chăm lo cho thế hệ mai sau.']
  };
  var order = Object.keys(contexts);
  function decorateTopics() {
    document.querySelectorAll('#toc .toc-row').forEach(function (button) {
      if (button.querySelector('.topic-thumbnail')) return;
      var context = contexts[order[Number(button.dataset.topic)]];
      if (!context) return;
      var asset = assets[context[0]], image = document.createElement('img');
      image.src = asset.local; image.alt = ''; image.className = 'topic-thumbnail';
      image.loading = 'lazy'; image.width = 91; image.height = 118;
      button.prepend(image);
    });
  }
  document.addEventListener('exhibit-context', function (event) {
    var context = contexts[event.detail.id];
    if (!context) return;
    var id = context[0], asset = assets[id];
    document.getElementById('study-heading').textContent = event.detail.title;
    document.getElementById('study-caption').textContent = context[1];
    var backgroundId = event.detail.id === 'dang' ? 'vn-flags' : 'vn-badinh';
    var backgroundButton = document.querySelector('.study-source');
    backgroundButton.dataset.asset = backgroundId;
    backgroundButton.textContent = 'Ảnh nền: ' + assets[backgroundId].artist + ' ↗';
    var image = document.getElementById('topic-archive-image');
    image.src = asset.local; image.alt = asset.caption || asset.title;
    document.getElementById('topic-archive-caption').textContent = asset.caption || asset.title;
    document.getElementById('topic-archive-source').textContent = asset.artist + ' · ' + asset.publisher;
    document.querySelectorAll('.topic-archive [data-asset]').forEach(function (button) { button.dataset.asset = id; });
    document.body.dataset.studyTopic = event.detail.id;
  });
  document.addEventListener('exhibit-view', function (event) {
    if (event.detail === 'home') decorateTopics();
  });
  decorateTopics();
})();
