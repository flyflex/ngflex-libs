export class JestUtils {
  public static getCallsSingleArgs = (...args: any[]) => {
    const callsArgs = [];

    args.forEach(arg => {
      callsArgs.push([arg]);
    });

    return callsArgs;
  }
}
