import React, { useContext, useEffect, useState } from 'react';
import { CiSearch } from "react-icons/ci";
import { ContextData } from '../Provider';
import useAxiosSecure from '../Components/hooks/useAxiosSecure';

const CustomerScheduleDate = () => {

    const { reFetch, user, setItemsPerPage, currentPage, itemsPerPage, setCurrentPage } = useContext(ContextData);
    const [searchDate, setSearchDate] = useState("");
    const [dateCount, setDateCount] = useState({});
    const [scheduleDate, setScheduleDate] = useState([]);

    console.log(scheduleDate);



    // ----------------------------------------------------------------------------------------------------------
    useEffect(() => {
        setCurrentPage(1);
        setSearchDate("");
        return () => {
            setSearchDate("");
            setCurrentPage(1);
        };
    }, [setCurrentPage, setSearchDate]);


    // search input onchange---------------------------------------------------------------------------------------
    const handleInputChange = (event) => {
        setSearchDate(event.target.value);
        setCurrentPage(1); // reset to first page on new search
    };

    //---------------------------------------------------------------------------------------------------------
    const axiosSecure = useAxiosSecure();
    useEffect(() => {
        const fetchPaymentDate = async () => {
            const response = await axiosSecure.get(`/schedulePaymentDate`, {
                params: {
                    userEmail: user?.email,
                    search: searchDate,
                    page: currentPage,
                    size: itemsPerPage,
                },
            });
            setScheduleDate(response.data.result);
            setDateCount(response.data.count)
        };

        fetchPaymentDate();
    }, [reFetch, currentPage, itemsPerPage, axiosSecure, searchDate, user?.email]);

    // Pagination -----------------------------------------------------
    const totalItem = dateCount;
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

    return (
        <div className="mt-5 px-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <h2 className="text-2xl uppercase font-bold">Customer Payment Date:</h2>
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
                                <th className='w-[10%]'>Customer ID</th>
                                <th>Customer Name</th>
                                <th>Contact No.</th>
                                <th>Address</th>
                                <th>Payment Date</th>
                                <th className='w-[10%]'>Due amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* row 1 */}
                            {Array.isArray(scheduleDate) &&
                                scheduleDate.map((date) => (
                                    <tr key={date._id}>
                                        <td>{date.customerSerial}</td>
                                        <td>{date.customerName}</td>
                                        <td>{date.contactNumber}</td>
                                        <td>{date.customerAddress}</td>
                                        <td className='bg-red-200'>{date.scheduleDate}</td>
                                        <td>{date.dueAmount}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* pagination */}
            {dateCount && (
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

export default CustomerScheduleDate;