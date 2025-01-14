import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../Provider';
import AddCosting from '../AddCosting/AddCosting';
import useAxiosProtect from '../hooks/useAxiosProtect';

const ExpenseList = () => {

    const { reFetch, user } = useContext(ContextData);

    const axiosProtect = useAxiosProtect();

    const [count, setCount] = useState('');
    const [transaction, setTransaction] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    // show transactions
    useEffect(() => {
        axiosProtect
            .get(`/costingTransactions`, {
                params: {
                    userEmail: user?.email,
                    page: currentPage,
                    size: itemsPerPage,
                    search: searchTerm,
                },
            })
            .then((res) => {
                setTransaction(res.data.result);
                setCount(res.data.count);
            });
    }, [reFetch, currentPage, itemsPerPage, searchTerm, axiosProtect]);

// console.log(transaction.length);

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
        <div className="px-2">
            <div className="pb-5">
                <div className="sticky top-0 z-50 bg-white ">
                    <div className="flex justify-between items-center py-2">
                        <h2 className="py-2 text-xl uppercase font-bold">
                            Recent Expense List
                        </h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="transaction_search"
                                placeholder="search"
                                onChange={handleInputChange}
                                size={10}
                                className="px-2 border outline-none border-gray-500 rounded-md"
                            />
                            {/* <AddBalance /> */}
                            <AddCosting />
                        </div>
                    </div>

                    <table className="table table-zebra">
                        {/* head */}
                        <thead>
                            <tr className="border bg-green-200 text-black">
                                <th className="w-[10%]">Serial No</th>
                                <th className="w-[15%]">Date</th>
                                <th>Description</th>
                                <th className="w-[15%]">Amount</th>
                                <th className="w-[10%]">Type</th>
                                <th className="w-[12%]">User</th>
                            </tr>
                        </thead>
                    </table>
                </div>

                {/* show latest transactions in table */}
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        {/* head */}
                        <thead className="hidden">
                            <tr className="border bg-green-200 text-black">
                                <th className="w-[10%]">Serial No</th>
                                <th className="w-[15%]">Date</th>
                                <th>Description</th>
                                <th className="w-[15%]">Amount</th>
                                <th className="w-[10%]">Type</th>
                                <th className="w-[12%]">User</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* row 1 */}
                            {Array.isArray(transaction) && transaction.length >= 0 ? (
                                transaction.map((tran, i) => (
                                    <tr
                                        key={tran._id}
                                    >
                                        <td className="w-[10%] text-center">{tran.serial}</td>
                                        <td className="w-[15%]">{tran.date}</td>
                                        <td>{tran.note}</td>
                                        <td className="w-[15%]">
                                            {" "}
                                            {parseFloat(tran.totalBalance).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            })}
                                        </td>
                                        <td className="w-[10%]">{tran.type}</td>
                                        <td className="w-[12%]">{tran.userName}</td>
                                    </tr>
                                ))
                            ) : (
                                <p>No recent transaction</p>
                            )}
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
                        <option value="50">100</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default ExpenseList;