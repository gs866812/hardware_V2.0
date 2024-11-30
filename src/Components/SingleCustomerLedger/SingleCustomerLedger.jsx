import React, { useContext, useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { ContextData } from "../../Provider";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import moment from "moment";
import { toast } from "react-toastify";
import useAxiosProtect from "../hooks/useAxiosProtect";
import { IoEyeOutline } from "react-icons/io5";

const SingleCustomerLedger = () => {
  const [singleCustomer, setSingleCustomer] = useState([]);
  const axiosSecure = useAxiosSecure();
  const axiosProtect = useAxiosProtect();
  const { reFetch, setReFetch, userName, user } = useContext(ContextData);
  const [filteredSalesHistory, setFilteredSalesHistory] = useState([]);
  const [payAmount, setPayAmount] = useState("");
  const [confirmAmount, setConfirmAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("");

  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const id = pathParts[pathParts.length - 1]; // Get the last part of the pathname

  // search input onchange
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // reset to first page on new search
  };

  //
  useEffect(() => {
    const fetchCustomerData = async () => {
      const response = await axiosProtect.get(`/singleCustomer/${id}`, {
        params: {
          userEmail: user?.email,
          searchTerm,
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      setSingleCustomer(response.data);
      setFilteredSalesHistory(response.data.paginatedSalesHistory || []);
    };

    fetchCustomerData();
  }, [reFetch, searchTerm, currentPage, itemsPerPage]);
  //

  const totalPaid = singleCustomer?.paymentHistory?.reduce(
    (acc, item) => acc + item.paidAmount,
    0
  );

  const handlePayAmount = (event) => {
    const payValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(payValue)) {
      setPayAmount(payValue);
    }
  };

  const handleConfirmAmount = (event) => {
    const payValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(payValue)) {
      setConfirmAmount(payValue);
    }
  };

  const handleReset = () => {
    setPayAmount("");
    setNote("");
    setMethod("");
    setConfirmAmount("");
  };
  // handle rcv by account
  const handleReceivedByAccount = () => {
    document.getElementById("payDueByAccount").showModal()
  };
  // handle payment account
  const handlePaymentAccount = (e) => {
    e.preventDefault();
    const form = e.target;
    if (isLoading) return;

    setIsLoading(true); // Set loading to true
    const date = moment(new Date()).format("DD.MM.YYYY");
    const paidAmount = parseFloat(payAmount);
    const paymentMethod = "Paid by Account";
    const payNote = note;

    const paymentInfo = { date, paidAmount, paymentMethod, payNote, userName };
    if (paidAmount > singleCustomer.dueAmount) {
      setIsLoading(false); // Reset loading state
      return toast.error("Can't over payment");
    };

    if (singleCustomer.acBalance < paidAmount) {
      setIsLoading(false); // Reset loading state
      return toast.error("No available balance");
    };



    axiosSecure
      .post(`/payCustomerByAccount/${id}`, paymentInfo)
      .then((res) => {
        const modal = document.querySelector(`#payDueByAccount`);
        modal.close();
        if (res.data === "success") {
          handleReset();
          setMethod("");
          setNote("");
          form.reset();
          setReFetch(!reFetch);
          Swal.fire({
            title: "Payment success",
            icon: "success",
          });
        }
      })
      .catch((err) => {
        toast.error("Server error", err);
      })
      .finally(() => {
        setIsLoading(false); // Reset loading state
      });
  };
  //   ...............................
  const handlePayment = (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true); // Set loading to true
    const date = moment(new Date()).format("DD.MM.YYYY");
    const form = e.target;
    const paidAmount = parseFloat(payAmount);
    const paymentMethod = method;
    const payNote = note;

    const paymentInfo = { date, paidAmount, paymentMethod, payNote, userName };
    if (paidAmount > singleCustomer.dueAmount) {
      setIsLoading(false); // Reset loading state
      return toast.error("Can't over payment");
    }

    axiosSecure
      .post(`/payCustomer/${id}`, paymentInfo)
      .then((res) => {
        const modal = document.querySelector(`#payDue`);
        modal.close();
        if (res.data === "success") {
          handleReset();
          setMethod("");
          setNote("");
          form.reset();
          setReFetch(!reFetch);
          Swal.fire({
            title: "Payment success",
            icon: "success",
          });
        }
      })
      .catch((err) => {
        toast.error("Server error", err);
      })
      .finally(() => {
        setIsLoading(false); // Reset loading state
      });
  };

  // Pagination
  const generatePaginationButtons = () => {
    const totalPages = singleCustomer.totalPages;
    const buttons = [];
    const maxButtons = 5; // Maximum number of buttons to show at a time

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button
          key="1"
          onClick={() => setCurrentPage(1)}
          className={`btn ${currentPage === 1 ? "btn-active" : ""}`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis-start" className="btn mx-1">
            ...
          </span>
        );
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`btn ${currentPage === page ? "btn-active" : ""} mr-1`}
        >
          {page}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis-end" className="btn mx-1">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`btn ${currentPage === totalPages ? "btn-active" : ""}`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value));
    setCurrentPage(1); // reset to first page on items per page change
  };

  // View invoice details

  const viewInvoice = (invoiceNumber) => {
    window.open(`/salesInvoice/${invoiceNumber}`, "_blank");
  };


  const handleCustomerBalance = (e) => {
    e.preventDefault();
    const form = e.target;
    const date = moment(new Date()).format("DD.MM.YYYY");
    const receiveAmount = parseFloat(payAmount);
    const receiveConfirmAmount = parseFloat(confirmAmount);
    const paymentMethod = method;
    const receiveNote = note;
    const receivedInfo = { date, receiveAmount, receiveConfirmAmount, paymentMethod, receiveNote, userName };

    if (receiveAmount != receiveConfirmAmount) {
      setIsLoading(false);
      return toast.error("Amount do not match");
    }

    axiosSecure.post(`/receiveCustomerBalance/${id}`, receivedInfo)
      .then((res) => {
        const modal = document.querySelector(`#addCustomerBalance`);
        modal.close();
        if (res.data == "success") {
          handleReset();
          setMethod("");
          setNote('');
          setConfirmAmount('');
          form.reset();
          setReFetch(!reFetch);
          Swal.fire({
            title: "Balance added successfully",
            icon: "success",
          });
        }
      }).catch((error) => {
        toast.error("Server error", error);
      }).finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="px-2">
      <h2 className="text-2xl my-5 pl-2 uppercase font-bold">
        Customer Ledger Details:
      </h2>
      <div className="flex gap-2 mt-4">
        <div className="w-1/2">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <tbody>
                <tr>
                  <th>Customer Name:</th>
                  <td>
                    {singleCustomer.customerName} -{" "}
                    <span className="border p-1 rounded-full">
                      {singleCustomer.customerSerial}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Address:</th>
                  <td>{singleCustomer.customerAddress}</td>
                </tr>
                <tr>
                  <th>Mobile:</th>
                  <td>{singleCustomer.contactNumber}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-1/2">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <tbody>
                {
                  singleCustomer?.acBalance ?
                    <tr>
                      <th className="w-[35%]">Customer Balance:</th>
                      <td className="relative">
                        BDT: {parseFloat(singleCustomer?.acBalance).toFixed(2) || 0}
                        <button onClick={() =>
                          document.getElementById("addCustomerBalance").showModal()} className="absolute bg-green-300 py-3 px-2 right-0 top-0 border-l border-gray-500">Add Balance</button>
                      </td>

                      <td className="!p-0">
                        {singleCustomer?.acBalance > 0 ? (
                          <button
                            onClick={handleReceivedByAccount}
                            className="w-full py-3 text-center bg-yellow-500 text-white"
                          >
                            Received
                          </button>
                        ) : (
                          <button
                            onClick={handleReceivedByAccount}
                            className="w-full py-3 text-center bg-gray-500 text-white"
                            disabled
                          >
                            Received
                          </button>
                        )}
                      </td>
                    </tr> : null
                }

                <tr>
                  <th>Total Due:</th>
                  <td>
                    BDT: {parseFloat(singleCustomer.dueAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="!p-0">
                    {singleCustomer.dueAmount > 0 ? (
                      <button
                        onClick={() =>
                          document.getElementById("payDue").showModal()
                        }
                        className="w-full py-3 text-center bg-green-500 text-white"
                      >
                        Received
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          document.getElementById("payDue").showModal()
                        }
                        className="w-full py-3 text-center bg-gray-500 text-white"
                        disabled
                      >
                        Received
                      </button>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Total Paid:</th>
                  <td>BDT: {parseFloat(totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}</td>
                  <td
                    onClick={() =>
                      document.getElementById("paymentHistory").showModal()
                    }
                    className="w-10 text-center bg-blue-500 text-white cursor-pointer"
                  >
                    History
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <h2 className="py-2 text-xl uppercase font-bold">
          Sales Invoice History
        </h2>
        <h2 className="text-xl">Schedule Payment Date: <span className="text-red-600">{singleCustomer.scheduleDate}</span></h2>
        <div className="flex gap-2">
          <input
            type="text"
            name="purchase_search"
            onChange={handleInputChange}
            placeholder="search"
            size={10}
            className="px-2 py-1 border outline-none border-gray-500 rounded-md"
          />

          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="px-2 py-1 border outline-none border-gray-500 rounded-md"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto my-5">
        <table className="table table-zebra">
          {/* head */}
          <thead>
            <tr className="bg-blue-400 text-white uppercase">
              <th>Date</th>
              <th>Invoice Number</th>
              <th>Invoice Amount</th>
              <th>Paid Amount</th>
              <th>Due Amount</th>
              <th className="w-[12%]">User</th>
              <th className="">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* row 1 */}
            {filteredSalesHistory &&
              filteredSalesHistory.map((sale) => (
                <tr key={sale.invoiceNumber}>
                  <td>{sale.date}</td>
                  <td>{sale.invoiceNumber}</td>
                  <td>BDT: {parseFloat(sale.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>BDT: {parseFloat(sale.finalPayAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>BDT: {parseFloat(sale.dueAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>{sale.userName}</td>
                  <td className="text-center w-[8%]">
                    {" "}
                    <IoEyeOutline
                      onClick={() => viewInvoice(sale.invoiceNumber)}
                      className="text-xl cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {/* Pagination */}
        {filteredSalesHistory && (
          <div className="flex justify-center mt-4">
            <div className="btn-group">
              <button
                className="btn mr-1"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              {generatePaginationButtons()}
              <button
                className="btn ml-1"
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, singleCustomer.totalPages)
                  )
                }
                disabled={currentPage === singleCustomer.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {/* add customer balance */}
      <div>
        <dialog id="addCustomerBalance" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-3 uppercase">
              Customer Balance:
            </h3>
            <hr />
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                ✕
              </button>
            </form>
            <form onSubmit={handleCustomerBalance} className="mt-5 space-y-3">
              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Amount:</p>{" "}
                <input
                  type="text"
                  name="receive_amount"
                  placeholder="Receive amount"
                  onChange={handlePayAmount}
                  value={payAmount}
                  className="py-1 px-2 rounded-md outline-none border w-full"
                  required
                />
              </label>

              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Confirm Amount:</p>{" "}
                <input
                  type="text"
                  name="confirm_amount"
                  placeholder="Confirm Amount"
                  onChange={handleConfirmAmount}
                  value={confirmAmount}
                  className="py-1 px-2 rounded-md outline-none border w-full "
                  required
                />
              </label>

              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Method:</p>{" "}
                <input
                  type="text"
                  name="payment_method"
                  placeholder="Payment method"
                  onChange={(event) => setMethod(event.target.value)}
                  className="py-1 px-2 rounded-md outline-none border w-full"
                  required
                />
              </label>

              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Note:</p>{" "}
                <input
                  type="text"
                  name="receive_note"
                  placeholder="Receive Note"
                  onChange={(event) => setNote(event.target.value)}
                  className="py-1 px-2 rounded-md outline-none border w-full"
                  required
                />
              </label>

              <span className="flex items-start justify-end gap-3">
                <input
                  onClick={() => handleReset()}
                  type="reset"
                  value="Reset"
                  className="bg-yellow-300 py-2 px-4 rounded-md"
                />
                <button
                  className={`bg-green-500 py-2 px-4 rounded-md text-white hover:bg-green-600 cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  disabled={isLoading}
                >
                  Add Balance
                </button>
              </span>
            </form>
          </div>
        </dialog>
      </div>

      {/* pay by account  modal */}
      <div>
        <dialog id="payDueByAccount" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-3 uppercase">
              Customer payment:
            </h3>
            <hr />
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                ✕
              </button>
            </form>
            <form onSubmit={handlePaymentAccount} className="mt-5 space-y-3">
              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Pay amount:</p>{" "}
                <input
                  type="text"
                  name="pay_amount"
                  placeholder="Pay amount"
                  onChange={handlePayAmount}
                  value={payAmount}
                  className="py-1 px-2 rounded-md outline-none border w-full"
                  required
                />
              </label>

              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Method:</p>{" "}
                <input
                  type="text"
                  name="payment_method"
                  placeholder="Paid by Account"
                  defaultValue="Paid by Account"
                  readOnly
                  className="py-1 px-2 rounded-md outline-none border w-full bg-red-200"
                  required
                />
              </label>

              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Note:</p>{" "}
                <input
                  type="text"
                  name="pay_note"
                  placeholder="Note"
                  onChange={(event) => setNote(event.target.value)}
                  className="py-1 px-2 rounded-md outline-none border w-full"
                  required
                />
              </label>

              <span className="flex items-start justify-end gap-3">
                <input
                  onClick={() => handleReset()}
                  type="reset"
                  value="Reset"
                  className="bg-yellow-300 py-2 px-4 rounded-md"
                />
                <button
                  className={`bg-green-500 py-2 px-4 rounded-md text-white hover:bg-green-600 cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  disabled={isLoading}
                >
                  PAY
                </button>
              </span>
            </form>
          </div>
        </dialog>
      </div>

      {/* pay  modal */}
      <div>
        <dialog id="payDue" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-3 uppercase">
              Customer payment:
            </h3>
            <hr />
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                ✕
              </button>
            </form>
            <form onSubmit={handlePayment} className="mt-5 space-y-3">
              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Pay amount:</p>{" "}
                <input
                  type="text"
                  name="pay_amount"
                  placeholder="Pay amount"
                  onChange={handlePayAmount}
                  value={payAmount}
                  className="py-1 px-2 rounded-md outline-none border w-full"
                  required
                />
              </label>

              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Method:</p>{" "}
                <input
                  type="text"
                  name="payment_method"
                  placeholder="Payment method"
                  onChange={(event) => setMethod(event.target.value)}
                  className="py-1 px-2 rounded-md outline-none border w-full"
                  required
                />
              </label>

              <label className="flex items-center">
                <p className="w-1/2 font-semibold">Note:</p>{" "}
                <input
                  type="text"
                  name="pay_note"
                  placeholder="Note"
                  onChange={(event) => setNote(event.target.value)}
                  className="py-1 px-2 rounded-md outline-none border w-full"
                  required
                />
              </label>

              <span className="flex items-start justify-end gap-3">
                <input
                  onClick={() => handleReset()}
                  type="reset"
                  value="Reset"
                  className="bg-yellow-300 py-2 px-4 rounded-md"
                />
                <button
                  className={`bg-green-500 py-2 px-4 rounded-md text-white hover:bg-green-600 cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  disabled={isLoading}
                >
                  PAY
                </button>
              </span>
            </form>
          </div>
        </dialog>
      </div>

      <div>
        <dialog id="paymentHistory" className="modal">
          <div className="modal-box w-2/4 max-w-5xl">
            <h3 className="font-bold text-lg mb-3 uppercase">
              Payment history:
            </h3>
            <hr />
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                ✕
              </button>
            </form>
            <div className="overflow-x-auto mt-5">
              <table className="table table-zebra">
                {/* head */}
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Note</th>
                    <th>Amount</th>
                    <th>Pay method</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {/* row 1 */}
                  {singleCustomer.paymentHistory &&
                    Array.isArray(singleCustomer.paymentHistory) &&
                    singleCustomer.paymentHistory
                      .slice()
                      .reverse()
                      .map((payment, i) => (
                        <tr key={i}>
                          <td>{payment.date}</td>
                          <td>{payment.payNote}</td>
                          <td>
                            BDT: {parseFloat(payment.paidAmount).toFixed(2)}
                          </td>
                          <td>{payment.paymentMethod}</td>
                          <td>{payment.userName}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default SingleCustomerLedger;
