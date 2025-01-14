import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Home from "./Pages/Home";
import Sales from "./Pages/Sales";
import Purchase from "./Pages/Purchase";
import Customer from "./Pages/Customer";
import Product from "./Pages/Product";
import Supplier from "./Pages/Supplier";
import Expense from "./Pages/Expense";
import NewPurchase from "./Components/NewPurchase/NewPurchase";
import CurrentStock from "./Components/currentStock/CurrentStock";
import SupplierLedger from "./Components/SupplierLedger/SupplierLedger";
import SingleSupplierLedger from "./Components/SingleSupplierLedger/SingleSupplierLedger";
import NewSale from "./Components/NewSale/NewSale";
import CustomerLedger from "./Components/CustomerLedger.jsx/CustomerLedger";
import SingleCustomerLedger from "./Components/SingleCustomerLedger/SingleCustomerLedger";
import Login from "./Components/Login/Login";
import Protected from "./Components/Protected/Protected";
import Quotation from "./Components/Quotation/Quotation";
import NewQuotation from "./Components/NewQuotation/NewQuotation";
import PdfInvoice from "./Components/PdfMaker/PdfInvoice";
import PurchaseInvoice from "./Components/PdfMaker/PurchaseInvoice";
import DeviceRestriction from "./Pages/DeviceRestriction";
import NotFound from "./Pages/NotFound";
import QuotationInvoice from "./Components/PdfMaker/QuotationInvoice";
import TradeReturn from "./Components/Return/TradeReturn";
import Summary from "./Pages/Summary";
import ExpenseList from "./Components/ExpenseList/ExpenseList";
import Debt from "./Pages/Debt";
import DebtProtected from "./Components/DebtProtected/DebtProtected";
import Lend from "./Pages/Lend";
import CustomerScheduleDate from "./Pages/CustomerScheduleDate";
import DailySummary from "./Pages/DailySummary";
import CustomerStatement from "./Components/CustomerStatement/CustomerStatement";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/salesInvoice/:invoiceNumber", element: <PdfInvoice /> },
  { path: "/purchaseInvoice/:invoiceNumber", element: <PurchaseInvoice /> },
  { path: "/quotation/:id", element: <QuotationInvoice /> },
  {
    path: "/",
    element: (
      <Protected>
        <DeviceRestriction>
          <Root />
        </DeviceRestriction>
      </Protected>
    ), errorElement: <NotFound />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/sales", element: <Sales /> },
      { path: "/purchase", element: <Purchase /> },
      { path: "/quotation", element: <Quotation /> },
      { path: "/customer", element: <Customer /> },
      { path: "/product", element: <Product /> },
      { path: "/supplier", element: <Supplier /> },
      { path: "/balance", element: <Expense /> },
      { path: "/newPurchase", element: <NewPurchase /> },
      { path: "/newSales", element: <NewSale /> },
      { path: "/newQuotation", element: <NewQuotation /> },
      { path: "/currentStock", element: <CurrentStock /> },
      { path: "/supplierLedger", element: <SupplierLedger /> },
      { path: "/customerLedger", element: <CustomerLedger /> },
      { path: "/supplierLedger/id/:_id", element: <SingleSupplierLedger /> },
      { path: "/customerLedger/id/:_id", element: <SingleCustomerLedger /> },
      { path: "/customerLedger/statement/id/:_id", element: <CustomerStatement /> },
      { path: "/return", element: <TradeReturn /> },
      { path: "/summary", element: <Summary /> },
      { path: "/expenseList", element: <ExpenseList /> },
      { path: "/customerPaymentDate", element: <CustomerScheduleDate/> },
      { path: "/debt", element: <DebtProtected><Debt /></DebtProtected> },
      { path: "/lend", element: <DebtProtected><Lend/></DebtProtected> },
      { path: "/dailySummaryReport", element: <DailySummary /> },
    ],
  },
]);
