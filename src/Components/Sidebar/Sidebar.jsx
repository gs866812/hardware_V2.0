import { NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo_white.png";


import {
  FcBriefcase,
  FcBullish,
  FcBusinessman,
  FcCurrencyExchange,
  FcDocument,
  FcElectricity,
  FcInTransit,
  FcLeft,
  FcList,
  FcLowPriority,
  FcPaid,
  FcShop,
} from "react-icons/fc";
import { FaAngleDown, FaAnglesUp, FaAngleUp, FaUser } from "react-icons/fa6";
import StockPopUp from "../StockPopUp/StockPopUp";
import useAxiosSecure from "../hooks/useAxiosSecure";
import moment from "moment";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useContext, useState } from "react";
import { ContextData } from "../../Provider";

const Sidebar = () => {
  const axiosSecure = useAxiosSecure();
  const { reFetch, setReFetch, userName, logOut } = useContext(ContextData);
  const [newCostAmount, setNewCostAmount] = useState("");
  const [confirmCostAmount, setConfirmCostAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenExpense, setIsOpenExpense] = useState(false);
  const [isOpenDebt, setIsOpenDebt] = useState(false);

  // number validation
  const handleInputCostAmount = (event) => {
    const newCostAmountValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(newCostAmountValue)) {
      setNewCostAmount(newCostAmountValue);
    }
  };

  const handleInputConfirmCostAmount = (event) => {
    const confirmCostAmountValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(confirmCostAmountValue)) {
      setConfirmCostAmount(confirmCostAmountValue);
    }
  };

  // handle notes
  const handleNotes = (e) => {
    const noteValue = e.target.value;
    setNotes(noteValue);
  };

  //   handle reset
  const handleReset = (e) => {
    e.preventDefault();
    setNewCostAmount("");
    setConfirmCostAmount("");
    setNotes("");
  };

  const handleAddCostingBalance = (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true); // Set loading to true
    const date = moment(new Date()).format("DD.MM.YYYY");
    const form = e.target;
    const note = form.notes.value;
    const type = "Cost"; // deduct from main balance
    const costBalanceInfo = { confirmCostAmount, note, date, type, userName };

    if (newCostAmount !== confirmCostAmount) {
      setIsLoading(false); // Reset loading state
      toast.error("Amount not match");
      return;
    }
    axiosSecure
      .post(`/costingBalance`, costBalanceInfo)
      .then((res) => {
        if (res.data.insertedId) {
          const modal = document.querySelector(`#AddNewCostingInSidebar`);
          modal.close();
          setReFetch(!reFetch);

          setNotes("");
          setConfirmCostAmount("");
          setNewCostAmount("");

          Swal.fire({
            text: "Costing added successfully",
            icon: "success",
          });
        } else {
          toast.error(res.data);
        }
      })
      .catch((err) => {
        toast.error("Server error", err);
      })
      .finally(() => {
        setIsLoading(false); // Reset loading state
      });
  };

  const location = useLocation();
  // Check if the current URL path is "/customer"
  const isCustomer = location.pathname === "/customer";
  const isProduct = location.pathname === "/product";
  const isSupplier = location.pathname === "/supplier";

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const toggleDropdownExpense = () => {
    setIsOpenExpense(!isOpenExpense);
  };


  const toggleDropdownDebt = () => {
    setIsOpenDebt(!isOpenDebt);
  };

  return (
    <div>
      <div className="sticky top-0 bg-[#2A3042] z-50">
        <img src={logo} alt="MHT" className="py-3" />
      </div>

      <nav className="text-[#C1C1C1] mt-5 w-full">
        <div className="rounded-md animate__animated animate__backInDown">
          <NavLink
            to="/"
            className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px] rounded-md"
          >
            <FcShop className="text-xl" /> Dashboard
          </NavLink>
        </div>

        <div className=" rounded-md animate__animated animate__backInDown mt-1">
          <NavLink
            to="/sales"
            className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px] rounded-md"
          >
            <FcBullish className="text-xl" /> Sales
          </NavLink>
        </div>
        <div className=" rounded-md animate__animated animate__backInDown mt-1">
          <NavLink
            to="/purchase"
            className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px] rounded-md"
          >
            <FcLowPriority className="text-xl" /> Purchase
          </NavLink>
        </div>

        <div className=" animate__animated animate__backInDown mt-1">
          <NavLink
            to="/currentStock"
            className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px] rounded-md"
          >
            <FcBriefcase className="text-xl" /> Stock Balance
          </NavLink>
        </div>

        <div className=" animate__animated animate__backInDown mt-1">
          <NavLink
            to="/quotation"
            className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px] rounded-md"
          >
            <FcDocument className="text-xl" /> Quotation
          </NavLink>
        </div>
        <div className=" animate__animated animate__backInDown mt-1">
          <NavLink
            to="/customer"
            className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px] rounded-md"
          >
            <FcBusinessman className="text-xl" /> Customer
          </NavLink>
        </div>

        <div className=" animate__animated animate__backInDown mt-1">
          <NavLink
            to="/product"
            className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px] rounded-md"
          >
            <FcPaid className="text-xl" /> Product
          </NavLink>
        </div>

        <div className=" animate__animated animate__backInDown mt-1">
          <NavLink
            to="/supplier"
            className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px] rounded-md"
          >
            <FcInTransit className="text-xl" />
            Supplier{" "}
          </NavLink>
        </div>


        {/*  */}
        <div className={`text-white rounded-md mt-1 ${isOpen ? 'bg-gray-600' : ''}`}>
          <div
            className={`flex items-center justify-between cursor-pointer p-2 w-full hover:text-white gap-2 hover:bg-gray-600 mb-[1px] rounded-md ${isOpen ? 'hover:bg-none' : ''}`}
            onClick={toggleDropdown}
          >
            <div className="flex items-center gap-2">
              <FcList className="text-xl" />
              <span>Ledger</span>
            </div>
            <span>{isOpen ? <FaAngleUp /> : <FaAngleDown />}</span>
          </div>
          {isOpen && (
            <div className="text-gray-200 rounded-md p-2">
              <NavLink
                to="/supplierLedger"
                className="block px-4 p-1 hover:bg-[#151515] rounded-md"
              >
                Supplier
              </NavLink>
              <NavLink
                to="/customerLedger"
                className="block px-4 p-1 hover:bg-[#151515] rounded-md mt-1"
              >
                Customer
              </NavLink>
              <NavLink
                to="/customerPaymentDate"
                className="block px-4 p-1 hover:bg-[#151515] rounded-md mt-1"
              >
                Customer Payment date
              </NavLink>
            </div>
          )}
        </div>
        {/*  */}



        {/*  */}
        <div className={`text-white rounded-md mt-1 ${isOpenExpense ? 'bg-gray-600' : ''}`}>
          <div
            className={`flex items-center justify-between cursor-pointer p-2 w-full hover:text-white gap-2 hover:bg-gray-600 mb-[1px] rounded-md ${isOpenExpense ? 'hover:bg-none' : ''}`}
            onClick={toggleDropdownExpense}
          >
            <div className="flex items-center gap-2">
              <FcElectricity className="text-xl" />
              <span>Expense List</span>
            </div>
            <span>{isOpenExpense ? <FaAngleUp /> : <FaAngleDown />}</span>
          </div>
          {isOpenExpense && (
            <div className="text-gray-200 rounded-md p-2">
              <NavLink
                to="/balance"
                className="block px-4 p-1 hover:bg-[#151515] rounded-md"
              >
                Transactions
              </NavLink>
              <NavLink
                to="/expenseList"
                className="block px-4 p-1 hover:bg-[#151515] rounded-md mt-1"
              >
                Total Expense
              </NavLink>
            </div>
          )}
        </div>
        {/*  */}



        <div>

          {/* modal */}
          <dialog id="AddNewCostingInSidebar" className="modal text-black">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-3 uppercase">New Expense:</h3>
              <hr />
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                  ✕
                </button>
              </form>
              <form
                onSubmit={handleAddCostingBalance}
                className="mt-5 space-y-5"
              >
                <label className="flex items-center">
                  <p className="w-1/2 font-semibold">Cost amount:</p>{" "}
                  <input
                    type="text"
                    name="cost_amount"
                    placeholder="Cost Amount"
                    value={newCostAmount}
                    onChange={handleInputCostAmount}
                    className="py-1 px-2 rounded-md outline-none border w-1/2"
                    required
                  />
                </label>

                <label className="flex items-center">
                  <p className="w-1/2 font-semibold">Confirm cost amount:</p>
                  <input
                    type="text"
                    name="confirm_cost_amount"
                    placeholder="Confirm cost amount"
                    value={confirmCostAmount}
                    onChange={handleInputConfirmCostAmount}
                    className="py-1 px-2 rounded-md outline-none border w-1/2"
                    required
                  />
                </label>

                <label className="flex items-center">
                  <p className="w-1/2 font-semibold">Notes:</p>
                  <textarea
                    name="notes"
                    onChange={handleNotes}
                    value={notes}
                    placeholder="Message/ref."
                    className="py-1 px-2 rounded-md outline-none border w-1/2"
                    required
                  />
                </label>

                <span className="flex items-start justify-end gap-3">
                  <input
                    onClick={(e) => handleReset(e)}
                    type="reset"
                    value="Reset"
                    className="bg-yellow-300 text-black py-2 px-4 rounded-md"
                  />
                  <button
                    className={`bg-green-500 py-2 px-4 rounded-md text-white hover:bg-green-600 cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    disabled={isLoading}
                  >
                    Add costing
                  </button>
                </span>
              </form>
            </div>
          </dialog>
        </div>


        {/*  */}
        <div className={`text-white rounded-md mt-1 ${isOpenDebt ? 'bg-gray-600' : ''}`}>
          <div
            className={`flex items-center justify-between cursor-pointer p-2 w-full hover:text-white gap-2 hover:bg-gray-600 mb-[1px] rounded-md ${isOpenExpense ? 'hover:bg-none' : ''}`}
            onClick={toggleDropdownDebt}
          >
            <div className="flex items-center gap-2">
              <FcCurrencyExchange className="text-xl" />
              <span>Debt</span>
            </div>
            <span>{isOpenExpense ? <FaAngleUp /> : <FaAngleDown />}</span>
          </div>
          {isOpenDebt && (
            (userName === "DEVELOPER" || userName === "ASAD1010" || userName === "ARIF1971") ?
              <div className="text-gray-200 rounded-md p-2">
                <NavLink
                  to="/debt"
                  className="block px-4 p-1 hover:bg-[#151515] rounded-md"
                >
                  Debt
                </NavLink>
                <NavLink
                  to="/lend"
                  className="block px-4 p-1 hover:bg-[#151515] rounded-md mt-1"
                >
                  Lend
                </NavLink>
              </div> : null
          )}
        </div>
        {/*  */}



        <div className=" animate__animated animate__backInDown mt-1">
          <NavLink
            to="/return"
            className="p-2 w-full hover:text-white flex items-center gap-2 hover:bg-[#151515] mb-[1px] rounded-md"
          >
            <FcLeft className="text-xl" />
            Return{" "}
          </NavLink>
        </div>

        {/* User */}
        <div className=" animate__animated animate__backInDown mt-1 flex mb-5 border rounded-md">
          <div className="w-10">
            <img
              className="rounded-l-md"
              title={userName}
              alt={userName}
              src={userName == 'ARIF2020' ? 'https://iili.io/2zUIE3G.jpg' : userName == 'DEVELOPER' ? 'https://iili.io/2BqJhuf.png' : userName == 'ASAD1010' ? 'https://iili.io/2zUIGaf.jpg' : userName == 'DEMO_USER' ? 'https://iili.io/2IoW4B1.png' : null} />
          </div>
          <button onClick={() => logOut()} className="bg-red-500 w-full rounded-r-md text-start pl-3 hover:bg-red-700 ">Log Out</button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
