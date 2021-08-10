import { Statistic } from "./statistic"

export function linspace(start, stop, cardinality) {
  let arr = []
  let step = (stop - start) / (cardinality - 1)

  for (let i = 0; i < cardinality; i++) {
      arr.push(start + (step * i))
  }

  return arr
}

export function sumArr(values) {
  let result = 0
  if (!!values) {
      // for (let i = 0; i < values.length; i++) {
      //     result += values[i]
      // }
      result = values.reduce((a, b) => a + b, 0)
  }
  return result
}

export function meanArr(values) {
  let result = 0
  if (!!values) {
      result = sumArr(values) / values.length
  }
  return result
}

export function stdArr(values) {
  let result = 0
  if (!!values && values.length > 0) {
      const mean = meanArr(values)

      for (let i = 0; i < values.length; i++) {
          result += Math.pow(values[i] - mean, 2)
      }

      result /= values.length - 1
      result = Math.sqrt(result)
  }
  return result
}

export function concat(arr1, arr2) {
  let result = []
  for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
      result.push((arr1[i] || 0) + (arr2[i] || 0))
  }
  return result
}

export function normalize(arr, max_number) {
  let result = []
  const max = Statistic.max(arr)
  for (let i = 0; i < arr.length; i++) {
      const val = arr[i]
      result.push(Math.round(val * (max_number / max)))
  }
  return result
}