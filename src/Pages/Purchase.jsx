import { Link } from "react-router-dom";
import AddProduct from "../Components/AddProduct/AddProduct";
import AddSupplier from "../Components/AddSupplier/AddSupplier";
import { useContext, useEffect, useState } from "react";
import { ContextData } from "../Provider";
import { toast } from "react-toastify";
import { IoEyeOutline } from "react-icons/io5";
import useAxiosSecure from "../Components/hooks/useAxiosSecure";
import useAxiosProtect from "../Components/hooks/useAxiosProtect";

const Purchase = () => {
  const axiosSecure = useAxiosSecure();
  const axiosProtect = useAxiosProtect();
  const { reFetch, setItemsPerPage, user } = useContext(ContextData);
  const [invoice, setInvoice] = useState([]);
  const [count, setCount] = useState({});
  const [itemsPerPage, setItemsPerPages] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    axiosProtect.get('/invoices', {
      params: {
        userEmail: user?.email,
        page: currentPage,
        size: itemsPerPage,
        search: searchTerm,
      },
    })
      .then(res => {
        setInvoice(res.data.result);
        setCount(res.data.count);
      }).catch(err => {
        toast.error('Server error', err);
      });

  }, [reFetch, currentPage, itemsPerPage, searchTerm, axiosProtect]);


  useEffect(() => {
    axiosSecure
      .get("/purchaseInvoiceCount")
      .then((res) => {
        setCount(res.data.count);
      })
      .catch((err) => {
        toast.error("Server error", err);
      });
  }, [reFetch]);

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
        pageNumbers.push('...', totalPages);
      } else if (currentPage > totalPages - halfMaxPagesToShow) {
        pageNumbers.push(1, '...');
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1, '...');
        for (let i = currentPage - halfMaxPagesToShow; i <= currentPage + halfMaxPagesToShow; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...', totalPages);
      }
    }

    return pageNumbers;
  };



  const handleItemsPerPage = (e) => {
    const val = parseInt(e.target.value);
    setItemsPerPages(val);
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

  // View invoice details

  const viewInvoice = (invoiceNumber) => {
    window.open(`/purchaseInvoice/${invoiceNumber}`, '_blank');
  };

  return (
    <div className="px-2">
      <div className="flex gap-5 justify-between">
        <Link
          to="/newPurchase"
          className="border py-2 px-10 font-semibold shadow rounded-md w-auto flex items-center gap-2 text-xl bg-green-600 text-white cursor-pointer"
        >
          <span>+ New Purchase</span>
        </Link>

        <div className="flex gap-2">
          <div className="border shadow rounded-md w-auto items-center bg-[#48514C]">
            <AddProduct />
          </div>

          <div className="border shadow rounded-md w-auto flex items-center bg-[#48514C] ">
            <AddSupplier />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center py-2">
        <h2 className="py-2 text-xl uppercase font-bold">Recent purchase history</h2>
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

      {/* load data */}
      <div>
        <div className="overflow-x-auto pb-5">
          <table className="table">
            {/* head */}
            <thead>
              <tr className="border bg-green-200 text-black">
                <th className="w-[10%]">Date</th>
                <th className="w-[12%]">Billing No</th>
                <th>Supplier name</th>
                <th className="w-[10%]">Invoice Amount</th>
                <th className="w-[10%]">Paid Amount</th>
                <th className="w-[10%]">Due Amount</th>
                <th className="w-[10%]">User</th>
                <th className="">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {Array.isArray(invoice) &&
                invoice.map(invoice =>
                  <tr key={invoice._id} className={`
                    ${invoice.userName == 'ARIF2020' ? 'bg-cyan-100' :
                      invoice.userName == 'ASAD1010' ? 'bg-slate-300' : ''}
                    ${invoice.dueAmount > 0 ? 'text-red-500' : ''}
                    `}>
                    <td>{invoice.date}</td>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{invoice.supplierName}</td>
                    <td>{parseFloat(invoice.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{parseFloat(invoice.finalPayAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{parseFloat(invoice.dueAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{invoice.userName}</td>
                    <td className="text-center w-[8%]"> <IoEyeOutline onClick={() => viewInvoice(invoice.invoiceNumber)} className="text-xl cursor-pointer" /></td>

                  </tr>
                )
              }

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
              onClick={() => typeof page === 'number' && handlePageClick(page)}
              className={`py-2 px-5 bg-green-500 text-white rounded-md hover:bg-gray-600 ${currentPage === page ? "!bg-gray-600" : ""
                }`}
              disabled={typeof page !== 'number'}
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

export default Purchase;
