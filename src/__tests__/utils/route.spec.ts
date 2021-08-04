import {
  withPrefix,
  withoutPrefix,
  withSuffix,
  withoutSuffix,
  createUrl,
  joinPaths,
  getFullPath,
} from '../../utils/route'

describe('withPrefix', () => {
  test('should return original string', () => {
    expect(withPrefix('/foo/bar', '/foo')).toEqual('/foo/bar')
  })

  test('should return prefixed string', () => {
    expect(withPrefix('/bar/baz', '/foo')).toEqual('/foo/bar/baz')
  })
})

describe('withoutPrefix', () => {
  test('should return original string', () => {
    expect(withoutPrefix('/foo/bar', '/baz')).toEqual('/foo/bar')
  })

  test('should return string without prefix', () => {
    expect(withoutPrefix('/foo/bar', '/foo')).toEqual('/bar')
  })
})

describe('withSuffix', () => {
  test('should return original string', () => {
    expect(withSuffix('/foo/bar', '/bar')).toEqual('/foo/bar')
  })

  test('should return string with suffix', () => {
    expect(withSuffix('/foo/bar', '/baz')).toEqual('/foo/bar/baz')
  })
})

describe('withoutSuffix', () => {
  test('should return string with suffix', () => {
    expect(withoutSuffix('/foo/bar', '/baz')).toEqual('/foo/bar/baz')
  })

  test('should return string without suffix', () => {
    expect(withoutSuffix('/foo/bar', '/bar')).toEqual('/foo')
  })
})

describe('createUrl', () => {
  const url = 'https://www.foo.com'

  test('should return URL instance', () => {
    expect(createUrl(url)).toBeInstanceOf(URL)
  })

  test('should return original URL', () => {
    expect(createUrl(url)).toEqual(new URL(url))
    expect(createUrl(new URL(url))).toEqual(new URL(url))
  })

  test('should return example URL if passed URL is not valid', () => {
    expect(createUrl('invalid-url')).toEqual(new URL(`http://e.g/invalid-url`))
  })
})

describe('joinPaths', () => {
  test('should join paths to string', () => {
    const path = joinPaths('foo', '//bar', '/baz', '/boo')
    expect(path).toEqual('foo/bar/baz/boo')
  })
})

describe('getFullPath', () => {
  test('should return full path', () => {
    const path = getFullPath('https://foo.com/some/path')
    expect(path).toEqual('/some/path')
  })

  test('should return path without base', () => {
    const path = getFullPath('https://foo.com/some/path', '/some')
    expect(path).toEqual('/path')
  })
})
