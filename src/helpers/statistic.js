export const Statistic = {
  sum: (values) => {
    let result = 0
    if (!!values) {
        for (let i = 0; i < values.length; i++) {
            result += values[i]
        }
    }
    return result
  },

  min:(values) => {
    let minVal = values[0]

    for (let i = 0; i < values.length; i++) {
        const val = values[i]
        if (minVal > val) {
            minVal = val
        }
    }

    return minVal
  },

  max: (values) => {
    let maxVal = values[0]

    for (let i = 0; i < values.length; i++) {
        const val = values[i]
        if (maxVal < val) {
            maxVal = val
        }
    }

    return maxVal
  },

  mean: (values) => {
    let result = 0
    if (!!values) {
        result = Statistic.sum(values) / values.length
    }
    return result
  },

  std: (values) => {
    let result = 0
    if (!!values && values.length > 0) {
        const mean = Statistic.mean(values)

        for (let i = 0; i < values.length; i++) {
            result += Math.pow(values[i] - mean, 2)
        }

        result /= values.length - 1
        result = Math.sqrt(result)
    }
    return result
  },
}