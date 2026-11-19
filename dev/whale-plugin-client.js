/* ============================================================
   小鲸鱼桌宠 · DSH 动态插件（Client 半）· 可爱版 v2
   ------------------------------------------------------------
   修复：拖动改为「绝对定位 + 抓取点偏移」，不再依赖 movementX 增量
   可爱化：背鳍 · 心形尾鳍 · 双高光眼睛 · 腮红 · 腹部阴影 · 歪头 · 眼泪花
   约束：客户端沙箱无 DOM 全局，尺寸靠 ref 测量，动画用 ctx.interval
   ============================================================ */
return {
  inject: ['timer'],

  apply(ctx) {
    var slots = ctx.get('slots')
    if (slots === undefined) return

    ctx.effect(function () {
      return styles.insert([
        '.dshw-layer{position:fixed;inset:0;pointer-events:none;overflow:hidden;}',
        '.dshw{position:absolute;left:0;top:0;width:116px;height:96px;',
        'pointer-events:auto;cursor:grab;touch-action:none;user-select:none;',
        'will-change:transform;}',
        '.dshw.grab{cursor:grabbing;}',

        /* 身体 */
        '.dshw .body{position:absolute;left:8px;top:14px;width:92px;height:68px;',
        'background:linear-gradient(168deg,#a8dcfb 0%,#79c3f2 38%,#4e9fe0 100%);',
        'border-radius:52% 52% 44% 44%/58% 58% 42% 42%;',
        'box-shadow:inset -7px -9px 16px rgba(38,110,170,.26),',
        'inset 6px 8px 14px rgba(255,255,255,.62),',
        '0 9px 20px rgba(70,150,215,.26);}',
        /* 肚子 */
        '.dshw .belly{position:absolute;left:22px;top:42px;width:66px;height:34px;',
        'background:linear-gradient(180deg,#f4fbff 0%,#d5ecfc 100%);',
        'border-radius:52% 52% 46% 46%/62% 62% 38% 38%;opacity:.95;}',
        /* 背鳍 */
        '.dshw .dorsal{position:absolute;left:44px;top:6px;width:22px;height:20px;',
        'background:linear-gradient(160deg,#8fd0f7,#5aa9e6);',
        'border-radius:60% 60% 20% 20%/70% 70% 30% 30%;',
        'transform:rotate(-4deg);}',

        /* 尾鳍（心形） */
        '.dshw .tail{position:absolute;left:88px;top:26px;width:30px;height:34px;',
        'transform-origin:0% 50%;animation:dshwTail 1.45s ease-in-out infinite;}',
        '@keyframes dshwTail{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(12deg)}}',
        '.dshw .tail span{position:absolute;left:0;width:23px;height:19px;',
        'background:linear-gradient(125deg,#8fd0f7,#4e9fe0);',
        'border-radius:58% 58% 50% 50%/64% 64% 36% 36%;}',
        '.dshw .tail .t1{top:0;transform:rotate(-30deg);}',
        '.dshw .tail .t2{top:16px;transform:rotate(30deg);}',
        /* 尾鳍内侧浅色（心形感） */
        '.dshw .tail span::after{content:"";position:absolute;left:4px;top:4px;',
        'width:11px;height:9px;background:rgba(255,255,255,.4);border-radius:50%;}',

        /* 侧鳍 */
        '.dshw .fin{position:absolute;left:48px;top:58px;width:25px;height:15px;',
        'background:linear-gradient(140deg,#6fbcef,#3f8fd0);',
        'border-radius:54% 54% 62% 38%/62% 62% 38% 38%;',
        'transform-origin:18% 20%;animation:dshwFin 2.5s ease-in-out infinite;}',
        '@keyframes dshwFin{0%,100%{transform:rotate(7deg)}50%{transform:rotate(-13deg)}}',

        /* 眼睛：双高光 */
        '.dshw .eye{position:absolute;left:30px;top:34px;width:14px;height:14px;',
        'background:radial-gradient(circle at 34% 32%,#3d5f7d,#16293c 68%);',
        'border-radius:50%;transition:transform .1s;}',
        '.dshw .eye::after{content:"";position:absolute;left:2.5px;top:2.5px;',
        'width:5px;height:5px;background:#fff;border-radius:50%;}',
        '.dshw .eye::before{content:"";position:absolute;left:8px;top:8px;',
        'width:2.5px;height:2.5px;background:rgba(255,255,255,.85);border-radius:50%;}',

        /* 腮红 */
        '.dshw .blush{position:absolute;left:19px;top:50px;width:17px;height:10px;',
        'background:radial-gradient(circle,rgba(255,140,175,.75),rgba(255,160,190,0) 72%);',
        'border-radius:50%;transition:opacity .3s;}',

        /* 喷水 */
        '.dshw .spout{position:absolute;left:36px;top:-6px;width:20px;height:22px;',
        'opacity:0;animation:dshwSpout 6.2s ease-in-out infinite;}',
        '@keyframes dshwSpout{0%,76%,100%{opacity:0;transform:translateY(6px) scale(.45)}',
        '82%{opacity:1;transform:translateY(-2px) scale(1)}',
        '90%{opacity:.5;transform:translateY(-9px) scale(1.3)}}',
        '.dshw .spout span{position:absolute;border-radius:50%;',
        'background:radial-gradient(circle at 35% 30%,#fff,#bfe6ff);}',
        '.dshw .spout .d1{left:7px;top:12px;width:7px;height:7px;}',
        '.dshw .spout .d2{left:1px;top:5px;width:6px;height:6px;}',
        '.dshw .spout .d3{left:13px;top:3px;width:5px;height:5px;}',
        '.dshw .spout .d4{left:7px;top:-2px;width:4px;height:4px;}',

        /* 地面阴影 */
        '.dshw-shadow{position:absolute;left:0;top:0;width:74px;height:14px;',
        'border-radius:50%;pointer-events:none;will-change:transform,opacity;',
        'background:radial-gradient(ellipse at center,rgba(40,110,175,.3),rgba(40,110,175,0) 72%);}',

        /* 气泡 */
        '.dshw-say{position:absolute;max-width:220px;padding:9px 14px;',
        'background:#fff;color:#2a5878;border-radius:16px 16px 16px 5px;',
        'white-space:nowrap;pointer-events:none;',
        'font:13px/1.5 "Microsoft YaHei",system-ui,sans-serif;',
        'box-shadow:0 7px 20px rgba(70,150,215,.2);',
        'opacity:0;transform-origin:10% 100%;transition:opacity .24s;}',
        '.dshw-say.show{opacity:1;}',
        '.dshw-say::after{content:"";position:absolute;left:18px;bottom:-6px;',
        'width:12px;height:12px;background:#fff;border-radius:0 0 3px 0;',
        'transform:rotate(45deg);}',

        /* 粒子 */
        '.dshw-p{position:absolute;pointer-events:none;font-size:17px;line-height:1;',
        'user-select:none;}',

        /* 睡觉的 Z */
        '.dshw-z{position:absolute;pointer-events:none;font:700 15px/1 "Microsoft YaHei";',
        'color:#4e9fe0;opacity:0;}'
      ].join(''))
    })

    var LINES = {
      poke: ['哎呀！别戳我～', '咕噜咕噜～', '痒痒的！', '干嘛戳我呀？',
             '我可不咬人哦', '我在呢，一直在', '要不要喝口水？',
             '休息一下，看看远处～', '你忙你的，我陪着你'],
      pat: ['嘿嘿…好舒服', '再摸摸嘛～', '喜欢你！', '（开心地甩了甩尾巴）',
            '这样摸头我会骄傲的', '今天也要加油哦！'],
      hug: ['哇——飞起来了！', '抱紧一点！', '转圈圈～', '我最喜欢这样了'],
      idle: ['咕噜…', '（吐了个泡泡）', '你写了多少行代码啦？', '我在这儿陪着你',
             '有点想睡觉了…', '要不要休息五分钟？', '加油，我盯着你呢'],
      wake: ['呼啊——睡醒了！', '我睡着了吗？', '唔…谁叫我'],
      sleep: ['晚安…zzZ', '我眯一会儿…', '困了，先睡啦'],
      lateNight: ['这么晚还不睡呀？', '熬夜对身体不好哦', '夜深了，早点休息吧'],
      morning: ['早上好！今天也要元气满满', '新的一天，加油！', '早安～先喝杯水吧']
    }
    function pick(a) { return a[Math.floor(Math.random() * a.length)] }

    var W = 116, H = 96

    function Whale() {
      var posS = React.useState({ x: -999, y: -999 })
      var lookS = React.useState({ x: 0, y: 0 })
      var faceS = React.useState(1)
      var sleepS = React.useState(false)
      var sayS = React.useState({ off: false, text: '' })
      var grabS = React.useState(false)
      var tiltS = React.useState(0)

      var selfRef = React.useRef(null)
      var holderRef = React.useRef(null)
      var s = React.useRef(null)
      if (s.current === null) {
        s.current = {
          x: -999, y: -999, vx: -0.5, facing: 1, lookX: 0, lookY: 0,
          squish: 0, jump: 0, tilt: 0, asleep: false, dragging: false,
          cw: 1200, ch: 800, ox: 0, oy: 0,
          nextTalk: Date.now() + 9000 + Math.random() * 8000,
          nextWander: Date.now() + 15000 + Math.random() * 15000,
          parts: [], pid: 0, sayUntil: 0
        }
      }
      var st = s.current

      React.useEffect(function () {
        var el = holderRef.current
        if (el) {
          st.cw = el.clientWidth || st.cw
          st.ch = el.clientHeight || st.ch
        }
        st.x = Math.max(16, st.cw - W - 70)
        st.y = Math.max(16, st.ch - H - 150)
        posS[1]({ x: st.x, y: st.y })
      }, [])

      React.useEffect(function () {
        return ctx.interval(function () {
          var now = Date.now()

          st.squish *= 0.85; if (st.squish < 0.01) st.squish = 0
          if (st.jump > 0) { st.jump *= 0.82; if (st.jump < 0.4) st.jump = 0 }
          if (!st.dragging) st.tilt *= 0.88
          if (!st.asleep) { st.lookX *= 0.9; st.lookY *= 0.9 }

          if (!st.dragging && !st.asleep) {
            st.x += st.vx
            if (now > st.nextWander) {
              st.nextWander = now + 15000 + Math.random() * 15000
              st.vx = (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.6)
            }
            st.y += Math.sin(now / 900) * 0.44
            var bx = Math.max(8, st.cw - W - 8)
            if (st.x < 8) { st.x = 8; st.vx = Math.abs(st.vx) }
            if (st.x > bx) { st.x = bx; st.vx = -Math.abs(st.vx) }
            var by = Math.max(8, st.ch - H - 8)
            if (st.y < 8) st.y = 8
            if (st.y > by) st.y = by
            st.facing = st.vx >= 0 ? 1 : -1
          }

          if (now > st.nextTalk) {
            st.nextTalk = now + 26000 + Math.random() * 30000
            if (!st.dragging) {
              var hr = new Date().getHours()
              var t = st.asleep ? 'zzZ…'
                : (hr >= 23 || hr < 5) ? pick(LINES.lateNight)
                : (hr >= 6 && hr < 10) ? pick(LINES.morning)
                : pick(LINES.idle)
              st.sayUntil = now + 3000
              sayS[1]({ off: true, text: t })
            }
          }
          if (st.sayUntil && now > st.sayUntil) { st.sayUntil = 0; sayS[1]({ off: false, text: '' }) }

          if (st.parts.length) {
            var keep = []
            for (var i = 0; i < st.parts.length; i++) {
              var p = st.parts[i]
              var k = (now - p.t0) / p.dur
              if (k < 1) {
                var e = 1 - Math.pow(1 - k, 2)
                p.cx = p.x + p.dx * e
                p.cy = p.y + p.dy * e + 40 * k * k
                p.op = 1 - k
                p.sc = 1 - k * 0.45
                keep.push(p)
              }
            }
            st.parts = keep
          }

          posS[1]({ x: st.x, y: st.y })
          lookS[1]({ x: st.lookX, y: st.lookY })
          faceS[1](st.facing)
          sleepS[1](st.asleep)
          grabS[1](st.dragging)
          tiltS[1](st.tilt)
        }, 33)
      }, [])

      function speak(t, ms) { st.sayUntil = Date.now() + (ms || 2600); sayS[1]({ off: true, text: t }) }
      function burst(kind, n) {
        var sets = { splash: ['💧', '·'], heart: ['💗', '💕'], star: ['✨', '⭐'] }
        var list = sets[kind] || sets.splash
        for (var i = 0; i < n; i++) {
          st.parts.push({
            id: ++st.pid, ch: list[Math.floor(Math.random() * list.length)],
            x: st.x + W / 2, y: st.y + H / 2,
            dx: (Math.random() * 2 - 1) * 46, dy: -(26 + Math.random() * 52),
            t0: Date.now(), dur: 620 + Math.random() * 420,
            cx: st.x + W / 2, cy: st.y + H / 2, op: 1, sc: 1
          })
        }
      }
      function poke() {
        if (st.asleep) return wake()
        st.squish = 1; st.jump = 26
        speak(pick(LINES.poke)); burst('splash', 7)
        if (Math.random() < 0.5) { st.facing = -st.facing; st.vx = Math.abs(st.vx) * st.facing }
      }
      function pat() {
        if (st.asleep) return wake()
        st.jump = 34; speak(pick(LINES.pat)); burst('heart', 9)
      }
      function hug() {
        if (st.asleep) return wake()
        st.jump = 44; speak(pick(LINES.hug)); burst('star', 11)
      }
      function sleep() { st.asleep = true; st.vx = 0; speak(pick(LINES.sleep), 2200) }
      function wake() {
        st.asleep = false; st.jump = 20; speak(pick(LINES.wake))
        if (st.vx === 0) st.vx = (Math.random() < 0.5 ? -1 : 1) * 0.4
      }

      var pressT = null, longPressed = false, lastClick = 0, clickT = null

      /* 拖动：绝对定位（clientX - 抓取偏移） */
      function onDown(ev) {
        st.dragging = true; longPressed = false
        var el = selfRef.current
        var r = el ? el.getBoundingClientRect() : { left: st.x, top: st.y }
        st.ox = ev.clientX - r.left
        st.oy = ev.clientY - r.top
        try { ev.currentTarget.setPointerCapture(ev.pointerId) } catch (e) {}
        ev.preventDefault()
        pressT = ctx.timeout(function () { longPressed = true; hug() }, 600)
      }
      function onMove(ev) {
        /* 眼睛跟随光标 */
        var el = selfRef.current
        if (el) {
          var r = el.getBoundingClientRect()
          var mx = ev.clientX - (r.left + r.width / 2)
          var my = ev.clientY - (r.top + r.height / 2)
          st.lookX = Math.max(-3.5, Math.min(3.5, mx / 55 * st.facing))
          st.lookY = Math.max(-3, Math.min(3, my / 65))
        }
        if (!st.dragging) return
        var bx = Math.max(8, st.cw - W - 8)
        var by = Math.max(8, st.ch - H - 8)
        var nx = ev.clientX - st.ox
        var ny = ev.clientY - st.oy
        st.tilt = Math.max(-10, Math.min(10, (nx - st.x) * 1.8))
        st.x = Math.max(8, Math.min(bx, nx))
        st.y = Math.max(8, Math.min(by, ny))
      }
      function onUp(ev) {
        st.dragging = false
        if (pressT) { pressT(); pressT = null }
        try { ev.currentTarget.releasePointerCapture(ev.pointerId) } catch (e) {}
        if (longPressed) return
        var now = Date.now()
        if (now - lastClick < 320) {
          if (clickT) { clickT(); clickT = null }
          lastClick = 0
          return pat()
        }
        lastClick = now
        clickT = ctx.timeout(function () {
          clickT = null
          if (ev.ctrlKey || ev.metaKey) { st.asleep ? wake() : sleep() } else { poke() }
        }, 300)
      }

      var pos = posS[0], look = lookS[0], face = faceS[0]
      var asleep = sleepS[0], say = sayS[0], grabbed = grabS[0], tilt = tiltS[0]

      /* 鲸鱼本体 */
      var whale = React.createElement('div', {
        ref: selfRef,
        className: 'dshw' + (grabbed ? ' grab' : ''),
        style: {
          transform: 'translate(' + pos.x + 'px,' + (pos.y - st.jump) + 'px) rotate(' +
            (tilt * 0.5) + 'deg) scale(' +
            (1 + st.squish * 0.16) + ',' + (1 - st.squish * 0.20) + ')'
        },
        onPointerDown: onDown,
        onPointerMove: onMove,
        onPointerUp: onUp
      },
        React.createElement('div', {
          style: {
            position: 'relative', width: '100%', height: '100%',
            transform: 'scaleX(' + face + ')'
          }
        },
          React.createElement('div', { className: 'spout' },
            React.createElement('span', { className: 'd1' }),
            React.createElement('span', { className: 'd2' }),
            React.createElement('span', { className: 'd3' }),
            React.createElement('span', { className: 'd4' })),
          React.createElement('div', { className: 'dorsal' }),
          React.createElement('div', { className: 'tail' },
            React.createElement('span', { className: 't1' }),
            React.createElement('span', { className: 't2' })),
          React.createElement('div', { className: 'body' }),
          React.createElement('div', { className: 'belly' }),
          React.createElement('div', { className: 'fin' }),
          React.createElement('div', {
            className: 'blush',
            style: { opacity: asleep ? 0.5 : 0.85 }
          }),
          React.createElement('div', {
            className: 'eye',
            style: {
              transform: asleep ? 'scaleY(.12)' : 'translate(' + look.x + 'px,' + look.y + 'px)'
            }
          })
        )
      )

      /* 地面阴影：随高度缩放淡出 */
      var shadow = React.createElement('div', {
        className: 'dshw-shadow',
        style: {
          transform: 'translate(' + (pos.x + 20) + 'px,' + (pos.y + H - 10) + 'px) scale(' +
            Math.max(0.5, 1 - st.jump / 90) + ')',
          opacity: Math.max(0.15, 0.85 - st.jump / 70)
        }
      })

      var bubble = React.createElement('div', {
        className: 'dshw-say' + (say.off ? ' show' : ''),
        style: { transform: 'translate(' + pos.x + 'px,' + (pos.y - st.jump - 38) + 'px)' }
      }, say.text)

      /* 睡觉的 Z */
      var zzz = null
      if (asleep) {
        zzz = React.createElement('div', {
          className: 'dshw-z',
          style: {
            left: (pos.x + 78) + 'px', top: (pos.y + 6) + 'px', opacity: 0.85
          }
        }, 'z Z')
      }

      var parts = st.parts.map(function (p) {
        return React.createElement('div', {
          className: 'dshw-p',
          key: p.id,
          style: {
            left: p.cx + 'px', top: p.cy + 'px', opacity: p.op,
            transform: 'translate(-50%,-50%) scale(' + p.sc + ')'
          }
        }, p.ch)
      })

      return React.createElement('div', { className: 'dshw-layer', ref: holderRef },
        shadow, whale, bubble, zzz, parts)
    }

    slots.inject('shell.overlay', function () {
      return slots.register(
        { name: 'shell.overlay', id: 'whale-pet', order: 100 },
        function () { return React.createElement(Whale) }
      )
    })
  }
};
