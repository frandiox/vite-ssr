import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  testMatch: ['**/*.spec.[jt]s?(x)'],
  transform: {
    '^.+\\.tsx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
      },
    ],
  },
}

export default config
