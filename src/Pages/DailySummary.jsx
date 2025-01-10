import React, { useContext, useEffect, useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import useAxiosProtect from '../Components/hooks/useAxiosProtect';
import { ContextData } from '../Provider';
import { toast } from 'react-toastify';

const DailySummary = () => {

    const axiosProtect = useAxiosProtect();
    const { user, tokenReady, reFetch, itemsPerPage, setReFetch } = useContext(ContextData);

    const [searchSummary, setSearchSummary] = useState("");
    const [summary, setSummary] = useState([]);
    const [summaryCount, setSummaryCount] = useState({});
    const [currentPage, setCurrentPage] = useState(1);



    // ************************************************************************************************
    const handleInputChange = (event) => {
        setSearchSummary(event.target.value);
        setCurrentPage(1);
    };
    // ************************************************************************************************
    useEffect(() => {
        // Add a check to avoid unnecessary API calls if data already exists
        if (tokenReady && user?.email) {
            axiosProtect
                .get("/getDailySummary", {
                    params: {
                        userEmail: user.email, // Ensure email is sent with the request
                        page: currentPage,
                        size: itemsPerPage,
                        search: searchSummary,
                    },
                })
                .then((data) => {
                    setSummary(data.data.result);
                    setSummaryCount(data.data.count);
                })
                .catch((err) => {
                    toast("Error fetching data", err);
                });
        }
    }, [reFetch, currentPage, itemsPerPage, searchSummary, axiosProtect, tokenReady, user?.email]);
    // ************************************************************************************************
    return (
        <div className="py-0 px-2">
            <div className="mt-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl uppercase font-bold">Daily Summary:</h2>
                    <div className="flex gap-2">
                        <label className="flex gap-1 items-center border py-1 px-3 rounded-md border-gray-500">
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
                </div>
            </div>
            {/* ****************************Table start****************************************************** */}
            <div className='mt-2'>
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        {/* head */}
                        <thead>
                            <tr className="border bg-green-200 text-black text-center">
                                <th>Date</th>
                                <th>Total sales</th>
                                <th>Total profit</th>
                                <th>Total cost</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                summary &&
                                summary.map((summary, index) => (
                                    <tr key={index} className="text-center">
                                        <td className='w-[5%]'>{summary.date}</td>
                                        <td>
                                            {parseFloat(summary.totalSales).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td>
                                            {parseFloat(summary.totalProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td>
                                            {parseFloat(summary.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td>
                                            {parseFloat(summary.totalProfit - summary.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            {/* *****************************Table end***************************************************** */}
        </div>
    );
};

export default DailySummary;