/* 验证 dsh-whale-pet 的客户端 bundle 是否符合 __ModuleLoader__ 契约 */
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const code = fs.readFileSync(process.argv[2], "utf8");

let loaded = null;
const sandbox = {
  window: {
    __ModuleLoader__: {
      load(spec) { loaded = spec; }
    }
  },
  document: undefined
};
sandbox.globalThis = sandbox;

vm.createContext(sandbox);
try {
  vm.runInContext(code, sandbox, { filename: "client.js" });
  console.log("✅ bundle 在无 window 的真实环境中执行成功");
} catch (e) {
  console.log("❌ 执行失败:", e.message);
  process.exit(1);
}

if (!loaded) { console.log("❌ 没有调用 __ModuleLoader__.load"); process.exit(1); }
console.log("   id       :", loaded.id);
console.log("   factory  :", typeof loaded.factory);

/* 用假的 require 调用 factory，验证导出契约 */
const fakeReact = {
  createElement: (...a) => ({ __el: a[0], props: a[1] }),
  useRef: (v) => ({ current: v }),
  useState: (v) => [v, () => {}],
  useEffect: () => {}
};
const fakeRequire = (name) => {
  if (name === "react") return fakeReact;
  if (name === "react/jsx-runtime") return {};
  throw new Error("意料之外的依赖: " + name);
};

let mod;
try {
  mod = loaded.factory(fakeRequire);
} catch (e) {
  console.log("❌ factory 调用失败:", e.message);
  process.exit(1);
}

console.log("✅ factory 返回:", typeof mod);
console.log("   导出键   :", Object.keys(mod).join(", "));
console.log("   apply    :", typeof mod.apply);
console.log("   inject   :", JSON.stringify(mod.inject));

const ok = typeof mod.apply === "function" &&
           Array.isArray(mod.inject) &&
           mod.inject.indexOf("timer") >= 0;
console.log(ok ? "✅ 契约完全正确（apply 函数 + inject 含 timer）"
               : "❌ 契约不符");
process.exit(ok ? 0 : 1);
