import { MiniLog } from '../index'

describe('Minilog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Default log level is "trace"', () => {
    const logger = new MiniLog()

    const allLevels = logger.allLevels()

    const result = logger.level()
    expect(result.name).toBe('trace')
    expect(result.value).toBe(allLevels['trace'])
  })
})
