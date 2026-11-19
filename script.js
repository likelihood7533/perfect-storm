// 浮動框：活動日程輪播（每 3 秒換一張），並自動標示進行中／即將到來／已結束
document.querySelectorAll('.info-float').forEach(function(box){
  var slides = box.querySelectorAll('.slide');
  var dotsWrap = box.querySelector('.dots');
  var today = new Date(); today.setHours(0,0,0,0);
  var i = -1;
  slides.forEach(function(s, n){
    var start = new Date(s.dataset.start + 'T00:00:00');
    var end = new Date(s.dataset.end + 'T00:00:00');
    var tag = s.querySelector('.status');
    if(today > end){ tag.textContent = '已結束'; tag.classList.add('past'); }
    else if(today >= start){ tag.textContent = '進行中'; tag.classList.add('now'); if(i < 0) i = n; }
    else { tag.textContent = '即將到來'; if(i < 0) i = n; }
    var d = document.createElement('span');
    dotsWrap.appendChild(d);
  });
  if(i < 0) i = 0;   // 全部結束就從第一個開始
  var dots = dotsWrap.querySelectorAll('span');
  slides[i].classList.add('show'); dots[i].classList.add('on');
  setInterval(function(){
    slides[i].classList.remove('show'); dots[i].classList.remove('on');
    i = (i + 1) % slides.length;
    slides[i].classList.add('show'); dots[i].classList.add('on');
  }, 3000);
});

// 往下捲超過 200px，浮動框加上 compact（縮小變直條）
function checkScroll(){
  document.querySelectorAll('.info-float').forEach(function(box){
    box.classList.toggle('compact', window.scrollY > 200);
  });
}
window.addEventListener('scroll', checkScroll);
checkScroll();

// ---------- 換頁讀取動畫 ----------
(function(){
  var loader = document.getElementById('loader');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(){ if(loader) loader.classList.add('show'); }
  function hide(){ if(loader) loader.classList.remove('show'); }
  window.PS_LOADER = { show: show, hide: hide, reduce: reduce };
  var start = Date.now();
  window.addEventListener('load', function(){
    setTimeout(hide, Math.max(0, (reduce ? 100 : 500) - (Date.now() - start)));
  });
  window.addEventListener('pageshow', function(e){ if(e.persisted) hide(); });
  // 點站內 .html 連結：先播動畫再換頁
  document.addEventListener('click', function(e){
    var a = e.target.closest('a');
    if(!a) return;
    var href = a.getAttribute('href') || '';
    if(a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || !/\.html$/.test(href)) return;
    e.preventDefault();
    show();
    setTimeout(function(){ location.href = href; }, reduce ? 100 : 450);
  });
})();

// ---------- 像素雷雨背景 ----------
(function(){
  var c = document.createElement('canvas');
  c.id = 'weather';
  c.setAttribute('aria-hidden', 'true');
  document.body.appendChild(c);
  var ctx = c.getContext('2d');
  var W, H, drops = [], P = 2;
  var on = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var flash = 0, bolt = null, next = Date.now() + 3500;

  function newDrop(anyY){
    return { x: Math.floor(Math.random() * W / P) * P,
             y: anyY ? Math.random() * H : -20,
             v: 6 + Math.random() * 6,
             l: (3 + Math.floor(Math.random() * 4)) * P };
  }
  function resize(){
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
    drops = [];
    for(var i = 0; i < Math.round(W / 11); i++) drops.push(newDrop(true));
  }
  // 閃電：用 6px 方塊一格一格往下鋸齒走
  function makeBolt(){
    var x = Math.floor((W * 0.25 + Math.random() * W * 0.6) / 6) * 6, y = 0, pts = [];
    while(y < H * 0.65){
      pts.push([x, y]);
      y += 6;
      if(Math.random() < 0.35) x += (Math.random() < 0.5 ? -6 : 6) * (1 + Math.floor(Math.random() * 2));
    }
    return { pts: pts, t: Date.now() };
  }
  function frame(){
    ctx.clearRect(0, 0, W, H);
    if(on && !document.hidden){
      ctx.fillStyle = 'rgba(160,190,225,.34)';
      for(var i = 0; i < drops.length; i++){
        var d = drops[i];
        ctx.fillRect(d.x, Math.floor(d.y / P) * P, P, d.l);
        d.y += d.v;
        if(d.y > H) drops[i] = newDrop(false);
      }
      var now = Date.now();
      if(now > next){ bolt = makeBolt(); flash = 1; next = now + 7000 + Math.random() * 9000;
        document.body.classList.add('strike'); setTimeout(function(){ document.body.classList.remove('strike'); }, 320); }
      if(bolt){
        var age = now - bolt.t;
        if(age < 360){
          ctx.fillStyle = (age % 120 < 60) ? '#fff6c2' : '#f3cf2f';
          bolt.pts.forEach(function(p){ ctx.fillRect(p[0], p[1], 6, 6); });
        } else bolt = null;
      }
      if(flash > 0){
        ctx.fillStyle = 'rgba(255,255,255,' + (flash * 0.28) + ')';
        ctx.fillRect(0, 0, W, H);
        flash -= 0.06;
      }
    }
    requestAnimationFrame(frame);
  }
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(frame);

  // 左側開關
  var btn = document.querySelector('.weather-toggle');
  function label(){
    if(!btn) return;
    btn.textContent = on ? '雷雨效果：開' : '雷雨效果：關';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  if(btn) btn.addEventListener('click', function(){ on = !on; label(); });
  label();
})();
