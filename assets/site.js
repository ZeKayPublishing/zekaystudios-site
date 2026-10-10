/* ZeKay Studios: shared behaviour for every page. */
(function(){
var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine = matchMedia('(pointer:fine)').matches;

/* ---------------- pixel clouds down the sides ---------------- */
(function(){
  var c = document.getElementById('sky');
  /* a page can swap the clouds for its own CSS backdrop with <body data-sky="doodles"> */
  if (!c || reduce || document.body.dataset.sky === 'doodles') return;
  var g = c.getContext('2d'), w, h, clouds = [], dpr = Math.min(devicePixelRatio || 1, 2);
  function mk(y){
    return {x:-260 + Math.random()*(innerWidth+520), y:y, s:1.6+Math.random()*2.4,
            v:.10+Math.random()*.16, o:.05+Math.random()*.07};
  }
  function size(){
    w = c.width = innerWidth*dpr; h = c.height = innerHeight*dpr;
    c.style.width = innerWidth+'px'; c.style.height = innerHeight+'px';
    g.setTransform(dpr,0,0,dpr,0,0);
    clouds = [];
    var n = 9;
    for (var i=0;i<n;i++) clouds.push(mk(40 + (innerHeight/n)*i + Math.random()*60));
  }
  /* blocky cloud, drawn as pixel rows so it matches the game art */
  var ROWS = [[2,7],[1,9],[0,11],[1,9],[3,5]];
  function draw(cl){
    g.fillStyle = 'rgba(150,205,245,' + cl.o + ')';
    var u = 7 * cl.s;
    for (var r=0;r<ROWS.length;r++){
      g.fillRect(cl.x + ROWS[r][0]*u, cl.y + r*u, ROWS[r][1]*u, u);
    }
  }
  (function loop(){
    g.clearRect(0,0,innerWidth,innerHeight);
    for (var i=0;i<clouds.length;i++){
      var cl = clouds[i];
      cl.x += cl.v;
      if (cl.x > innerWidth + 300){ cl.x = -320; cl.y = Math.random()*innerHeight; }
      draw(cl);
    }
    requestAnimationFrame(loop);
  })();
  size(); addEventListener('resize', size);
})();

/* ---------------- motes ---------------- */
var cv = document.getElementById('motes'), cx = cv && cv.getContext('2d'), M = [], W, H;
function sizeMotes(){
  W = cv.width = innerWidth; H = cv.height = innerHeight;
  var n = Math.min(64, Math.round(innerWidth / 24)); M = [];
  for (var i=0;i<n;i++){
    M.push({x:Math.random()*W, y:Math.random()*H, r:Math.random()*2+.4,
            s:Math.random()*.3+.05, d:Math.random()*6.28, o:Math.random()*.5+.14,
            g:Math.random() < .25});
  }
}
/* <body data-motes="stars"> draws twinkling four point sparkles instead of round motes */
var STARS = document.body.dataset.motes === 'stars', frame = 0;
function sparkle(x, y, r){
  var k = r * 2.6;
  cx.beginPath();
  cx.moveTo(x, y - k);
  cx.quadraticCurveTo(x, y, x + k, y);
  cx.quadraticCurveTo(x, y, x, y + k);
  cx.quadraticCurveTo(x, y, x - k, y);
  cx.quadraticCurveTo(x, y, x, y - k);
  cx.fill();
}
function paintMotes(){
  cx.clearRect(0,0,W,H);
  frame++;
  for (var i=0;i<M.length;i++){
    var m = M[i];
    m.y -= STARS ? m.s * .35 : m.s; m.d += .01; m.x += Math.sin(m.d)*.3;
    if (m.y < -10){ m.y = H+10; m.x = Math.random()*W; }
    if (STARS){
      var tw = .35 + .65 * Math.abs(Math.sin(frame * .018 * (1 + m.r * .4) + m.d * 3));
      var o = Math.min(1, m.o * 1.5) * tw;
      cx.fillStyle = m.g ? 'rgba(150,205,255,'+o+')' : (i % 3 ? 'rgba(255,232,130,'+o+')' : 'rgba(255,255,255,'+o+')');
      sparkle(m.x, m.y, m.r);
    } else {
      cx.beginPath(); cx.arc(m.x, m.y, m.r, 0, 6.284);
      cx.fillStyle = m.g ? 'rgba(90,182,245,'+m.o+')' : 'rgba(240,206,94,'+m.o+')';
      cx.fill();
    }
  }
  requestAnimationFrame(paintMotes);
}
if (cv && !reduce){ sizeMotes(); addEventListener('resize', sizeMotes); paintMotes(); }

/* ---------------- side vine rails ---------------- */
var NODES = 9;
[['railL'],['railR']].forEach(function(pair){
  var rail = document.getElementById(pair[0]);
  if (!rail) return;
  for (var i=0;i<NODES;i++){
    var n = document.createElement('div');
    n.className = 'node';
    n.style.top = (6 + (88/(NODES-1))*i) + '%';
    rail.appendChild(n);
  }
});
var allNodes = document.querySelectorAll('.node');
var fills = document.querySelectorAll('.rail .fill');

/* ---------------- nav: solid on scroll, Games menu closes on outside click ---------------- */
var nav = document.querySelector('.nav');
document.addEventListener('click', function(e){
  document.querySelectorAll('.menu[open]').forEach(function(m){ if (!m.contains(e.target)) m.removeAttribute('open'); });
});
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') document.querySelectorAll('.menu[open]').forEach(function(m){ m.removeAttribute('open'); });
});

/* ---------------- scroll ---------------- */
var pbar = document.getElementById('bar'), art = document.getElementById('art'), tick = false;
function onScroll(){
  if (tick) return; tick = true;
  requestAnimationFrame(function(){
    var max = document.body.scrollHeight - innerHeight;
    var p = max > 0 ? scrollY / max : 0;
    if (pbar) pbar.style.width = (p*100) + '%';
    if (nav) nav.classList.toggle('solid', scrollY > 40);
    for (var i=0;i<fills.length;i++) fills[i].style.height = (6 + p*88) + '%';
    var reached = Math.round(p * (NODES - 1));
    for (var j=0;j<allNodes.length;j++){
      var idx = j % NODES;
      allNodes[j].classList.toggle('lit', idx <= reached);
    }
    if (art && !reduce) art.style.transform = 'scale(1.08) translate3d(0,' + Math.min(scrollY,1100)*0.3 + 'px,0)';
    tick = false;
  });
}
addEventListener('scroll', onScroll, {passive:true}); onScroll();

var logo = document.getElementById('logo');
if (logo && !reduce && fine){
  addEventListener('mousemove', function(e){
    logo.style.translate = ((e.clientX/innerWidth-.5)*16)+'px ' + ((e.clientY/innerHeight-.5)*10)+'px';
  }, {passive:true});
}

var io = new IntersectionObserver(function(es){
  es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); } });
}, {threshold:.14, rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.rise').forEach(function(el){ io.observe(el); });

var cio = new IntersectionObserver(function(es){
  es.forEach(function(e){
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    var el = e.target, to = +el.dataset.to, sfx = el.dataset.suffix || '', t0 = performance.now();
    (function run(now){
      var p = Math.min((now-t0)/1500,1), k = 1-Math.pow(1-p,3);
      el.textContent = Math.round(to*k) + (p===1 ? sfx : '');
      if (p<1) requestAnimationFrame(run);
    })(performance.now());
  });
}, {threshold:.5});
document.querySelectorAll('.stat .n[data-to]').forEach(function(el){ cio.observe(el); });

if (!reduce && fine){
  document.querySelectorAll('.tilt').forEach(function(card){
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var ax = (e.clientX-r.left)/r.width-.5, ay = (e.clientY-r.top)/r.height-.5;
      card.style.transform = 'perspective(1000px) rotateY('+(ax*5).toFixed(2)+'deg) rotateX('+(-ay*5).toFixed(2)+'deg) translateZ(6px)';
    });
    card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
  });
}

/* ---------------- lightbox: <a data-lightbox="group" href="full.png"><img></a> ---------------- */
(function(){
  var links = [].slice.call(document.querySelectorAll('a[data-lightbox]'));
  if (!links.length) return;
  var box = document.createElement('div');
  box.className = 'lb'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true');
  box.innerHTML = '<button class="lb-x" type="button" aria-label="Close">×</button>' +
    '<button class="lb-p" type="button" aria-label="Previous">‹</button>' +
    '<img alt="">' +
    '<button class="lb-n" type="button" aria-label="Next">›</button>' +
    '<div class="lb-bar"><span class="lb-c"></span><a class="lb-d" download>Download full size</a></div>';
  document.body.appendChild(box);
  var img = box.querySelector('img'), cnt = box.querySelector('.lb-c'), dl = box.querySelector('.lb-d'), at = 0;
  function show(k){
    at = (k + links.length) % links.length;
    var a = links[at];
    img.src = a.href; img.alt = (a.querySelector('img') || {}).alt || '';
    dl.href = a.href; cnt.textContent = (at + 1) + ' / ' + links.length;
  }
  function open(k){ show(k); box.classList.add('on'); document.documentElement.style.overflow = 'hidden'; box.querySelector('.lb-x').focus(); }
  function close(){ box.classList.remove('on'); document.documentElement.style.overflow = ''; links[at].focus(); }
  links.forEach(function(a, k){
    a.addEventListener('click', function(e){ e.preventDefault(); open(k); });
  });
  box.addEventListener('click', function(e){ if (e.target === box || e.target.classList.contains('lb-x')) close(); });
  box.querySelector('.lb-p').addEventListener('click', function(){ show(at - 1); });
  box.querySelector('.lb-n').addEventListener('click', function(){ show(at + 1); });
  addEventListener('keydown', function(e){
    if (!box.classList.contains('on')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(at - 1);
    else if (e.key === 'ArrowRight') show(at + 1);
  });
})();


/* ---------------- looping clips: <video class="loop" muted loop playsinline preload="none" poster>
   play only while on screen, so a page full of clips stays light ---------------- */
(function(){
  var vids = [].slice.call(document.querySelectorAll('video.loop'));
  if (!vids.length || reduce || !('IntersectionObserver' in window)) return;
  var vio = new IntersectionObserver(function(es){
    es.forEach(function(e){
      var v = e.target;
      if (e.isIntersecting){ var p = v.play(); if (p && p.catch) p.catch(function(){}); }
      else v.pause();
    });
  }, {rootMargin:'200px 0px'});
  vids.forEach(function(v){ v.muted = true; vio.observe(v); });
})();

})();
