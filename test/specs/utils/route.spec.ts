import { test } from 'uvu'
import * as assert from 'uvu/assert'
import {
  withPrefix,
  withoutPrefix,
  withSuffix,
  withoutSuffix,
  createUrl,
  getFullPath,
} from '../../../src/utils/route'

test('withPrefix', () => {
  assert.is(withPrefix('/my/path', '/'), '/my/path')
  assert.is(withPrefix('my/path', '/'), '/my/path')
  assert.is(withPrefix('/my/path', '/my'), '/my/path')
  assert.is(withPrefix('/path', '/my'), '/my/path')
})

test('withoutPrefix', () => {
  assert.is(withoutPrefix('/my/path', '/'), 'my/path')
  assert.is(withoutPrefix('my/path', '/'), 'my/path')
  assert.is(withoutPrefix('/my/path', '/my'), '/path')
  assert.is(withoutPrefix('/path', '/my'), '/path')
})

test('withSuffix', () => {
  assert.is(withSuffix('/my/path', '/'), '/my/path/')
  assert.is(withSuffix('/my/path/', '/'), '/my/path/')
  assert.is(withSuffix('/my', '/path'), '/my/path')
  assert.is(withSuffix('/my/path', '/path'), '/my/path')
})

test('withoutSuffix', () => {
  assert.is(withoutSuffix('/my/path', '/'), '/my/path')
  assert.is(withoutSuffix('/my/path/', '/'), '/my/path')
  assert.is(withoutSuffix('/my/path', '/path'), '/my')
  assert.is(withoutSuffix('/my', '/path'), '/my')
})

test('createUrl', () => {
  assert.is(
    createUrl(new URL('http://e.g/my/path')).toString(),
    'http://e.g/my/path'
  )

  assert.is(createUrl('http://e.g/my/path').toString(), 'http://e.g/my/path')
  assert.is(createUrl('/my/path').toString(), 'http://e.g/my/path')
  assert.is(createUrl('/my/path?query').toString(), 'http://e.g/my/path?query')
})

test('getFullPath', () => {
  assert.is(getFullPath(new URL('http://e.g/my/path')), '/my/path/')
  assert.is(getFullPath('/my/path'), '/my/path/')
  assert.is(getFullPath('/my/path?query'), '/my/path/?query')

  assert.is(getFullPath('/my/path', '/my'), '/path/')
  assert.is(getFullPath('/my/path/', '/my'), '/path/')
  assert.is(getFullPath('/my/path?query', '/my'), '/path/?query')

  assert.is(getFullPath('/my/', '/my'), '/')
  assert.is(getFullPath('/my', '/my'), '/')
  assert.is(getFullPath('/my/?query', '/my'), '/?query')
  assert.is(getFullPath('/my?query', '/my'), '/?query')

  assert.is(getFullPath('/my/deep/path', '/my/deep'), '/path/')
  assert.is(getFullPath('/my/deepest/path', '/my/deep'), '/my/deepest/path/')
})

test.run()
