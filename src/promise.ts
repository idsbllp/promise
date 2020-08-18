enum Status {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
  PromiseReturned = 'promiseReturned',
}

type TFulfilledFn<T, TResult = void> = (value: T) => TResult;
type TRejectedFn = (error: Error | string) => void;

type TExecutorFn<T> = (resolve: TFulfilledFn<T>, reject: TRejectedFn) => void;

interface IDeferred<TResult, T> {
  promise: PromiseA<TResult>;
    onFulfilled: TFulfilledFn<T, TResult>;
    onRejected: TRejectedFn | undefined;
}

function noop() {
  //
}

function sealStatus(promiseA: PromiseA) {
  const status = promiseA.status;

  Object.defineProperty(promiseA, 'status', {
    get() {
      return status;
    },
    set() {
      throw new Error('status can not be rewrite');
    },
  });
}

function doResolveAsync<T>(executor: TExecutorFn<T>, promiseA: PromiseA<T>) {
  function _resolve(value: T) {
    handleResolve(promiseA, value);
  }

  function _reject(error: any) {
    handleReject(promiseA, error);
  }

  executor(_resolve, _reject);
}

function handleResolve<T, TValue>(promiseA: PromiseA<T>, value: TValue) {
  if (promiseA.status !== Status.Pending) return;
  promiseA.value = value;

  if (value instanceof PromiseA) {
    promiseA.status = Status.PromiseReturned;
  } else {
    promiseA.status = Status.Fulfilled;
    sealStatus(promiseA);
  }

  callDeferred(promiseA);
}

function handleReject<T>(promiseA: PromiseA<T>, error: any) {
  promiseA.value = error;
  promiseA.status = Status.Rejected;
  sealStatus(promiseA);

  callDeferred(promiseA);
}

function callDeferred<T>(promiseA: PromiseA<T>) {
  promiseA.deferredCallback.forEach(deferred => {
    handleDeferred(promiseA, deferred);
  });

  promiseA.deferredCallback = [];
}

/**
 * 处理 deferred
 * 当状态为 Pending 时， 向 deferred 属性中追加
 * 当状态为 Fulfilled 或者 Rejected 时，延时分别执行对应函数
 */
function handleDeferred<TResult, T>(promiseA: PromiseA<T>, deferred: IDeferred<TResult, T>) {
  while (promiseA.status === Status.PromiseReturned) {
    promiseA = promiseA.value;
  }

  if (promiseA.status === Status.Pending) {
    promiseA.deferredCallback.push(deferred);
    return;
  }

  // 模拟延时
  setImmediate(() => {
    const callback = promiseA.status === Status.Fulfilled ? deferred.onFulfilled : deferred.onRejected;

    if (!callback) return;

    const value = callback(promiseA.value);

    // 处理 then 返回的 promise
    handleResolve(deferred.promise, value);
  });
}

class PromiseA<T = any> {
  value: any;

  deferredCallback: IDeferred<any, T>[]  = [];

   status = Status.Pending;

  constructor(executor: TExecutorFn<T>) {
    doResolveAsync(executor, this);
  }

  then<TResult>(onFulfilled: TFulfilledFn<T, TResult>, onRejected?: TRejectedFn) {
    const promiseB = new PromiseA<TResult>(noop);

    const deferred: IDeferred<TResult, T> = {
      promise: promiseB,
      onFulfilled,
      onRejected,
    };

    handleDeferred(this, deferred);

    return promiseB;
  }
}

export default PromiseA;
