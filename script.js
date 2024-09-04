'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2024-08-29T23:36:17.929Z',
    '2024-09-02T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatmovementdate=function(date,locale){
  
  const daysbtwn=(date1,date2)=>Math.abs((date2-date1)/(24*60*60*1000));
  const dayspassed=Math.round(daysbtwn(new Date(),date));
  if(dayspassed===0){
    return 'Today'
  }
   if(dayspassed===1) return 'Yesterday';
  if(dayspassed<=7) return dayspassed+' days ago';
  // else{
  // const year=date.getFullYear();
  // const month=`${date.getMonth()+1}`.padStart(2,0);
  // const day=`${date.getDate()}`.padStart(2,0);
  // return `${day}/${month}/${year}`;
  // }
  return new Intl.DateTimeFormat(locale).format(date);
    

};

const formatcur=function(value,locale,currency){
  return new Intl.NumberFormat(locale,
    {
      style:'currency',
      currency:currency
    }).format(value);

}

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date=new Date(acc.movementsDates[i]);
    const displaydate=formatmovementdate(date,acc.locale);

    // const formatedmov=new Intl.NumberFormat(acc.locale,
    //   {
    //     style:'currency',
    //     currency:acc.currency
    //   }).format(mov);

    //for the above we created a reuseable function 
    const formatedmov=formatcur(mov,acc.locale,acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1} ${type}</div>
    <div class="movements__date">${displaydate}</div>
        <div class="movements__value">${formatedmov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatcur(acc.balance,acc.locale,acc.currency);//`${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatcur(incomes,acc.locale,acc.currency)//`${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatcur(Math.abs(out),acc.locale,acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatcur(interest,acc.locale,acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startlogouttimer=function(){
  //set time to 5 minutes
  let time=50;
  
  //call the timer every second
  const timer=setInterval(function(){

    const  min=String(Math.trunc(time/60)).padStart(2,0);
    const sec=String(time%60).padStart(2,0);
  //in each call,print the remaining time to ui
    labelTimer.textContent=`${min}:${sec}`;
   
  //when 0 seconds,stop timer and logout user
  if(time===0){
    clearInterval(timer);
    labelWelcome.textContent = 'Log in to get started';
    containerApp.style.opacity = 0;
  }
  time--;
  },1000);

  return timer;
  
};

///////////////////////////////////////
// Event handlers
let currentAccount,timer;

//fake login for working
// currentAccount=account1;
// updateUI(account1);
// containerApp.style.opacity = 100;

//experimenting api

// const now=new Date();
// const options={
//   hour:'numeric',
//   minute:'numeric',
//   day:'numeric',
//   month:'numeric', //'long'
//   year:'numeric',
//   weekday:'long'
// };

// const locale=navigator.language;
// console.log(locale);
// labelDate.textContent=new Intl.DateTimeFormat
// (locale,options).format(now);



btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);


  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //current date 
    const now=new Date();
    const options={
      hour:'numeric',
      minute:'numeric',
      day:'numeric',
      month:'numeric', //'long'
      year:'numeric',
      weekday:'long'
    };

    // const locale=navigator.language;
    // console.log(locale);
    labelDate.textContent=new Intl.DateTimeFormat
    (currentAccount.locale,options).format(now);
    // const year=now.getFullYear();
    // const month=`${now.getMonth()+1}`.padStart(2,0);
    // const date=`${now.getDate()}`.padStart(2,0);
    // const hours=now.getHours();
    // const mins=now.getMinutes();
    // labelDate.textContent=`${date}/${month}/${year},${hours}:${mins}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if(timer) clearInterval(timer);
    //timer
    timer=startlogouttimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //adding transfer date
    
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    //reseting the time 
    clearInterval(timer);
    timer=startlogouttimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function(){
    // Add movement
    currentAccount.movements.push(amount);

    //adding  loan date
    currentAccount.movementsDates.push(new Date().toISOString());

    //reset the timer
    clearInterval(timer);
    timer=startlogouttimer();
    // Update UI
    updateUI(currentAccount);
    },2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// practice for this application

// console.log(0.1+0.2===0.3);
// console.log(Number('23'));
// console.log(+'23');
// console.log(Number.parseInt('200px',10));

// console.log(Number.isFinite(20));
// console.log(Number.isNaN(+'20px'));
// console.log(Number.isNaN(NaN));

// // math.sqrt
// console.log(Math.sqrt(25));
// console.log(25**(1/2));
// console.log(8**(1/3));
// console.log(Math.max(3,4,5,4,5));

// console.log(Math.trunc(Math.random()*6)+1);
// console.log(Math.round(23.2));
// console.log(Math.ceil(23.3));
// console.log(Math.floor(23.9));
// console.log(Math.trunc(23.333));
// console.log((2.3).toFixed(0));
// console.log((2.3333).toFixed(2));
// console.log((2.3).toFixed(4));


// //      remainder operator
// const iseven=n=>n%2===0;
// console.log(iseven(6));

// labelBalance.addEventListener('click',function(){
// [...document.querySelectorAll('.movements__row')].
// forEach(function(row,i){
//   if(i%2==0)
    
//     row.style.backgroundColor='orangered';
    
//   });

// });

// const arr=[1,2,3,4]
// arr.forEach(function(vl,i){
// console.log(vl,i);
// })

// //      bigint
// const i=3243465465465435165456456;
// console.log(i);
// console.log(3243465465465435165456456n);
// console.log(BigInt(i));
//     // operations
// console.log(3243243n+2343n);
// console.log(12n+12n);
// console.log(11n/3n);
// console.log(11/3);


//          dates


// const date=new Date();
// console.log(date);
// console.log(new Date('Tue Sep 03 2024 14:18:28 GMT+0530'));
// console.log(new Date('decem,2015'));
// console.log(account1.movementsDates);
// console.log(new Date(account1.movementsDates[0]));
// console.log(new Date(0));
// console.log(new Date(3*24*60*60*1000));
// console.log(new Date(24*60*60*1000));

// const future=new Date(2037,10,19,14,23);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getDay());
// console.log(future.getHours());
// console.log(future.toISOString());
// console.log(future.toString());
// console.log(future.getTime());
// console.log(new Date(1725354398397))
// console.log(Date.now());

// future.setFullYear(2040);
// console.log(future);


// console.log(Number(future));
// console.log(future.getTime());
// console.log(+future);

// const future1=new Date(2033,3,14);
// const future2=new Date(2033,3,4);
// console.log(daysbtwn(future1,future2));

        //internationalization on numbers

// const num=32423423;
// const options={
//   style:'currency',//'percent',//'unit',
//   unit:'celsius',//'mile-per-hour'
//   currency:'EUR'

// }
// console.log(`US : ${new Intl.NumberFormat('us-UK',options).format(num)}`);
// console.log(`germany : ${new Intl.NumberFormat('de-DE',options).format(num)}`);
// console.log(`syria : ${new Intl.NumberFormat('ar-SY',options).format(num)}`);

//              SETTIMEOUT

const ingre=['sugar','spicy'];
const pizzatime=setTimeout((...ingree)=>console.log(`you have ordered pizza with ${ingree[0]} and ${ingree[1]}🍕`)
,1000,...ingre);
setTimeout(()=>console.log('hello raki'),2000);

if(ingre.includes('sugar')) {
  console.log('yes');
  clearTimeout(pizzatime);
}

//              settimeinterval
setInterval(function(){
  const now=new Date();
  const options={
    hour:'numeric',
    minute:'numeric',
    second:'numeric'
  }
  const locale=navigator.language
  console.log(new Intl.DateTimeFormat(locale,options).format(now));
},1000);
