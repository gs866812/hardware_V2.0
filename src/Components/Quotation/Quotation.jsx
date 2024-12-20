import React, { useContext, useEffect, useState } from "react";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { ContextData } from "../../Provider";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { IoEyeOutline } from "react-icons/io5";
import useAxiosProtect from "../hooks/useAxiosProtect";

const Quotation = () => {
  const axiosSecure = useAxiosSecure();
  const axiosProtect = useAxiosProtect();
  const { reFetch, productCount, user } = useContext(ContextData);
  const [invoice, setInvoice] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [count, setCount] = useState({});
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    axiosProtect
      .get("/quotationInvoice", {
        params: {
          userEmail: user?.email,
          page: currentPage,
          size: itemsPerPage,
          search: searchTerm,
        },
      })
      .then((res) => {
        setInvoice(res.data.result);
        setCount(res.data.count);
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  }, [reFetch, currentPage, itemsPerPage, searchTerm, axiosProtect]);

  useEffect(() => {
    axiosSecure
      .get("/salesInvoiceCount")
      .then((res) => {
        setCount(res.data.count);
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  }, [reFetch]);

  // Pagination
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

  // View quotation

  const viewInvoice = (id) => {
    window.open(`/quotation/${id}`, "_blank");
  };

  return (
    <div className="px-2">
      <div className="flex gap-5 justify-between">
        <Link
          to="/newQuotation"
          onClick={() => setItemsPerPage(productCount)}
          className="border py-2 px-10 font-semibold shadow rounded-md w-auto flex items-center gap-2 text-xl bg-green-600 text-white cursor-pointer"
        >
          <span>+ New Quotation</span>
        </Link>
      </div>
      {/* .............................................................. */}
      <div className="flex justify-between items-center py-2">
        <h2 className="py-2 text-xl uppercase font-bold">Recent customer quotation:</h2>
        <div className="flex gap-2">
          <input
            type="text"
            name="purchase_search"
            onChange={handleInputChange}
            placeholder="search"
            size={10}
            className="px-2 py-1 border outline-none border-gray-500 rounded-md"
          />
        </div>
      </div>
      {/* ..................................................................... */}
      {/* load data */}
      <div className="pb-5">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            {/* head */}
            <thead>
              <tr className="border bg-green-200 text-black">
                <th className="w-[10%]">Date</th>
                <th>Customer Name</th>
                <th>Contact</th>
                <th className="w-[10%]">Amount</th>
                <th className="w-[10%]">User</th>
                <th className="">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {Array.isArray(invoice) &&
                invoice.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>{invoice.date}</td>
                    <td>{invoice.customerName}</td>
                    <td>{invoice.contactNumber}</td>
                    <td>{parseFloat(invoice.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{invoice.userName}</td>
                    <td className="text-center w-[8%]">
                      {" "}
                      <IoEyeOutline
                        onClick={() => viewInvoice(invoice._id)}
                        className="text-xl cursor-pointer"
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
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default Quotation;
