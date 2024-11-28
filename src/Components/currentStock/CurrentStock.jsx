import { useContext, useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { ContextData } from "../../Provider";
import useAxiosProtect from "../hooks/useAxiosProtect";
import excel from "../../assets/images/excel.png";
import pdf from "../../assets/images/pdf.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { FaRegEdit } from "react-icons/fa";
import useAxiosSecure from "../hooks/useAxiosSecure";

const CurrentStock = () => {
  const axiosProtect = useAxiosProtect();
  const axiosSecure = useAxiosSecure();
  const {
    user,
    stock,
    count,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    setSearchStock,
    searchStock,
    setStock,
    setCount,
    reFetch,
    setReFetch
  } = useContext(ContextData);

  const [downloadStock, setDownloadStock] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(null);
  const [productName, setProductName] = useState(null);
  const [productID, setProductID] = useState(null);
  const [confirmQuantity, setConfirmQuantity] = useState('');
  const [confirmPrice, setConfirmPrice] = useState('');


  useEffect(() => {
    axiosProtect
      .get(`/stockBalance`, {
        params: {
          userEmail: user?.email,
        },
      })
      .then((res) => {
        setDownloadStock(res.data.result);
      })
      .catch((err) => {
        toast.error(err);
      });
  }, [reFetch]);

  // __________________________________________________________________________
  useEffect(() => {
    // Reset search term and current page on component mount
    setSearchStock("");
    setCurrentPage(1);

    return () => {
      // Cleanup function to reset search term and current page on component unmount
      setSearchStock("");
      setCurrentPage(1);
    };
  }, [setSearchStock, setCurrentPage]);
  // __________________________________________________________________________

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
      })
      .catch((err) => {
        toast.error(err);
      });
  }, [reFetch, currentPage, itemsPerPage, searchStock]);

  // search input onchange
  const handleInputChange = (event) => {
    setSearchStock(event.target.value);
    setCurrentPage(1); // reset to first page on new search
  };

  // ...................................................................

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

  // ...................................................................
  const downloadExcel = () => {
    // Format the data to include only the desired columns
    const formattedData = downloadStock.map((stk) => ({
      "Product ID": stk.productID,
      "Product Name": stk.productTitle,
      Quantity: stk.purchaseQuantity,
      "Norm's": stk.reOrderQuantity,
      Price: stk.purchasePrice,
      Unit: stk.purchaseUnit,
      Brand: stk.brand,
      Category: stk.category,
      Storage: stk.storage,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stocks");
    XLSX.writeFile(workbook, "stocks.xlsx");
  };
  // ...................................................................
  const downloadPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "Product ID",
      "Product Name",
      "Quantity",
      "Unit",
      "Norm's",
      "Price",
    ];
    const tableRows = [];

    downloadStock.forEach((stk) => {
      const stockData = [
        stk.productID,
        stk.productTitle,
        parseFloat(stk.purchaseQuantity).toFixed(2),
        stk.purchaseUnit,
        parseFloat(stk.reOrderQuantity).toFixed(2),
        parseFloat(stk.purchasePrice).toFixed(2),
      ];
      tableRows.push(stockData);
    });

    doc.text("Stock Balance", 14, 15);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("stocks.pdf");
  };
  // ...................................................................
  const handleEditClick = (id) => {
    const selectedStock = stock.find((item) => item._id === id);
    setSelectedStockId(id);
    setProductName(selectedStock.productTitle);
    setProductID(selectedStock.productID);
    setConfirmQuantity(parseFloat(selectedStock.purchaseQuantity));
    setConfirmPrice(parseFloat(selectedStock.purchasePrice));
    document.getElementById("editStock").showModal();
  };
  // ...................................................................
  const changeQuantity = (event) => {
    const confirmStockQuantity = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(confirmStockQuantity)) {
      setConfirmQuantity(parseFloat(confirmStockQuantity));
    }
  };
  // ...................................................................
  const changePrice = (event) => {
    const confirmStockPrice = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(confirmStockPrice)) {
      setConfirmPrice(parseFloat(confirmStockPrice));
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    const selectedStock = stock.find((item) => item._id === selectedStockId);
    if (selectedStock) {
      setConfirmQuantity(parseFloat(selectedStock.purchaseQuantity));
      setConfirmPrice(parseFloat(selectedStock.purchasePrice));
    }

  };

  // Handle edit stock

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const response = await axiosSecure.put(`/updateStock/${selectedStockId}`, {
        purchaseQuantity: confirmQuantity,
        purchasePrice: confirmPrice,
      });

  
      if (response.status === 200) {
        toast.success("Stock updated successfully!");
        document.getElementById("editStock").close(); // Close modal
        setReFetch(!reFetch) // Trigger re-fetch of data
      } else {
        toast.error("Failed to update stock.");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update stock.");
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <div className="px-2">
      <div className="mt-5 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <h2 className="text-2xl">Current stock balance:</h2>
            <img
              src={excel}
              alt="Excel"
              className="w-[20px] h-[20%] cursor-pointer ml-5"
              onClick={downloadExcel}
            />
            <img
              src={pdf}
              alt="Pdf"
              className="w-[20px] h-[20%] cursor-pointer"
              onClick={downloadPDF}
            />
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
        <div>
          <div className="overflow-x-auto mt-5">
            <table className="table table-zebra">
              {/* head */}
              <thead>
                <tr className="border bg-green-200 text-black">
                  <th className="w-[10%]">Product ID</th>
                  <th>Product name</th>
                  <th className="w-[6%]">Quantity</th>
                  <th className="w-[8%]">Unit</th>
                  <th className="w-[15%] text-center">Category</th>
                  <th className="w-[8%]">Brand</th>
                  <th className="w-[5%]">Purchase Price</th>
                  <th className="w-[6%]">Storage</th>
                  <th className="">Action</th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                {stock &&
                  stock.map((stock) => (
                    <tr
                      key={stock._id}
                      className={`${stock.purchaseQuantity <= stock.reOrderQuantity
                        ? "bg-yellow-100"
                        : ""
                        }`}
                    >
                      <td>{stock.productID}</td>
                      <td>{stock.productTitle}</td>
                      <td className="text-center">
                        {parseFloat(stock.purchaseQuantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td>{stock.purchaseUnit}</td>
                      <td className="text-center">{stock.category}</td>
                      <td className="text-center">{stock.brand}</td>
                      <td className="text-center">
                        {parseFloat(stock.purchasePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="text-center">{stock.storage}</td>
                      <td className="text-center">
                        <FaRegEdit className="text-xl cursor-pointer text-red-600" onClick={() => handleEditClick(stock._id)} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
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

      <dialog id="editStock" className="modal">
        <div className="modal-box">
          <h3 className="font-bold mb-3 uppercase">Updating: {productName}</h3>
          <hr />
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
              ✕
            </button>
          </form>
          <form onSubmit={handleEdit} className="mt-5 space-y-5">
            <label className="flex items-center">
              <p className="w-1/2 font-semibold">Product ID</p>{" "}
              <input
                type="text"
                name="product_id"
                placeholder="Amount"
                defaultValue={productID}
                readOnly
                className="py-1 px-2 rounded-md outline-none border w-1/2"
                required
              />
            </label>

            <label className="flex items-center">
              <p className="w-1/2 font-semibold">Update Quantity</p>
              <input
                type="text"
                name="confirm_amount"
                placeholder="Confirm Quantity"
                value={confirmQuantity}
                onChange={changeQuantity}
                className="py-1 px-2 rounded-md outline-none border w-1/2"
                required
              />
            </label>
            <label className="flex items-center">
              <p className="w-1/2 font-semibold">Update Price</p>
              <input
                type="text"
                name="confirm_amount"
                placeholder="Confirm Price"
                value={confirmPrice}
                onChange={changePrice}
                className="py-1 px-2 rounded-md outline-none border w-1/2"
                required
              />
            </label>

            <span className="flex items-start justify-end gap-3">
              <input
                onClick={(e) => handleReset(e)}
                type="reset"
                value="Reset"
                className="bg-yellow-300 py-2 px-4 rounded-md"
              />

              <button
                className={`bg-green-500 py-2 px-4 rounded-md text-white hover:bg-green-600 cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                disabled={isLoading}
              >
                Update
              </button>
            </span>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default CurrentStock;
