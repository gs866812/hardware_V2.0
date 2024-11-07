import sales from "../assets/images/sales.png";
import summary from "../assets/images/summary.png";
import purchase from "../assets/images/purchase.png";
import customer from "../assets/images/customer.png";
import invoice from "../assets/images/invoice.png";
import add_product from "../assets/images/add_product.png";
import stock_report from "../assets/images/stock_report.png";
import sales_report from "../assets/images/sales_report.png";
import purchase_report from "../assets/images/purchase_report.png";
import balance from "../assets/images/balance.png";
import logout from "../assets/images/logout.png";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ContextData } from "../Provider";
import { toast } from "react-toastify";
import useAxiosProtect from "../Components/hooks/useAxiosProtect";
import Summary from "./Summary";


const Home = () => {
  const axiosProtect = useAxiosProtect();
  const { mainBalance, reFetch, setMainBalance, currentPage, itemsPerPage, searchStock, user, setCount, setStock } = useContext(ContextData);


  const [supplierDue, setSupplierDue] = useState([]);
  const [customerDue, setCustomerDue] = useState([]);
  const [totalStock, setTotalStock] = useState(0);

  const mBalance = mainBalance[0]?.mainBalance;
  const parseBalance = parseFloat(mBalance || 0);
  const currentBalance = parseFloat(parseBalance.toFixed(2)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formattedTotalStock = parseFloat(totalStock || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedCustomerDue = parseFloat(customerDue[0]?.customerDueBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedSupplierDue = parseFloat(supplierDue[0]?.supplierDueBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });




  useEffect(() => {
    axiosProtect.get('/supplierTotalDueBalance', {
      params: {
        userEmail: user?.email,
      },
    })
      .then(res => {
        setSupplierDue(res.data);
      }).catch(err => {
        toast.error(err);
      });
  }, [reFetch]);

  useEffect(() => {
    axiosProtect.get('/customerTotalDueBalance', {
      params: {
        userEmail: user?.email,
      },
    })
      .then(res => {
        setCustomerDue(res.data);
      }).catch(err => {
        toast.error(err);
      });
  }, [reFetch]);

  // ............... get main balance
  useEffect(() => {
    axiosProtect.get("/mainBalance", {
      params: {
        userEmail: user?.email,
      },
    })
      .then((res) => {
        setMainBalance(res.data);
      });
  }, [reFetch]);

  // ......................
  // get stock balance
  useEffect(() => {
    axiosProtect
      .get(`/stockBalance`, {
        params: {
          userEmail: user?.email,
          page: currentPage,
          size: itemsPerPage,
          search: searchStock,
        },
      })
      .then((res) => {
        setStock(res.data.result);
        setCount(res.data.count);
        setTotalStock(res.data.totalStock); // Set total stock from response
      })
      .catch((err) => {
        toast.error(err);
      });
  }, [reFetch, currentPage, itemsPerPage, searchStock]);

  return (
    <div className="p-2">
      <div className="flex justify-between gap-2">
        <div className="w-full animate__fadeInDown animate__animated">
          <div className="flex flex-col gap-3 justify-center border px-3 py-6 shadow-lg text-center rounded-md bg-green-600 text-white">
            <h2 className="text-xl font-bold">BDT {currentBalance}</h2>
            <p>CURRENT BALANCE</p>
          </div>
        </div>
        <div className="w-full animate__fadeInDown animate__animated">
          <div className="flex flex-col gap-3 justify-center border px-3 py-6 shadow-lg text-center rounded-md bg-green-500 text-white">
            <h2 className="text-xl font-bold">{formattedTotalStock}</h2>
            <p>CURRENT STOCK</p>
          </div>
        </div>
        <div className="w-full animate__fadeInDown animate__animated">
          <div className="flex flex-col gap-3 justify-center border px-3 py-6 shadow-lg text-center rounded-md bg-yellow-500 text-white">
            <h2 className="text-xl font-bold">BDT: {formattedCustomerDue}</h2>
            <p>CUSTOMER DUE</p>
          </div>
        </div>
        <div className="w-full animate__fadeInDown animate__animated">
          <div className="flex flex-col gap-3 justify-center border px-3 py-6 shadow-lg text-center rounded-md bg-red-500 text-white">
            <h2 className="text-xl font-bold">BDT: {formattedSupplierDue}</h2>
            <p>SUPPLIER DUE</p>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      <Summary />
      {/* --------------------------------------------------------- */}

      {/* dashboard cards */}

      {/* <div className="grid grid-cols-5 gap-5 mt-12">
        <Link to="/summary">
          <div className="flex flex-col items-center py-3 px-7 rounded-lg shadow border gap-5">
            <img src={summary} alt="sales" className="w-[60%]" />
            <p className="text-center">Summary</p>
          </div>
        </Link>
        <Link to="/sales">
          <div className="flex flex-col items-center py-3 px-7 rounded-lg shadow border gap-5">
            <img src={sales} alt="sales" className="w-[60%]" />
            <p className="text-center">Sales</p>
          </div>
        </Link>

        <Link to="purchase">
          <div className="flex flex-col items-center py-3 px-7 rounded-lg shadow border gap-5 cursor-pointer">
            <img src={purchase} alt="Purchase" className="w-[60%]" />
            <p className="text-center">Purchase</p>
          </div>
        </Link>

        <Link to="/customer">
          <div className="flex flex-col items-center py-3 px-7 rounded-lg shadow border gap-5 cursor-pointer">
            <img src={customer} alt="Customer" className="w-[60%]" />
            <p className="text-center">Customer</p>
          </div>
        </Link>

        <Link to="">
          <div className="flex flex-col items-center py-3 px-7 rounded-lg shadow border gap-5 cursor-pointer">
            <img src={invoice} alt="Invoice" className="w-[60%]" />
            <p className="text-center">Invoice</p>
          </div>
        </Link>
        <Link to="product">
          <div className="flex flex-col items-center py-3 px-7 rounded-lg shadow border gap-5 cursor-pointer">
            <img src={add_product} alt="Product" className="w-[60%]" />
            <p className="text-center">Product</p>
          </div>
        </Link>

        <Link to='currentStock' className="flex flex-col items-center py-3 px-7 rounded-lg shadow border gap-5 cursor-pointer">
          <img src={stock_report} alt="Stock Report" className="w-[60%]" />
          <p className="text-center">Stock Report</p>
        </Link>
        <div className="flex flex-col items-center py-3 px-7 rounded-lg shadow border gap-5 cursor-pointer">
          <img src={sales_report} alt="Sales Report" className="w-[60%]" />
          <p className="text-center">Sales Report</p>
        </div>
        <div className="flex flex-col items-center py-3 px-7 rounded-lg shadow border gap-5 cursor-pointer">
          <img
            src={purchase_report}
            alt="Purchase Report"
            className="w-[60%]"
          />
          <p className="text-center">Purchase Report</p>
        </div>
        <Link to='/balance' className="flex flex-col items-center py-3 px-7 rounded-lg shadow border gap-5 cursor-pointer">
          <img src={balance} alt="Balance" className="w-[60%]" />
          <p className="text-center">Balance</p>
        </Link>
        <div onClick={() => logOut()} className="flex flex-col items-center py-3 px-7 rounded-lg shadow border gap-5 cursor-pointer">
          <img src={logout} alt="Purchase Report" className="w-[60%]" />
          <p className="text-center">Logout</p>
        </div>
      </div> */}
    </div>
  );
};

export default Home;
