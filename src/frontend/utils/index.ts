
export const compose = (...params: ((fn: any) => any)[]): any => {
  let fn = params[0];
  for (let i = 1; i < params.length; i++) {
    fn = params[i](fn);
  }

  return fn;
}
