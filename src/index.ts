import PromiseA from './promise';

const promiseA1 = new PromiseA<string>((resolve, reject) => {
  setTimeout(() => {
    resolve('string');
  }, 1000);
});

// console.log('promiseA1 111: ', promiseA1);


const promise2 = promiseA1.then(data => {
// const promiseA2 = promiseA1.then(data => {
  console.log(111, data);

  return new PromiseA<string>(resolve => {
    setTimeout(() => {
      resolve('promise return');
    }, 1000);
  });
}).then(res => {
  console.log(222222222222, res, promise2.status);
  return {};
});

promise2.then(res => {
  console.log('promise2 res: ', res, promise2.status);
});

promiseA1.then(res => {
  console.log(33333333333, res);
});

// console.log('promiseA1 222: ', promiseA1);

// console.log('promiseA2 333: ', promiseA2);

// const promise3 = promiseA2.then(data => {
//   console.log(222, data);

//   return {};
// });

// console.log('promiseA1 === promiseA2: ', promiseA1 === promiseA2, promiseA2 === promise3);


// for compare
// const promise = new Promise<number>((resolve, reject) => {
//   setTimeout(() => {
//     resolve(12345);
//   }, 1000);
// });

// promise.then(data => {
//   console.log(111, data);

//   return 'string';
// }).then(data => {
//   console.log(222, data);
// });
