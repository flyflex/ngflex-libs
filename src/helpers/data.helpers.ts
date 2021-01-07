export class NgrxDataHelpers {
  public static upsertOne = <T, K extends keyof T>(array: T[] = [], item: T, comparisonKey: K): T[] => {
    const newArray: T[] = [...array];
    const index = newArray.findIndex(comparedItem => comparedItem[comparisonKey] === item[comparisonKey]);

    if (index > -1) {
      newArray[index] = item;
    } else {
      newArray.push(item);
    }

    return newArray;
  }

  public static upsertMany = <T, K extends keyof T>(array: T[] = [], items: T[], comparisonKey: K): T[] => {
    let newArray: T[] = [...array];

    for (const item of items) {
      newArray = NgrxDataHelpers.upsertOne(newArray, item, comparisonKey);
    }

    return newArray;
  }

  public static removeOne = <T, K extends keyof T>(array: T[] = [], item: T, comparisonKey: K): T[] => {
    const newArray: T[] = [...array];
    const index = newArray.findIndex(comparedItem => comparedItem[comparisonKey] === item[comparisonKey]);

    if (index > -1) {
      newArray.splice(index, 1);
    }

    return newArray;
  }

  public static removeMany = <T, K extends keyof T>(array: T[] = [], items: T[], comparisonKey: K): T[] => {
    let newArray: T[] = [...array];

    for (const item of items) {
      newArray = NgrxDataHelpers.removeOne(newArray, item, comparisonKey)
    }

    return newArray;
  }
}
