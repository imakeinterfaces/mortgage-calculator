import { DateInput, Grid, Box } from "grommet";
import logo from "./logo.svg";
import "./App.css";
export const toFindWithoutMonthlyPayment = {};

// 1. get teh expected cost of the loan initiall without prepayments
// 2. factor in the prepayments - we'll need to add these to the sum of payments result

const PAID_OFF_PAYMENT_LABEL = "Prepaid Month Removed!";

function daysBetween(d1, d2) {
  var diff = Math.abs(d1.getTime() - d2.getTime());
  return diff / (1000 * 60 * 60 * 24);
}

function toPercent(val) {
  return val / 100;
}

/*
 Starting in month one, take the total amount of the loan and multiply
 it by the interest rate on the loan. Then for a loan with monthly repayments,
 divide the result by 12 to get your monthly interest. Subtract the interest
 from the total monthly payment, and the remaining amount is what goes toward principal.
 For month two, do the same thing, except start with the remaining principal balance
 from month one rather than the original amount of the loan. By the end of the set loan term,
 your principal should be at zero.
*/
function getRemainingPrincipal(mtg) {
  const { loanAmount, interestRate, monthlyPayment } = mtg;

  // Starting in month one, take the total amount of the loan and multiply it by the interest rate on the loan. divide the result by 12 to get your monthly interest.
  const monthlyInterest = (loanAmount * toPercent(interestRate)) / 12;
  // Subtract the interest from the total monthly payment, and the remaining amount is what goes toward principal.
  const principalPayment = monthlyPayment - monthlyInterest;

  const getRemainingPrincipal = loanAmount - principalPayment;
  console.log('das monthly payment', principalPayment)
  return getRemainingPrincipal;
}

function getSumOfFullTermPayments(mtg) {
  const { monthlyPayment, maturityTerm } = mtg;
return monthlyPayment * (maturityTerm * 12)
}


function getEliminatedPrepaymentMonths(paymentsArray) {
  // Count number of $0 payments
  return paymentsArray.filter(payment => payment.newLoanAmount === 0).length;
}

function getTotalAmountPaid(paymentsArray) {
  let amountPaid = 0;
  paymentsArray.forEach(payment => amountPaid = amountPaid + payment.newLoanAmount);
  return amountPaid;
}

function getEliminatedPrepaymentCost() {
  // to do
}
function loanAmountWithDeductedPrepayments(
  prePayments,
  nextDate,
  newLoanAmount
) {
  // return only the ones not yet reached
  prePayments.forEach((pmt, i, arr) => {
    const dbt = daysBetween(new Date(pmt.paymentDate), new Date(nextDate));
    if (dbt <= 31) {
      newLoanAmount = newLoanAmount - pmt.amount;
      if (pmt.amount) console.log("prepaid at", pmt.amount);
      prePayments.splice(i, 1);
    }
  });
  return {
    newLoanAmountMinusPrepayments: newLoanAmount,
    newPrePayments: prePayments,
  };
}

// const newPrePayments = ([pps, ...rest]) => {
//     console.log("restpp1", pps);
//     return rest;
// };

function loopAmortization(
  mtgObj,
  currentDate,
  prePayments,
  currentMonthIndex = 0,
  paymentsArray = []
) {
  const { maturityTerm } = mtgObj;
  const maturityMonths = maturityTerm * 12;

  let newLoanAmount = 0;

  if (currentMonthIndex < maturityMonths) {
    currentMonthIndex++;
    newLoanAmount = Math.round(getRemainingPrincipal(mtgObj));
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);

    const { newLoanAmountMinusPrepayments, newPrePayments } =
      loanAmountWithDeductedPrepayments(prePayments, nextDate, newLoanAmount);
    newLoanAmount = newLoanAmountMinusPrepayments;

    const loanAmountIsNegative = Math.sign(newLoanAmount) === -1;

    newLoanAmount = !loanAmountIsNegative ? newLoanAmount : 0;

    loopAmortization(
      { ...mtgObj, loanAmount: newLoanAmount },
      nextDate,
      newPrePayments,
      currentMonthIndex,
      paymentsArray
    );

    paymentsArray.push({ newLoanAmount, nextDate });
  }

  return {
    ...mtgObj,
    loanAmount: newLoanAmount,
    currentMonthIndex,
    paymentsArray,
  };
}

export const mtg = {
  loanAmount: 171600,
  interestRate: 4.25,
  maturityTerm: 30,
  monthlyPayment: 843,
  startDate: "April 30, 2017 12:00:00",
};

export const prePayments = [
  // {
  //   name: "prepayment 1",
  //   amount: 20000,
  //   paymentDate: "April 28, 2020 12:00:00",
  // },
  // {
  //   name: "prepayment 2",
  //   amount: 5000,
  //   paymentDate: "February 1, 2021 12:00:00",
  // },
];

const { paymentsArray } = loopAmortization(mtg, mtg.startDate, prePayments);
console.log(paymentsArray)
function App() {
  return (
    <div className="App">
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Grid
          areas={[
            { name: "nav", start: [0, 0], end: [0, 0] },
            { name: "main", start: [1, 0], end: [1, 0] },
            { name: "side", start: [2, 0], end: [2, 0] },
            { name: "foot", start: [0, 1], end: [2, 1] },
          ]}
          columns={["small", "flex", "medium"]}
          rows={["medium", "small"]}
          gap="small"
          height="xlarge"
        >
          <Box gridArea="nav" background="brand">
            <h4>Loan Amount</h4>
            <h4>Interest rate with APR</h4>
            <h4>Term</h4>
            <h4>Monthly Payment</h4>
            <h4>Mortgage Start Date</h4>
            <DateInput
              format="mm/dd/yyyy"
              value={new Date().toISOString()}
              onChange={({ value }) => {}}
            />
          </Box>
          <Box gridArea="main" background="brand">
            <h4>Prepayments</h4>
            <p>Amount</p>
            <p>Date</p>

            {/* <p>Monthly Additional Principal Payment</p>
              <p>Yearly Additional Principal Payment</p>*/}
          </Box>
          <Box gridArea="side" background="brand" />
          <Box gridArea="foot" background="accent-1" />
        </Grid>

        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>TOTAL MONTHS SAVED</p>
        <p>{getEliminatedPrepaymentMonths(paymentsArray)}</p>
        <p>TOTAL AMOUNT PAID:{getTotalAmountPaid(paymentsArray)}</p>
        <p>Expected total cost: {getSumOfFullTermPayments(mtg)}</p>
        {paymentsArray.map(({ newLoanAmount, nextDate }) => (
          <div className="value">
            <p>{newLoanAmount}</p>
            <p> {nextDate.toString()}</p>
            <p> {!newLoanAmount ? PAID_OFF_PAYMENT_LABEL : ""}</p>
          </div>
        ))}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </div>
    </div>
  );
}

export default App;
