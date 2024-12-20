import React, { useContext, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { FaFileExcel, FaRegFileExcel } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { ContextData } from "../../Provider";
import useAxiosProtect from "../hooks/useAxiosProtect";
import * as XLSX from "xlsx";


const CustomerLedger = () => {
  const axiosSecure = useAxiosSecure();
  const axiosProtect = useAxiosProtect();
  const { reFetch, tokenReady, user } = useContext(ContextData);

  const [allCustomer, setAllCustomer] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [count, setCount] = useState({});
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // get customer due list
  useEffect(() => {
    axiosProtect
      .get(`/customerLedger`, {
        params: {
          userEmail: user?.email,
          page: currentPage,
          size: itemsPerPage,
          search: searchTerm,
        },
      })
      .then((data) => {
        setCustomer(data.data.result);
        setCount(data.data.count);
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  }, [reFetch, currentPage, itemsPerPage, searchTerm, axiosProtect]);

  // const navigate = useNavigate();

  // const handleCustomerLedger = (id) => {
  //   navigate(`/customerLedger/id/${id}`);
  // };

  const handleCustomerLedger = (id) => {
    window.open(`/customerLedger/id/${id}`, "_blank"); // Open in a new tab
  };

  // .............................................................
  useEffect(() => {
    axiosSecure
      .get("/singleCustomerCount")
      .then((res) => {
        setCount(res.data.count);
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  }, [reFetch]);

  // Make excel
  // Get all lender for excel
  useEffect(() => {
    if (tokenReady && user?.email) {
      axiosProtect
        .get(`/allCustomer`, {
          params: {
            userEmail: user?.email,
          },
        })
        .then((data) => {
          setAllCustomer(data.data);
        })
        .catch((err) => {
          toast.error("Server error", err);
        });
    }

  }, [reFetch, tokenReady, axiosProtect, user?.email]);
  const downloadExcel = () => {
    // Format the data to include only the desired columns
    const formattedData = allCustomer.map((customer) => ({
      "Customer ID": customer.customerSerial,
      "Customer Name": customer.customerName,
      "Contact No": customer.contactNumber,
      "Address ": customer.customerAddress,
      "Due amount ": customer.dueAmount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Due List");
    XLSX.writeFile(workbook, "customerDueList.xlsx");
  };
  const downloadExcelCurrent = () => {
    // Format the data to include only the desired columns
    const formattedData = customer.map((customer) => ({
      "Customer ID": customer.customerSerial,
      "Customer Name": customer.customerName,
      "Contact No": customer.contactNumber,
      "Address ": customer.customerAddress,
      "Due amount ": customer.dueAmount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Due List");
    XLSX.writeFile(workbook, "customerDueList.xlsx");
  };

  // Pagination
  const totalItem = count;
  const numberOfPages = Math.ceil(totalItem / itemsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Maximum number of page buttons to show
    const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);
    const totalPages = numberOfPages;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= halfMaxPagesToShow) {
        for (let i = 1; i <= maxPagesToShow; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...", totalPages);
      } else if (currentPage > totalPages - halfMaxPagesToShow) {
        pageNumbers.push(1, "...");
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1, "...");
        for (
          let i = currentPage - halfMaxPagesToShow;
          i <= currentPage + halfMaxPagesToShow;
          i++
        ) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...", totalPages);
      }
    }

    return pageNumbers;
  };

  const handleItemsPerPage = (e) => {
    const val = parseInt(e.target.value);
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numberOfPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
    // any other logic to handle page change
  };

  // search input onchange
  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // reset to first page on new search
  };

  return (
    <div className="mt-5 px-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-2xl uppercase font-bold">Customer ledger</h2>
          <FaFileExcel className="w-[20px] h-[20%] cursor-pointer ml-5 text-red-600" title="Download full list" onClick={downloadExcel} />
          <FaRegFileExcel className="w-[20px] h-[20%] cursor-pointer text-green-600" title="Download current list" onClick={downloadExcelCurrent} />

        </div>
        <label className="flex gap-1 items-center border py-1 px-3 rounded-md">
          <input
            onChange={handleInputChange}
            type="text"
            name="search"
            placeholder="Search"
            className=" hover:outline-none outline-none"
            size="13"
          />
          <CiSearch />
        </label>
      </div>

      {/* table */}

      <div>
        <div className="overflow-x-auto mt-5 pb-5">
          <table className="table table-zebra">
            {/* head */}
            <thead>
              <tr className="border bg-green-200 text-black">
                <th>Customer ID</th>
                <th>Customer Name</th>
                <th>Address</th>
                <th>Contact No.</th>
                <th>Due amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {Array.isArray(customer) &&
                customer.map((customer) => (
                  <tr key={customer._id}>
                    <td>{customer.customerSerial}</td>
                    <td>{customer.customerName}</td>
                    <td>{customer.customerAddress}</td>
                    <td>{customer.contactNumber}</td>
                    <td>
                      {customer.dueAmount > 0
                        ? <span>BDT: {parseFloat(customer.dueAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        : null}
                    </td>
                    <td className="text-center">
                      {" "}
                      <IoEyeOutline
                        onClick={() =>
                          handleCustomerLedger(customer.customerSerial)
                        }
                        className="text-xl cursor-pointer hover:text-yellow-500"
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}

      {count > 10 && (
        <div className="my-8 flex justify-center gap-1">
          <button
            onClick={handlePrevPage}
            className="py-2 px-3 bg-green-500 text-white rounded-md hover:bg-gray-600"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {renderPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && handlePageClick(page)}
              className={`py-2 px-5 bg-green-500 text-white rounded-md hover:bg-gray-600 ${currentPage === page ? "!bg-gray-600" : ""
                }`}
              disabled={typeof page !== "number"}
            >
              {page}
            </button>
          ))}
          <button
            onClick={handleNextPage}
            className="py-2 px-3 bg-green-500 text-white rounded-md hover:bg-gray-600"
            disabled={currentPage === numberOfPages}
          >
            Next
          </button>

          <select
            value={itemsPerPage}
            onChange={handleItemsPerPage}
            name=""
            id=""
            className="py-2 px-1 rounded-md bg-green-500 text-white outline-none"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default CustomerLedger;
