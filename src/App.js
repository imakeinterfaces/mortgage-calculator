import {
  DateInput,
  Grid,
  Box,
  Meter,
  TableCell,
  TableHeader,
  TableBody,
  TableRow,
  Table,
} from "grommet";
import { Chart } from "react-google-charts";
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
  console.log("das monthly payment", principalPayment);
  return getRemainingPrincipal;
}

function getSumOfFullTermPayments(mtg) {
  const { monthlyPayment, maturityTerm } = mtg;
  return monthlyPayment * (maturityTerm * 12);
}

function getEliminatedPrepaymentMonths(paymentsArray) {
  // Count number of $0 payments
  return paymentsArray.filter((payment) => payment.newLoanAmount === 0).length;
}

function addPrePayments(prePayments) {
  let sum = 0;
  prePayments.forEach((payment) => {
    console.log("das payment 331", payment);
    sum = sum + payment.amount;
  });

  return sum;
}

function getTotalAmountPaid(paymentsArray, mtg, prePayments) {
  const { monthlyPayment } = mtg;
  let amountPaid = 0;
  paymentsArray.forEach((payment) => {
    if (payment.newLoanAmount !== 0) {
      amountPaid = amountPaid + monthlyPayment;
    }
  });

  return amountPaid + addPrePayments(prePayments);
}

function loanAmountWithDeductedPrepayments(
  prePayments,
  nextDate,
  newLoanAmount
) {
  const newPrePayments = [...prePayments];
  let shouldImpactPayment;
  // return only the ones not yet reached
  newPrePayments.forEach((pmt, i, arr) => {
    const dbt = daysBetween(new Date(pmt.paymentDate), new Date(nextDate));
    shouldImpactPayment = dbt <= 31;
    if (shouldImpactPayment) {
      newLoanAmount = newLoanAmount - pmt.amount;
      newPrePayments.splice(i, 1);
    }
  });
  return {
    newLoanAmountMinusPrepayments: newLoanAmount,
    newPrePayments,
    shouldImpactPayment,
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

    const {
      newLoanAmountMinusPrepayments,
      newPrePayments,
      // shouldImpactPayment,
    } = loanAmountWithDeductedPrepayments(prePayments, nextDate, newLoanAmount);
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
  {
    name: "prepayment 1",
    amount: 5000,
    paymentDate: "April 28, 2020 12:00:00",
  },
  {
    name: "prepayment 2",
    amount: 5000,
    paymentDate: "February 1, 2021 12:00:00",
  },
];

export const data = [
  [
    "Day",
    "Guardians of the Galaxy",
    "The Avengers",
    "Transformers: Age of Extinction",
  ],
  [1, 37.8, 80.8, 41.8],
  [2, 30.9, 69.5, 32.4],
  [3, 25.4, 57, 25.7],
  [4, 11.7, 18.8, 10.5],
  [5, 11.9, 17.6, 10.4],
  [6, 8.8, 13.6, 7.7],
  [7, 7.6, 12.3, 9.6],
  [8, 12.3, 29.2, 10.6],
  [9, 16.9, 42.9, 14.8],
  [10, 12.8, 30.9, 11.6],
  [11, 5.3, 7.9, 4.7],
  [12, 6.6, 8.4, 5.2],
  [13, 4.8, 6.3, 3.6],
  [14, 4.2, 6.2, 3.4],
];

export const options = {
  chart: {
    title: "Box Office Earnings in First Two Weeks of Opening",
    subtitle: "in millions of dollars (USD)",
  },
};





const { paymentsArray } = loopAmortization(mtg, mtg.startDate, prePayments);
console.log(paymentsArray);
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

        <Chart
      chartType="Line"
      width="100%"
      height="400px"
      data={data}
      options={options}
    />

        <p>
          TOTAL MONTHS SAVED
          {getEliminatedPrepaymentMonths(paymentsArray)}
        </p>
        <p>
          TOTAL AMOUNT PAID:
          {getTotalAmountPaid(paymentsArray, mtg, prePayments)}
        </p>
        <p>
          Amount You Saved:
          {getSumOfFullTermPayments(mtg) -
            getTotalAmountPaid(paymentsArray, mtg, prePayments)}
        </p>
        <p>Expected total cost: {getSumOfFullTermPayments(mtg)}</p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableCell scope="col" border="bottom">
                Payment Date
              </TableCell>
              <TableCell scope="col" border="bottom">
                Remaining Balance
              </TableCell>
            </TableRow>
          </TableHeader>

          {paymentsArray.reverse().map(({ newLoanAmount, nextDate }) => (
            <TableBody>
              <TableRow>
                <TableCell scope="row">
                  <strong>
                    {nextDate.toLocaleString("default", {
                      year: "numeric",
                      month: "short",
                    })}
                  </strong>
                </TableCell>
                <TableCell>{newLoanAmount}</TableCell>
                <TableCell>
                  {!newLoanAmount ? PAID_OFF_PAYMENT_LABEL : ""}
                </TableCell>
                <TableCell>
                  <Meter
                    values={[
                      { value: 100 - (newLoanAmount / mtg.loanAmount) * 100 },
                    ]}
                    thickness="small"
                    size="small"
                  />
                  {Math.round(100 - (newLoanAmount / mtg.loanAmount) * 100) +
                    "%"}
                </TableCell>
              </TableRow>
            </TableBody>

            // <div className="value">

            // </div>
          ))}
        </Table>
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
