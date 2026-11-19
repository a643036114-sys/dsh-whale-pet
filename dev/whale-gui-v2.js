/* ============================================================
   小鲸鱼 · DSH GUI 浮层（增强互动版）
   ------------------------------------------------------------
   用法：在 DSH 页面 F12 → Console → 手敲：
     fetch('http://127.0.0.1:8799/whale.js').then(r=>r.text()).then(eval)
   （控制台禁止粘贴，手敲这一行；或先敲 allow pasting 解锁粘贴）

   互动说明：
     · 单击        拍一下  → 身体被压扁弹起 + 随机台词 + 水花
     · 连点两下    摸摸头  → 冒爱心 + 专属台词
     · 长按 0.6 秒 抱起来  → 它会开心地转一下
     · 鼠标靠近    它会转头看你（眼睛跟着鼠标）
     · 拖动        拎走    → 松手掉落
     · Ctrl+单击   哄睡觉  → 进入睡眠，再点一下叫醒
     · 静置一会儿  会自己冒小情绪、偶尔游过来靠近鼠标

   卸载：控制台执行 __whaleOff()
   ============================================================ */
(function () {
  'use strict';

  if (window.__whaleOff) { window.__whaleOff(); }

  /* ---------- 基本参数 ---------- */
  var W = 120, H = 94;
  var x = window.innerWidth - W - 60;
  var y = window.innerHeight - H - 140;
  var vx = -0.5, vy = 0;
  var dragging = false, offX = 0, offY = 0;
  var raf = 0, alive = true;

  /* 情绪状态 */
  var state = {
    asleep: false,
    mood: 0,            // 0 平静 · 1 开心 · 2 兴奋
    moodUntil: 0,
    squish: 0,          // 压扁量 0~1
    jump: 0,            // 弹起高度 px
    facing: 1,          // 1 右 · -1 左
    lookX: 0, lookY: 0, // 眼睛偏移
    lastMouse: { x: -9999, y: -9999 },
    lastPoke: 0,
    pokeCount: 0,
    nextIdleTalk: 5000 + Math.random() * 8000,
    nextWander: 12000 + Math.random() * 15000,
    sleepZ: 0
  };

  /* ---------- 台词库 ---------- */
  var LINES = {
    poke: [
      '哎呀！别戳我～',
      '咕噜咕噜～',
      '痒痒的！',
      '你忙你的，我在这儿呢',
      '干嘛戳我呀？',
      '我可不咬人哦',
      '哼，被你发现了',
      '这个 bug 一定会解决的！',
      '要不要喝口水？',
      '休息一下，看看远处～'
    ],
    pat: [
      '嘿嘿…好舒服',
      '再摸摸嘛～',
      '喜欢你！',
      '（开心地甩了甩尾巴）',
      '这样摸头我会骄傲的',
      '今天也要加油哦！'
    ],
    hug: [
      '哇——飞起来了！',
      '抱紧一点！',
      '转圈圈～',
      '我最喜欢这样了'
    ],
    idle: [
      '咕噜…',
      '（吐了个泡泡）',
      '你写了多少行代码啦？',
      '我在这儿陪着你',
      '有点想睡觉了…',
      '嗯…在想晚饭吃什么',
      '要不要休息五分钟？',
      '加油，我盯着你呢'
    ],
    wake: [
      '呼啊——睡醒了！',
      '我睡着了吗？',
      '唔…谁叫我',
      '做了个海底的梦'
    ],
    sleep: [
      '晚安…zzZ',
      '我眯一会儿…',
      '困了，先睡啦'
    ],
    lateNight: [
      '这么晚还不睡呀？',
      '熬夜对身体不好哦',
      '夜深了，早点休息吧',
      '我陪你到天亮也行'
    ],
    morning: [
      '早上好！今天也要元气满满',
      '新的一天，加油！',
      '早安～先喝杯水吧'
    ]
  };

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* 按时段挑台词 */
  function smartLine() {
    var h = new Date().getHours();
    if (h >= 23 || h < 5) return pick(LINES.lateNight);
    if (h >= 6 && h < 10) return pick(LINES.morning);
    return pick(LINES.idle);
  }

  /* ---------- 挂载：Shadow DOM ---------- */
  var host = document.createElement('div');
  host.id = '__dsh_whale_host';
  host.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;z-index:2147483000;';
  var root = host.attachShadow({ mode: 'open' });

  var layer = document.createElement('div');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;';
  root.appendChild(layer);

  var style = document.createElement('style');
  style.textContent = [
    '.bubble{position:absolute;border-radius:50%;pointer-events:none;',
    '  background:radial-gradient(circle at 32% 30%,rgba(255,255,255,.9),rgba(160,215,255,.26));',
    '  animation:rise linear infinite;}',
    '@keyframes rise{0%{transform:translateY(0) scale(.7);opacity:0}',
    '  12%{opacity:.8}100%{transform:translateY(-105vh) scale(1.1);opacity:0}}',

    '.whale{position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;',
    '  pointer-events:auto;cursor:grab;will-change:transform;}',
    '.whale.dragging{cursor:grabbing;}',
    '.art{position:relative;width:100%;height:100%;transform-origin:50% 78%;',
    '  transition:transform .18s cubic-bezier(.34,1.56,.64,1);}',

    '.body{position:absolute;left:6px;top:13px;width:95px;height:66px;',
    '  background:linear-gradient(165deg,#8fd0f7 0%,#6bb9ee 40%,#4a9ede 100%);',
    '  border-radius:56% 56% 46% 46%/62% 62% 38% 38%;',
    '  box-shadow:inset -7px -8px 15px rgba(38,110,170,.28),',
    '    inset 5px 7px 13px rgba(255,255,255,.5),0 8px 18px rgba(70,150,215,.28);}',
    '.belly{position:absolute;left:19px;top:40px;width:69px;height:34px;',
    '  background:linear-gradient(180deg,#eaf7ff,#cfe9fb);',
    '  border-radius:50% 50% 46% 46%/60% 60% 40% 40%;opacity:.92;}',
    '.tail{position:absolute;left:80px;top:27px;width:36px;height:32px;',
    '  transform-origin:0% 50%;animation:tailWave 1.5s ease-in-out infinite;}',
    '@keyframes tailWave{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(11deg)}}',
    '.tail span{position:absolute;width:24px;height:18px;',
    '  background:linear-gradient(120deg,#6bb9ee,#4a9ede);',
    '  border-radius:50% 50% 50% 50%/60% 60% 40% 40%;}',
    '.tail .t1{left:0;top:0;transform:rotate(-26deg);}',
    '.tail .t2{left:0;top:14px;transform:rotate(26deg);}',
    '.fin{position:absolute;left:42px;top:56px;width:27px;height:16px;',
    '  background:linear-gradient(140deg,#58aae4,#3d8fd0);',
    '  border-radius:50% 50% 60% 40%/60% 60% 40% 40%;',
    '  transform-origin:20% 20%;animation:finWave 2.3s ease-in-out infinite;}',
    '@keyframes finWave{0%,100%{transform:rotate(6deg)}50%{transform:rotate(-12deg)}}',
    '.eye{position:absolute;left:27px;top:32px;width:12px;height:12px;',
    '  background:#17324a;border-radius:50%;',
    '  box-shadow:inset 2px 2px 0 rgba(255,255,255,.35);',
    '  transition:transform .12s;}',
    '.eye::after{content:"";position:absolute;left:2px;top:2px;width:4px;height:4px;',
    '  background:#fff;border-radius:50%;}',
    '.blush{position:absolute;left:17px;top:48px;width:16px;height:9px;',
    '  background:rgba(255,150,175,.5);border-radius:50%;filter:blur(2.5px);',
    '  transition:opacity .3s;}',
    '.spout{position:absolute;left:35px;top:-5px;width:18px;height:21px;opacity:0;',
    '  animation:spoutOut 6.5s ease-in-out infinite;}',
    '@keyframes spoutOut{0%,78%,100%{opacity:0;transform:translateY(5px) scale(.5)}',
    '  84%{opacity:.95;transform:translateY(-2px) scale(1)}',
    '  91%{opacity:.5;transform:translateY(-8px) scale(1.25)}}',
    '.spout span{position:absolute;background:radial-gradient(circle at 35% 30%,#fff,#bfe6ff);',
    '  border-radius:50%;}',
    '.spout .d1{left:6px;top:11px;width:7px;height:7px;}',
    '.spout .d2{left:0;top:4px;width:6px;height:6px;}',
    '.spout .d3{left:12px;top:2px;width:5px;height:5px;}',
    '.spout .d4{left:6px;top:-2px;width:4px;height:4px;}',

    /* 睡眠时闭眼 */
    '.whale.asleep .eye{transform:scaleY(.12) translateY(1px);}',

    '.say{position:absolute;max-width:210px;padding:8px 12px;background:#fff;',
    '  color:#24506e;font:13px/1.5 "Microsoft YaHei",system-ui,sans-serif;',
    '  border-radius:13px;box-shadow:0 6px 18px rgba(70,150,215,.22);',
    '  opacity:0;transform-origin:20% 100%;',
    '  transition:opacity .26s,transform .26s cubic-bezier(.34,1.56,.64,1);',
    '  pointer-events:none;white-space:nowrap;}',
    '.say.show{opacity:1;}',
    '.say::after{content:"";position:absolute;left:22px;bottom:-7px;width:0;height:0;',
    '  border-left:7px solid transparent;border-right:7px solid transparent;',
    '  border-top:8px solid #fff;}',

    /* 粒子 */
    '.p{position:absolute;pointer-events:none;font-size:16px;line-height:1;',
    '  will-change:transform,opacity;user-select:none;}'
  ].join('\n');
  root.appendChild(style);

  /* 背景水泡 */
  for (var i = 0; i < 7; i++) {
    var b = document.createElement('div');
    b.className = 'bubble';
    var s = 5 + Math.random() * 13;
    b.style.width = s + 'px';
    b.style.height = s + 'px';
    b.style.left = (Math.random() * 100) + '%';
    b.style.bottom = '-28px';
    b.style.animationDuration = (10 + Math.random() * 9) + 's';
    b.style.animationDelay = (-Math.random() * 12) + 's';
    layer.appendChild(b);
  }

  /* 鲸鱼本体 */
  var whale = document.createElement('div');
  whale.className = 'whale';
  whale.innerHTML =
    '<div class="art">' +
      '<div class="spout"><span class="d1"></span><span class="d2"></span>' +
        '<span class="d3"></span><span class="d4"></span></div>' +
      '<div class="tail"><span class="t1"></span><span class="t2"></span></div>' +
      '<div class="body"></div><div class="belly"></div>' +
      '<div class="fin"></div><div class="blush"></div><div class="eye"></div>' +
    '</div>';
  layer.appendChild(whale);

  var say = document.createElement('div');
  say.className = 'say';
  layer.appendChild(say);

  var artEl = whale.querySelector('.art');
  var eyeEl = whale.querySelector('.eye');
  var blushEl = whale.querySelector('.blush');

  document.body.appendChild(host);

  /* ---------- 工具 ---------- */
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  var sayTimer = null;
  function say_(text, ms) {
    say.textContent = text;
    say.classList.add('show');
    clearTimeout(sayTimer);
    sayTimer = setTimeout(function () { say.classList.remove('show'); }, ms || 2600);
  }

  /* 粒子：水花 / 爱心 / 星星 */
  function particle(kind, cx, cy, n) {
    var chars = { splash: ['💧', '·', '˙'], heart: ['💗', '💕', '❤'], star: ['✨', '⭐', '🌟'] };
    var list = chars[kind] || chars.splash;
    for (var i = 0; i < (n || 6); i++) {
      var p = document.createElement('div');
      p.className = 'p';
      p.textContent = list[Math.floor(Math.random() * list.length)];
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.transform = 'translate(-50%,-50%)';
      layer.appendChild(p);
      (function (el) {
        var dx = (Math.random() * 2 - 1) * 46;
        var dy = -(26 + Math.random() * 52);
        var t0 = performance.now();
        var dur = 620 + Math.random() * 420;
        function step(now) {
          var k = (now - t0) / dur;
          if (k >= 1 || !alive) { if (el.parentNode) el.parentNode.removeChild(el); return; }
          var ease = 1 - Math.pow(1 - k, 2);
          el.style.transform = 'translate(calc(-50% + ' + (dx * ease) + 'px), calc(-50% + ' +
            (dy * ease + 40 * k * k) + 'px)) scale(' + (1 - k * 0.5) + ')';
          el.style.opacity = String(1 - k);
          requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      })(p);
    }
  }

  /* ---------- 位置渲染 ---------- */
  function place() {
    var squashX = 1 + state.squish * 0.16;
    var squashY = 1 - state.squish * 0.20;
    whale.style.transform =
      'translate(' + x + 'px,' + (y - state.jump) + 'px) scale(' + squashX + ',' + squashY + ')';
    artEl.style.transform = 'scaleX(' + state.facing + ')';
    eyeEl.style.transform = state.asleep
      ? 'scaleY(.12)'
      : 'translate(' + state.lookX + 'px,' + state.lookY + 'px)';
    blushEl.style.opacity = state.mood > 0 ? '1' : '0.55';
    say.style.transform = 'translate(' + x + 'px,' + (y - state.jump - 36) + 'px)';
  }

  /* ---------- 反应动作 ---------- */
  function poke() {
    if (state.asleep) { wake(); return; }
    state.squish = 1;
    state.jump = 26;
    state.mood = 1;
    state.moodUntil = Date.now() + 2200;
    say_(pick(LINES.poke));
    particle('splash', x + W / 2, y + H / 2, 7);
    // 被戳后可能换个方向
    if (Math.random() < 0.5) {
      state.facing = -state.facing;
      vx = Math.abs(vx) * state.facing;
    }
  }

  function pat() {
    if (state.asleep) { wake(); return; }
    state.mood = 2;
    state.moodUntil = Date.now() + 3200;
    state.jump = 34;
    say_(pick(LINES.pat));
    particle('heart', x + W / 2, y + H / 2 - 6, 8);
  }

  function hug() {
    if (state.asleep) { wake(); return; }
    state.mood = 2;
    state.moodUntil = Date.now() + 4000;
    state.jump = 44;
    say_(pick(LINES.hug));
    particle('star', x + W / 2, y + H / 2, 10);
    // 原地转一圈
    var t0 = performance.now();
    (function spin(now) {
      var k = (now - t0) / 700;
      if (k >= 1 || !alive) { state.facing = 1; return; }
      if (k < 0.25 || (k >= 0.5 && k < 0.75)) state.facing = 1;
      else state.facing = -1;
      requestAnimationFrame(spin);
    })(t0);
  }

  function sleep() {
    state.asleep = true;
    vx = 0;
    whale.classList.add('asleep');
    say_(pick(LINES.sleep), 2200);
  }

  function wake() {
    state.asleep = false;
    whale.classList.remove('asleep');
    state.jump = 20;
    state.mood = 1;
    state.moodUntil = Date.now() + 2000;
    say_(pick(LINES.wake));
    if (vx === 0) vx = (Math.random() < 0.5 ? -1 : 1) * 0.4;
  }

  /* ---------- 主循环 ---------- */
  var lastBlink = Date.now(), nextBlink = 3000 + Math.random() * 4000;

  function tick() {
    if (!alive) return;
    var now = Date.now();

    /* 情绪回落 */
    if (state.moodUntil && now > state.moodUntil) { state.mood = 0; state.moodUntil = 0; }

    /* 压扁 / 弹起回弹 */
    state.squish *= 0.86;
    if (state.squish < 0.01) state.squish = 0;
    if (state.jump > 0) {
      state.jump *= 0.82;
      if (state.jump < 0.4) state.jump = 0;
    }

    /* 眼睛看鼠标 */
    if (!state.asleep) {
      var dx = state.lastMouse.x - (x + W / 2);
      var dy = state.lastMouse.y - (y + H / 2);
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 320) {
        state.lookX = clamp(dx / 60, -3.5, 3.5) * state.facing;
        state.lookY = clamp(dy / 70, -3, 3);
      } else {
        state.lookX *= 0.9; state.lookY *= 0.9;
      }
    } else {
      state.lookX = 0; state.lookY = 0;
    }

    /* 自主游动 */
    if (!dragging && !state.asleep) {
      x += vx;
      // 靠近鼠标时轻微被吸引
      if (now > state.nextWander && state.lastMouse.x > -9000) {
        state.nextWander = now + 12000 + Math.random() * 15000;
        vx = (state.lastMouse.x > x ? 1 : -1) * (0.35 + Math.random() * 0.6);
      }
      y += Math.sin(now / 900) * 0.22;

      if (x < 8) { x = 8; vx = Math.abs(vx); }
      if (x > window.innerWidth - W - 8) { x = window.innerWidth - W - 8; vx = -Math.abs(vx); }
      y = clamp(y, 8, window.innerHeight - H - 8);
      state.facing = vx >= 0 ? 1 : -1;
    }

    /* 自动说话 */
    if (now > state.nextIdleTalk) {
      state.nextIdleTalk = now + 22000 + Math.random() * 30000;
      if (!dragging) say_(state.asleep ? 'zzZ…' : smartLine(), 3000);
    }

    /* 眨眼 */
    if (!state.asleep && now - lastBlink > nextBlink) {
      lastBlink = now;
      nextBlink = 3000 + Math.random() * 4500;
      eyeEl.style.transform = 'scaleY(.08)';
      setTimeout(function () { if (!state.asleep) eyeEl.style.transform = ''; }, 130);
    }

    place();
    raf = requestAnimationFrame(tick);
  }

  /* ---------- 鼠标 ---------- */
  addEventListener('pointermove', function (ev) {
    state.lastMouse.x = ev.clientX;
    state.lastMouse.y = ev.clientY;
  }, true);

  /* ---------- 交互事件 ---------- */
  var pressTimer = null, longPressed = false, lastClickAt = 0, clickTimer = null;

  whale.addEventListener('pointerdown', function (ev) {
    dragging = true;
    longPressed = false;
    whale.classList.add('dragging');
    offX = ev.clientX - x;
    offY = ev.clientY - y;
    try { whale.setPointerCapture(ev.pointerId); } catch (e) {}
    ev.preventDefault();

    pressTimer = setTimeout(function () {
      longPressed = true;
      hug();
    }, 600);
  });

  whale.addEventListener('pointermove', function (ev) {
    if (!dragging) return;
    // 移动超过阈值就取消“长按抱起”
    if (Math.abs(ev.clientX - offX - x) > 4 || Math.abs(ev.clientY - offY - y) > 4) {
      clearTimeout(pressTimer);
    }
    x = clamp(ev.clientX - offX, 0, window.innerWidth - W);
    y = clamp(ev.clientY - offY, 0, window.innerHeight - H);
  });

  whale.addEventListener('pointerup', function (ev) {
    dragging = false;
    whale.classList.remove('dragging');
    clearTimeout(pressTimer);
    try { whale.releasePointerCapture(ev.pointerId); } catch (e) {}

    if (longPressed) return;                 // 已按“抱起”处理

    var now = Date.now();
    if (now - lastClickAt < 320) {           // 双击 = 摸头
      clearTimeout(clickTimer);
      lastClickAt = 0;
      pat();
      return;
    }
    lastClickAt = now;
    clickTimer = setTimeout(function () {
      if (ev.ctrlKey || ev.metaKey) {
        state.asleep ? wake() : sleep();
      } else {
        poke();
      }
    }, 300);
  });

  /* ---------- 卸载 ---------- */
  window.__whaleOff = function () {
    alive = false;
    cancelAnimationFrame(raf);
    clearTimeout(sayTimer); clearTimeout(pressTimer); clearTimeout(clickTimer);
    if (host.parentNode) host.parentNode.removeChild(host);
    delete window.__whaleOff;
    console.log('[whale] 已卸载');
  };

  place();
  raf = requestAnimationFrame(tick);
  say_('我来啦～点点我试试', 3200);
  console.log('[whale] 互动版已就绪：单击拍一下 / 双击摸头 / 长按抱起 / Ctrl+单击哄睡 / 拖动拎走');
})();
