import type { DsaTestCase } from '@/utils/dsa/dsaCatalog'
import { stripTypeScript } from '@/utils/dsa/stripTypeScript'

export type JsTestResult = {
  label: string
  pass: boolean
  got?: unknown
  expect: unknown
  error?: string
}

export type JsRunReport = {
  ok: boolean
  message: string
  results: JsTestResult[]
  /** 用例真正跑完的耗时（毫秒） */
  execMs: number
}

const WORKER_SOURCE = `
self.onmessage = function (e) {
  var data = e.data || {};
  var code = String(data.code || '');
  var functionName = String(data.functionName || '');
  var tests = Array.isArray(data.tests) ? data.tests : [];
  function same(a, b) {
    if (Object.is(a, b)) return true;
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch (err) {
      return false;
    }
  }
  function runOne(fn, test) {
    var got = fn.apply(null, test.args || []);
    if (typeof got === 'undefined') {
      return { label: test.label, pass: false, expect: test.expect, error: '函数没有 return' };
    }
    return {
      label: test.label,
      pass: same(got, test.expect),
      got: got,
      expect: test.expect,
    };
  }
  try {
    if (!/^[A-Za-z_$][\\w$]*$/.test(functionName)) {
      throw new Error('函数名不合法');
    }
    var factory = new Function(
      code +
        ';\\n' +
        'if (typeof ' +
        functionName +
        " !== 'function') throw new Error('请实现函数 " +
        functionName +
        "');" +
        'return ' +
        functionName +
        ';',
    );
    var fn = factory();
    var t0 = performance.now();
    var results = [];
    for (var i = 0; i < tests.length; i++) {
      try {
        results.push(runOne(fn, tests[i]));
      } catch (err) {
        results.push({
          label: tests[i].label,
          pass: false,
          expect: tests[i].expect,
          error: err && err.message ? String(err.message) : String(err),
        });
      }
    }
    var passed = results.every(function (r) { return r.pass; });
    if (passed && tests.length) {
      var speedTests = [];
      for (var s = 0; s < tests.length; s++) {
        var n = tests[s].args && tests[s].args[0];
        if (typeof n === 'number' && n > 0 && n <= 6 && speedTests.length < 5) {
          speedTests.push(tests[s]);
        }
      }
      if (!speedTests.length) speedTests = tests.slice(0, 5);
      var rounds = 4000;
      for (var r = 0; r < rounds; r++) {
        for (var j = 0; j < speedTests.length; j++) {
          fn.apply(null, speedTests[j].args || []);
        }
      }
    }
    var execMs = performance.now() - t0;
    self.postMessage({
      ok: passed,
      results: results,
      execMs: execMs,
    });
  } catch (err) {
    self.postMessage({
      ok: false,
      error: err && err.message ? String(err.message) : String(err),
      results: [],
    });
  }
};
`

function formatValue(v: unknown) {
  if (typeof v === 'undefined') return 'undefined'
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

export async function runJsFunctionTests(input: {
  code: string
  functionName: string
  tests: DsaTestCase[]
  timeoutMs?: number
}): Promise<JsRunReport> {
  const timeoutMs = input.timeoutMs ?? 2500
  const code = stripTypeScript(input.code).trim()
  if (!code) {
    return { ok: false, message: '请先写出代码', results: [], execMs: 0 }
  }

  const payload = {
    code,
    functionName: input.functionName,
    tests: input.tests,
  }

  return new Promise((resolve) => {
    let settled = false
    const finish = (report: JsRunReport) => {
      if (settled) return
      settled = true
      resolve(report)
    }

    try {
      const blob = new Blob([WORKER_SOURCE], { type: 'text/javascript' })
      const url = URL.createObjectURL(blob)
      const worker = new Worker(url)
      const timer = window.setTimeout(() => {
        worker.terminate()
        URL.revokeObjectURL(url)
        finish({ ok: false, message: '运行超时（可能有死循环）', results: [], execMs: 0 })
      }, timeoutMs)
      worker.onmessage = (ev: MessageEvent) => {
        window.clearTimeout(timer)
        worker.terminate()
        URL.revokeObjectURL(url)
        const data = ev.data || {}
        if (data.error && !data.results?.length) {
          finish({ ok: false, message: String(data.error), results: [], execMs: 0 })
          return
        }
        const results = (data.results || []) as JsTestResult[]
        const failed = results.filter((r) => !r.pass)
        const ok = Boolean(data.ok) && failed.length === 0
        finish({
          ok,
          message: ok
            ? '全部用例通过'
            : failed[0]?.error
              ? `${failed[0].label}：${failed[0].error}`
              : `${failed[0]?.label ?? '用例'} 期望 ${formatValue(failed[0]?.expect)}，实际 ${formatValue(failed[0]?.got)}`,
          results,
          execMs: Number(data.execMs) || 0,
        })
      }
      worker.onerror = (err) => {
        window.clearTimeout(timer)
        worker.terminate()
        URL.revokeObjectURL(url)
        finish({ ok: false, message: err.message || '代码无法运行', results: [], execMs: 0 })
      }
      worker.postMessage(payload)
    } catch {
      finish(runJsFunctionTestsSync(payload))
    }
  })
}

function runJsFunctionTestsSync(input: {
  code: string
  functionName: string
  tests: DsaTestCase[]
}): JsRunReport {
  try {
    const code = stripTypeScript(input.code)
    const factory = new Function(
      `${code}\n; if (typeof ${input.functionName} !== 'function') throw new Error('请实现函数 ${input.functionName}'); return ${input.functionName};`,
    )
    const fn = factory() as (...args: unknown[]) => unknown
    const t0 = performance.now()
    const results: JsTestResult[] = input.tests.map((test) => {
      try {
        const got = fn(...test.args)
        const pass = JSON.stringify(got) === JSON.stringify(test.expect)
        return { label: test.label, pass, got, expect: test.expect }
      } catch (e) {
        return {
          label: test.label,
          pass: false,
          expect: test.expect,
          error: e instanceof Error ? e.message : String(e),
        }
      }
    })
    const failed = results.filter((r) => !r.pass)
    if (failed.length === 0) {
      const speedTests = input.tests
        .filter((test) => typeof test.args[0] === 'number' && Number(test.args[0]) > 0 && Number(test.args[0]) <= 6)
        .slice(0, 5)
      const bench = speedTests.length ? speedTests : input.tests.slice(0, 5)
      for (let r = 0; r < 4000; r += 1) {
        for (const test of bench) fn(...test.args)
      }
    }
    return {
      ok: failed.length === 0,
      message: failed.length === 0 ? '全部用例通过' : `${failed[0]!.label} 未通过`,
      results,
      execMs: performance.now() - t0,
    }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '代码无法运行', results: [], execMs: 0 }
  }
}
