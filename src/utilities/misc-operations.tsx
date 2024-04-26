export const chooseRandom: (min: number, max: number) => number = (min, max) => {
  const range = max - min + 1;
  const chosen = Math.floor(Math.random() * range);
  return min + chosen;
};

export const deepCopy: <T>(value: T) => T = (value) => {
  if (value === null || typeof value !== "object") { return value; }

  if (value instanceof Date) {
    const dateCopy = new Date();
    dateCopy.setTime(value.getTime());
    return dateCopy as typeof value;
  }

  if (value instanceof Object) {
    const objCopy = { ...value };
    const obj = value as Object;
    for (let prop in value) {
      if (obj.hasOwnProperty(prop)) {
        objCopy[prop] = deepCopy(value[prop]);
      }
    }
    return objCopy;
  }

  return value;
};

export type OperationFunction = <T>(data: T) => T;

type OperationPipelineFunction = (operations: Array<OperationFunction>) => { run: OperationFunction }
export const operationPipeline:OperationPipelineFunction = (operations) => {
  return {
    run: (value) => {
      let lastValue = value;
      for (let i = 0; i < operations.length; i++) {
        lastValue = operations[i](lastValue);
      }
      return lastValue;
    }
  };
};