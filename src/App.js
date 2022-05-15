import logo from "./logo.svg";
import "./App.css";

export const toFindWithoutMonthlyPayment = {};

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

  const remainingPrincipalPayment = loanAmount - principalPayment;
  return remainingPrincipalPayment;
}

function loopAmortization(mtg, n = 0) {
  const { maturityTerm } = mtg
  const maturityMonths = maturityTerm * 12

  if (n < maturityMonths) {
    n++;
    const newLoanAmount = getRemainingPrincipal(mtg) 

    // To Do: Convert this to an array for amortization table
    console.log(newLoanAmount)
    return loopAmortization({ ...mtg, loanAmount: newLoanAmount}, n)
  }
}

export const mtg = {
  loanAmount: 171600,
  interestRate: 4.25,
  maturityTerm: 30,
  monthlyPayment: 843
};



loopAmortization(mtg);

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
