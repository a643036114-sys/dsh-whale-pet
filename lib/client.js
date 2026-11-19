window.__ModuleLoader__.load({
	id: "dsh-whale-pet",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");

		//#region lib/client.js
		/**
		 * 小鲸鱼桌宠 —— 浏览器半
		 *
		 * 以 shell.overlay（list / 键为 id / replaceRisk: none）浮层条目形式挂载。
		 * 逐帧动画直接写 DOM，React 只负责首次渲染，避免每帧重渲染造成卡顿。
		 */

		/** 等待 timer 服务：animated 主循环需要 ctx.interval。 */
		const inject = ["timer"];

		const W = 116;
		const H = 96;

		const LINES = {
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
		};

		function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

		const CSS = [
			'.dshw-layer{position:fixed;inset:0;pointer-events:none;overflow:hidden;}',
			'.dshw{position:absolute;left:0;top:0;width:116px;height:96px;',
			'pointer-events:auto;cursor:grab;touch-action:none;user-select:none;}',
			'.dshw.grab{cursor:grabbing;}',
			'.dshw .art{position:relative;width:100%;height:100%;}',
			'.dshw .body{position:absolute;left:8px;top:14px;width:92px;height:68px;',
			'background:linear-gradient(168deg,#a8dcfb 0%,#79c3f2 38%,#4e9fe0 100%);',
			'border-radius:52% 52% 44% 44%/58% 58% 42% 42%;',
			'box-shadow:inset -6px -8px 14px rgba(38,110,170,.24),',
			'inset 5px 7px 12px rgba(255,255,255,.55),0 8px 18px rgba(70,150,215,.24);}',
			'.dshw .belly{position:absolute;left:22px;top:42px;width:66px;height:34px;',
			'background:linear-gradient(180deg,#f4fbff 0%,#d5ecfc 100%);',
			'border-radius:52% 52% 46% 46%/62% 62% 38% 38%;opacity:.95;}',
			'.dshw .dorsal{position:absolute;left:44px;top:6px;width:22px;height:20px;',
			'background:linear-gradient(160deg,#8fd0f7,#5aa9e6);',
			'border-radius:60% 60% 20% 20%/70% 70% 30% 30%;}',
			'.dshw .tail{position:absolute;left:88px;top:26px;width:30px;height:34px;',
			'transform-origin:0% 50%;animation:dshwTail 1.45s ease-in-out infinite;}',
			'@keyframes dshwTail{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(12deg)}}',
			'.dshw .tail span{position:absolute;left:0;width:23px;height:19px;',
			'background:linear-gradient(125deg,#8fd0f7,#4e9fe0);',
			'border-radius:58% 58% 50% 50%/64% 64% 36% 36%;}',
			'.dshw .tail .t1{top:0;transform:rotate(-30deg);}',
			'.dshw .tail .t2{top:16px;transform:rotate(30deg);}',
			'.dshw .fin{position:absolute;left:48px;top:58px;width:25px;height:15px;',
			'background:linear-gradient(140deg,#6fbcef,#3f8fd0);',
			'border-radius:54% 54% 62% 38%/62% 62% 38% 38%;',
			'transform-origin:18% 20%;animation:dshwFin 2.5s ease-in-out infinite;}',
			'@keyframes dshwFin{0%,100%{transform:rotate(7deg)}50%{transform:rotate(-13deg)}}',
			'.dshw .eye{position:absolute;left:30px;top:34px;width:14px;height:14px;',
			'background:radial-gradient(circle at 34% 32%,#3d5f7d,#16293c 68%);',
			'border-radius:50%;}',
			'.dshw .eye::after{content:"";position:absolute;left:2.5px;top:2.5px;',
			'width:5px;height:5px;background:#fff;border-radius:50%;}',
			'.dshw .eye::before{content:"";position:absolute;left:8px;top:8px;',
			'width:2.5px;height:2.5px;background:rgba(255,255,255,.85);border-radius:50%;}',
			'.dshw .blush{position:absolute;left:19px;top:50px;width:17px;height:10px;',
			'background:radial-gradient(circle,rgba(255,140,175,.7),rgba(255,160,190,0) 72%);',
			'border-radius:50%;}',
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
			'.dshw-shadow{position:absolute;left:0;top:0;width:70px;height:13px;',
			'border-radius:50%;pointer-events:none;',
			'background:radial-gradient(ellipse at center,rgba(40,110,175,.28),rgba(40,110,175,0) 72%);}',
			'.dshw-say{position:absolute;left:0;top:0;max-width:220px;padding:9px 14px;',
			'background:#fff;color:#2a5878;border-radius:16px 16px 16px 5px;',
			'white-space:nowrap;pointer-events:none;opacity:0;',
			'font:13px/1.5 "Microsoft YaHei",system-ui,sans-serif;',
			'box-shadow:0 7px 20px rgba(70,150,215,.2);transition:opacity .22s;}',
			'.dshw-say.show{opacity:1;}',
			'.dshw-say::after{content:"";position:absolute;left:18px;bottom:-6px;',
			'width:12px;height:12px;background:#fff;border-radius:0 0 3px 0;',
			'transform:rotate(45deg);}',
			'.dshw-p{position:absolute;left:0;top:0;pointer-events:none;',
			'font-size:17px;line-height:1;}'
		].join('');

		function Whale(props) {
			const timer = props.ctx.timer;
			const holderRef = react.useRef(null);
			const whaleRef = react.useRef(null);
			const artRef = react.useRef(null);
			const eyeRef = react.useRef(null);
			const sayRef = react.useRef(null);
			const shRef = react.useRef(null);
			const partRef = react.useRef([]);
			const lastN = react.useRef(0);

			const partS = react.useState([]);
			const parts = partS[0];

			const s = react.useRef(null);
			if (s.current === null) {
				s.current = {
					x: -999, y: -999, vx: -0.5, facing: 1, lookX: 0, lookY: 0,
					squish: 0, jump: 0, tilt: 0, asleep: false, dragging: false,
					cw: 1200, ch: 800, ox: 0, oy: 0, blinkT: 0, blinking: false,
					nextTalk: Date.now() + 9000 + Math.random() * 8000,
					nextWander: Date.now() + 15000 + Math.random() * 15000,
					nextBlink: Date.now() + 3000 + Math.random() * 4000,
					parts: [], pid: 0, sayUntil: 0
				};
			}
			const st = s.current;

			react.useEffect(function () {
				const el = holderRef.current;
				if (el) {
					st.cw = el.clientWidth || st.cw;
					st.ch = el.clientHeight || st.ch;
				}
				st.x = Math.max(16, st.cw - W - 70);
				st.y = Math.max(16, st.ch - H - 150);
			}, []);

			react.useEffect(function () {
				return timer.interval(function () {
					const now = Date.now();

					st.squish *= 0.85; if (st.squish < 0.01) st.squish = 0;
					if (st.jump > 0) { st.jump *= 0.82; if (st.jump < 0.4) st.jump = 0; }
					if (!st.dragging) st.tilt *= 0.88;
					if (!st.asleep) { st.lookX *= 0.9; st.lookY *= 0.9; }

					if (!st.dragging && !st.asleep) {
						st.x += st.vx;
						if (now > st.nextWander) {
							st.nextWander = now + 15000 + Math.random() * 15000;
							st.vx = (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.6);
						}
						st.y += Math.sin(now / 900) * 0.44;
						const bx = Math.max(8, st.cw - W - 8);
						if (st.x < 8) { st.x = 8; st.vx = Math.abs(st.vx); }
						if (st.x > bx) { st.x = bx; st.vx = -Math.abs(st.vx); }
						const by = Math.max(8, st.ch - H - 8);
						if (st.y < 8) st.y = 8;
						if (st.y > by) st.y = by;
						st.facing = st.vx >= 0 ? 1 : -1;
					}

					if (st.blinking) {
						if (now - st.blinkT > 120) {
							st.blinking = false;
							if (eyeRef.current) eyeRef.current.style.transform = st.asleep ? 'scaleY(.12)' : '';
						}
					} else if (!st.asleep && now > st.nextBlink) {
						st.blinking = true; st.blinkT = now;
						st.nextBlink = now + 3000 + Math.random() * 4500;
						if (eyeRef.current) eyeRef.current.style.transform = 'scaleY(.1)';
					}

					if (now > st.nextTalk) {
						st.nextTalk = now + 26000 + Math.random() * 30000;
						if (!st.dragging) {
							const hr = new Date().getHours();
							const t = st.asleep ? 'zzZ…'
								: (hr >= 23 || hr < 5) ? pick(LINES.lateNight)
								: (hr >= 6 && hr < 10) ? pick(LINES.morning)
								: pick(LINES.idle);
							speak(t, 3000);
						}
					}
					if (st.sayUntil && now > st.sayUntil) {
						st.sayUntil = 0;
						if (sayRef.current) { sayRef.current.className = 'dshw-say'; sayRef.current.textContent = ''; }
					}

					if (st.parts.length) {
						const keep = [];
						for (let i = 0; i < st.parts.length; i++) {
							const p = st.parts[i];
							const k = (now - p.t0) / p.dur;
							if (k >= 1) continue;
							const e = 1 - Math.pow(1 - k, 2);
							p.cx = p.x + p.dx * e;
							p.cy = p.y + p.dy * e + 40 * k * k;
							const el2 = partRef.current[p.id];
							if (el2) {
								el2.style.transform = 'translate(' + (p.cx - 8) + 'px,' + (p.cy - 8) +
									'px) scale(' + (1 - k * 0.45) + ')';
								el2.style.opacity = String(1 - k);
							}
							keep.push(p);
						}
						st.parts = keep;
						if (keep.length !== lastN.current) {
							lastN.current = keep.length;
							partS[1](keep.slice());
						}
					} else if (lastN.current !== 0) {
						lastN.current = 0;
						partS[1]([]);
					}

					const jump = st.jump;
					const wr = whaleRef.current;
					if (wr) {
						wr.style.transform = 'translate(' + st.x + 'px,' + (st.y - jump) + 'px) rotate(' +
							(st.tilt * 0.5) + 'deg) scale(' +
							(1 + st.squish * 0.16) + ',' + (1 - st.squish * 0.2) + ')';
					}
					if (artRef.current) artRef.current.style.transform = 'scaleX(' + st.facing + ')';
					if (eyeRef.current && !st.blinking && !st.asleep) {
						eyeRef.current.style.transform = 'translate(' + st.lookX + 'px,' + st.lookY + 'px)';
					}
					if (sayRef.current && st.sayUntil) {
						sayRef.current.style.transform = 'translate(' + st.x + 'px,' + (st.y - jump - 38) + 'px)';
					}
					if (shRef.current) {
						shRef.current.style.transform = 'translate(' + (st.x + 22) + 'px,' +
							(st.y + H - 10) + 'px) scale(' + Math.max(0.5, 1 - jump / 90) + ')';
						shRef.current.style.opacity = String(Math.max(0.15, 0.85 - jump / 70));
					}
				}, 33);
			}, []);

			function speak(t, ms) {
				st.sayUntil = Date.now() + (ms || 2600);
				const el = sayRef.current;
				if (el) {
					el.textContent = t;
					el.className = 'dshw-say show';
					el.style.transform = 'translate(' + st.x + 'px,' + (st.y - st.jump - 38) + 'px)';
				}
			}
			function burst(kind, n) {
				const sets = { splash: ['💧', '·'], heart: ['💗', '💕'], star: ['✨', '⭐'] };
				const list = sets[kind] || sets.splash;
				for (let i = 0; i < n; i++) {
					st.parts.push({
						id: ++st.pid, ch: list[Math.floor(Math.random() * list.length)],
						x: st.x + W / 2, y: st.y + H / 2,
						dx: (Math.random() * 2 - 1) * 46, dy: -(26 + Math.random() * 52),
						t0: Date.now(), dur: 620 + Math.random() * 420,
						cx: st.x + W / 2, cy: st.y + H / 2
					});
				}
				lastN.current = -1;
				partS[1](st.parts.slice());
			}
			function poke() {
				if (st.asleep) return wake();
				st.squish = 1; st.jump = 26;
				speak(pick(LINES.poke)); burst('splash', 6);
				if (Math.random() < 0.5) { st.facing = -st.facing; st.vx = Math.abs(st.vx) * st.facing; }
			}
			function pat() {
				if (st.asleep) return wake();
				st.jump = 34; speak(pick(LINES.pat)); burst('heart', 8);
			}
			function hug() {
				if (st.asleep) return wake();
				st.jump = 44; speak(pick(LINES.hug)); burst('star', 9);
			}
			function sleep() {
				st.asleep = true; st.vx = 0; speak(pick(LINES.sleep), 2200);
				if (eyeRef.current) eyeRef.current.style.transform = 'scaleY(.12)';
			}
			function wake() {
				st.asleep = false; st.jump = 20; speak(pick(LINES.wake));
				if (eyeRef.current) eyeRef.current.style.transform = '';
				if (st.vx === 0) st.vx = (Math.random() < 0.5 ? -1 : 1) * 0.4;
			}

			let pressT = null, longPressed = false, lastClick = 0, clickT = null;

			function onDown(ev) {
				st.dragging = true; longPressed = false;
				const el = whaleRef.current;
				const r = el ? el.getBoundingClientRect() : { left: st.x, top: st.y };
				st.ox = ev.clientX - r.left;
				st.oy = ev.clientY - r.top;
				if (el) el.className = 'dshw grab';
				try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) {}
				ev.preventDefault();
				pressT = timer.timeout(function () { longPressed = true; hug(); }, 600);
			}
			function onMove(ev) {
				const el = whaleRef.current;
				if (el) {
					const r = el.getBoundingClientRect();
					const mx = ev.clientX - (r.left + r.width / 2);
					const my = ev.clientY - (r.top + r.height / 2);
					st.lookX = Math.max(-3.5, Math.min(3.5, mx / 55 * st.facing));
					st.lookY = Math.max(-3, Math.min(3, my / 65));
				}
				if (!st.dragging) return;
				const bx = Math.max(8, st.cw - W - 8);
				const by = Math.max(8, st.ch - H - 8);
				const nx = ev.clientX - st.ox;
				const ny = ev.clientY - st.oy;
				st.tilt = Math.max(-10, Math.min(10, (nx - st.x) * 1.8));
				st.x = Math.max(8, Math.min(bx, nx));
				st.y = Math.max(8, Math.min(by, ny));
			}
			function onUp(ev) {
				st.dragging = false;
				if (whaleRef.current) whaleRef.current.className = 'dshw';
				if (pressT) { pressT(); pressT = null; }
				try { ev.currentTarget.releasePointerCapture(ev.pointerId); } catch (e) {}
				if (longPressed) return;
				const now = Date.now();
				if (now - lastClick < 320) {
					if (clickT) { clickT(); clickT = null; }
					lastClick = 0;
					return pat();
				}
				lastClick = now;
				clickT = timer.timeout(function () {
					clickT = null;
					if (ev.ctrlKey || ev.metaKey) { st.asleep ? wake() : sleep(); } else { poke(); }
				}, 300);
			}

			const partEls = parts.map(function (p) {
				return react.createElement('div', {
					className: 'dshw-p', key: p.id,
					ref: function (el) { partRef.current[p.id] = el; }
				}, p.ch);
			});

			return react.createElement('div', { className: 'dshw-layer', ref: holderRef },
				react.createElement('div', { className: 'dshw-shadow', ref: shRef }),
				react.createElement('div', {
					className: 'dshw', ref: whaleRef,
					onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp
				},
					react.createElement('div', { className: 'art', ref: artRef },
						react.createElement('div', { className: 'spout' },
							react.createElement('span', { className: 'd1' }),
							react.createElement('span', { className: 'd2' }),
							react.createElement('span', { className: 'd3' }),
							react.createElement('span', { className: 'd4' })),
						react.createElement('div', { className: 'dorsal' }),
						react.createElement('div', { className: 'tail' },
							react.createElement('span', { className: 't1' }),
							react.createElement('span', { className: 't2' })),
						react.createElement('div', { className: 'body' }),
						react.createElement('div', { className: 'belly' }),
						react.createElement('div', { className: 'fin' }),
						react.createElement('div', { className: 'blush' }),
						react.createElement('div', { className: 'eye', ref: eyeRef })
					)
				),
				react.createElement('div', { className: 'dshw-say', ref: sayRef }),
				partEls
			);
		}

		function apply(ctx) {
			const slots = ctx.get("slots");
			if (slots === undefined) return;

			/* 样式：与官方客户端插件一致，用带标记的 <style> 标签并防重复 */
			const tagId = "dsh-whale-pet/client.css";
			if (typeof document !== "undefined" &&
				document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-whale-pet";
				tag.dataset.pluginCss = tagId;
				tag.textContent = CSS;
				document.head.appendChild(tag);
			}

			slots.inject("shell.overlay", function () {
				return slots.register(
					{ name: "shell.overlay", id: "whale-pet", order: 100 },
					function () { return react.createElement(Whale, { ctx: ctx }); }
				);
			});
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
