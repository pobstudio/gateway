export function newArray(n: number, value?: any) {
  n = n || 0;
  var array = new Array(n);
  for (var i = 0; i < n; i++) {
    array[i] = value;
  }
  return array;
}

export function lerp(v0: number, v1: number, t: number) {
  return v0 * (1 - t) + v1 * t;
}
