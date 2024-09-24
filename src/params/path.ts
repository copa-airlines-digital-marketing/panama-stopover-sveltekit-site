import { all, dropLast, test } from "ramda";

export function match(value) {
  const params = /^.*\/$/.test(value) ? dropLast(1,value.split('/')) : value.split('/')
  return params.length < 4 && all(test(/[a-zA-Z0-9-]/g), params)
}