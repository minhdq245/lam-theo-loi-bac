/* Chuyển động chỉ trang trí: toàn bộ nội dung vẫn đọc được nếu JS không chạy. */
(function(){
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var revealObserver, frame = 0, parallaxItems = new Set();
  var home = document.getElementById('home');
  var progress = document.querySelector('.reading-progress');
  var root = document.documentElement;
  var navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  var sections = ['hanh-trinh','hoc-va-lam','tu-lieu'].map(function(id){return document.getElementById(id);});

  if('IntersectionObserver' in window){
    revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}
      });
    },{threshold:.06,rootMargin:'0px 0px -25px 0px'});
    var parallaxObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){if(entry.isIntersecting)parallaxItems.add(entry.target);else parallaxItems.delete(entry.target);});
      queuePaint();
    },{rootMargin:'100px'});
    document.querySelectorAll('[data-parallax]').forEach(function(el){parallaxObserver.observe(el);});
    watchReveals();
    document.body.classList.add('motion-ready');
  }
  function watchReveals(){
    if(!revealObserver)return;
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(function(el){revealObserver.observe(el);});
    // Các thẻ chủ đề được bộ máy học tập tạo lại khi quay về trang đầu.
    document.querySelectorAll('#toc > li').forEach(function(el,i){
      el.setAttribute('data-reveal','');el.style.setProperty('--delay',(i%2)*70+'ms');revealObserver.observe(el);
    });
  }
  function paint(){
    frame=0;
    var max = Math.max(1,root.scrollHeight-innerHeight);
    progress.style.transform='scaleX('+Math.min(1,Math.max(0,scrollY/max))+')';
    if(!reduced.matches && !home.hidden){
      parallaxItems.forEach(function(el){
        var parent=el.closest('.hero-art,.chapter-art');
        if(!parent)return;
        var rect=parent.getBoundingClientRect();
        var amount=Math.max(-40,Math.min(40,(innerHeight*.5-rect.top-rect.height*.5)*Number(el.dataset.parallax)));
        el.style.transform='translate3d(0,'+amount.toFixed(2)+'px,0)';
      });
    }
    var active = '';
    if(!home.hidden)sections.forEach(function(el){if(el.getBoundingClientRect().top<innerHeight*.45)active=el.id;});
    navLinks.forEach(function(a){if(a.hash==='#'+active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  }
  function queuePaint(){if(!frame)frame=requestAnimationFrame(paint);}
  addEventListener('scroll',queuePaint,{passive:true});
  addEventListener('resize',queuePaint,{passive:true});
  reduced.addEventListener('change',function(){document.querySelectorAll('[data-parallax]').forEach(function(el){el.style.transform='';});queuePaint();});
  document.addEventListener('exhibit-view',function(e){
    var studying=e.detail!=='home';
    document.body.classList.toggle('studying',studying);
    document.querySelector('.nav-links').hidden=studying;
    if(!studying)watchReveals();
    queuePaint();
  });
  document.addEventListener('click',function(e){
    var topic=e.target.closest('[data-play-topic]');
    if(topic)document.dispatchEvent(new CustomEvent('exhibit-topic',{detail:topic.dataset.playTopic}));
    var link=e.target.closest('a[href^="#"]');
    if(link && home.hidden && link.closest('.site-nav')){
      e.preventDefault();
      document.dispatchEvent(new CustomEvent('exhibit-home'));
      requestAnimationFrame(function(){var target=document.getElementById(link.hash.slice(1));if(target)target.scrollIntoView({behavior:reduced.matches?'auto':'smooth'});});
    }
  });

  /* Nhạc được nhúng từ kênh nghệ sĩ; chỉ tải sau thao tác mở của người xem. */
  var tracks=[
    {id:'y5597X_nwFc',title:'Hồ Chí Minh đẹp nhất tên Người',composer:'Trần Kiết Tường',artist:'Trọng Tấn'},
    {id:'sAT6yTqkPQU',title:'Bác Hồ một tình yêu bao la',composer:'Thuận Yến',artist:'Trọng Tấn'}
  ];
  var panel=document.getElementById('music-panel');
  var launcher=document.getElementById('music-launcher');
  var player=document.getElementById('music-player');
  var selected=0;
  function selectTrack(index){
    selected=index;
    var track=tracks[index];
    player.replaceChildren();
    var iframe=document.createElement('iframe');
    iframe.src='https://www.youtube-nocookie.com/embed/'+track.id+'?rel=0&playsinline=1';
    iframe.title=track.title+' — '+track.artist;
    iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen=true;
    iframe.referrerPolicy='strict-origin-when-cross-origin';
    player.appendChild(iframe);
    document.getElementById('music-external').href='https://www.youtube.com/watch?v='+track.id;
    document.getElementById('music-status').textContent='Bấm phát trong video để nghe. Đóng khung nhạc để dừng.';
    panel.querySelectorAll('[data-track]').forEach(function(b){b.setAttribute('aria-pressed',String(Number(b.dataset.track)===index));});
  }
  function closeMusic(){
    panel.hidden=true;player.replaceChildren();launcher.setAttribute('aria-expanded','false');launcher.focus({preventScroll:true});
  }
  launcher.addEventListener('click',function(){
    if(!panel.hidden){closeMusic();return;}
    panel.hidden=false;launcher.setAttribute('aria-expanded','true');selectTrack(selected);
  });
  document.getElementById('close-music').addEventListener('click',closeMusic);
  panel.addEventListener('click',function(e){var b=e.target.closest('[data-track]');if(b)selectTrack(Number(b.dataset.track));});

  var assets=window.EXHIBIT_ASSETS||{};
  var assetDialog=document.getElementById('asset-dialog');
  var sourceDialog=document.getElementById('source-dialog');
  var captions={house:'Ngôi nhà sàn của Bác · Hà Nội, 2003',children:'Chủ tịch Hồ Chí Minh với thiếu nhi · thập niên 1950',young:'Nguyễn Ái Quốc tại Marseille · 1921',portrait:'Chân dung Chủ tịch Hồ Chí Minh',congress:'Đại hội II của Đảng · tháng 2/1951',declaration:'Bản Tuyên ngôn độc lập · Trung tâm Lưu trữ quốc gia III'};
  function openAsset(id){
    var asset=assets[id];if(!asset)return;
    document.getElementById('asset-title').textContent=asset.caption||captions[id]||asset.title||id;
    var img=document.getElementById('asset-image');img.src=asset.local;img.alt=asset.caption||captions[id]||asset.title||id;
    document.getElementById('asset-credit').textContent='Nguồn: '+(asset.publisher||'Wikimedia Commons')+'. '+(asset.artist?'Ảnh / tư liệu: '+asset.artist+'. ':'')+asset.license+'.';
    document.getElementById('asset-source').href=asset.source;
    assetDialog.showModal();
  }
  var sourceList=document.getElementById('sources-list');
  Object.keys(assets).forEach(function(id){
    var asset=assets[id],li=document.createElement('li'),a=document.createElement('a'),small=document.createElement('small');
    a.textContent=asset.caption||captions[id]||asset.title||id;a.href=asset.source;a.target='_blank';a.rel='noopener noreferrer';
    small.textContent=(asset.publisher||'Wikimedia Commons')+' · '+(asset.artist?'Ảnh / tư liệu: '+asset.artist+' · ':'')+asset.license;
    if(asset.license==='CC BY-SA 3.0'){
      var license=document.createElement('a');license.href='https://creativecommons.org/licenses/by-sa/3.0/';license.textContent=' · Điều khoản CC BY-SA 3.0';license.target='_blank';license.rel='noopener noreferrer';small.appendChild(license);
    }
    li.append(a,small);sourceList.appendChild(li);
  });
  tracks.forEach(function(track){
    var li=document.createElement('li'),a=document.createElement('a'),small=document.createElement('small');
    a.textContent=track.title;a.href='https://www.youtube.com/watch?v='+track.id;a.target='_blank';a.rel='noopener noreferrer';
    small.textContent='Sáng tác: '+track.composer+' · Biểu diễn: '+track.artist+' · Nguồn: Trọng Tấn Official / YouTube. Nhúng trình phát từ nguồn gốc.';
    li.append(a,small);sourceList.appendChild(li);
  });
  document.addEventListener('click',function(e){
    var asset=e.target.closest('[data-asset]');if(asset)openAsset(asset.dataset.asset);
    if(e.target.closest('[data-open-sources]'))sourceDialog.showModal();
    var close=e.target.closest('[data-close-dialog]');if(close)close.closest('dialog').close();
  });
  [assetDialog,sourceDialog].forEach(function(dialog){dialog.addEventListener('click',function(e){
    if(e.target!==dialog)return;
    var r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();
  });});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden&&!assetDialog.open&&!sourceDialog.open&&!document.getElementById('notes').open)closeMusic();});
  queuePaint();
})();
