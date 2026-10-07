const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/media-url.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const context = { exports: {}, require: () => ({ baseUrl: 'http://192.168.1.10:3000' }) };
vm.runInNewContext(compiled, context);
const { resolveMediaUrl } = context.exports;

test('media URL preserves external images and resolves backend uploads', () => {
  for (const value of [null, undefined, '', ' ', 'file:///a.jpg', 'content://a.jpg', 'C:\\fakepath\\a.jpg', '/other/a.jpg', '/uploads/../a.jpg'])
    assert.equal(resolveMediaUrl(value), null);
  for (const value of ['http://example.com/a.jpg', 'https://example.com/a.png'])
    assert.equal(resolveMediaUrl(value), value);
  for (const folder of ['members', 'pt', 'products'])
    assert.equal(resolveMediaUrl(`/uploads/${folder}/a.webp`), `http://192.168.1.10:3000/uploads/${folder}/a.webp`);
});

test('image falls back after a load error and uses a newly updated image', () => {
  let failedUri = null;
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/components/backend-image.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const component = {
    exports: {},
    require(name) {
      if (name === 'react') return {
        useState: () => [failedUri, value => { failedUri = value; }],
        createElement: (_type, props) => props,
      };
      if (name === 'react/jsx-runtime') return { jsx: (_type, props) => props };
      if (name === 'expo-image') return { Image: 'Image' };
      if (name === '@/lib/media-url') return { resolveMediaUrl };
      throw new Error(name);
    },
  };
  vm.runInNewContext(code, component);
  const render = component.exports.default;
  const props = { value: '/uploads/members/old.png', fallback: 42 };
  const image = render(props);
  assert.equal(image.source.uri, 'http://192.168.1.10:3000/uploads/members/old.png');
  image.onError();
  assert.equal(render(props).source, 42);
  assert.equal(render({ ...props, value: null }).source, 42);
  assert.equal(render({ ...props, value: '/uploads/members/new.png' }).source.uri, 'http://192.168.1.10:3000/uploads/members/new.png');
});
