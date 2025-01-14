import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useAxiosProtect from '../hooks/useAxiosProtect';
import { ContextData } from '../../Provider';
import { CiSearch } from 'react-icons/ci';

const CustomerStatement = () => {

    // ************************************************************************************************
    const axiosProtect = useAxiosProtect();

    const { reFetch, user } = useContext(ContextData);
    const [customer, setCustomer] = useState([]);
    const [customerStatement, setCustomerStatement] = useState([]);

    // ************************************************************************************************
    const location = useLocation();
    const pathParts = location.pathname.split("/");
    const id = pathParts[pathParts.length - 1]; // Get the last part of the pathname

    // ************************************************************************************************
    useEffect(() => {
        const fetchCustomerStatement = async () => {
            const response = await axiosProtect.get(`/singleCustomer/statement/${id}`, {
                params: {
                    userEmail: user?.email,
                },
            });
            setCustomer(response.data);
            setCustomerStatement(response.data.statement);
        };

        fetchCustomerStatement();
    }, [reFetch]);
    // ************************************************************************************************
    const handleInputChange = (event) => {

    };
    // ************************************************************************************************


    return (
        <div className="mt-5 px-2">
            {/**************************************************************************************************/}
            <div className="mt-5">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <h2 className="text-xl uppercase font-bold">Statement of <span className='text-red-600'>{customer.customerName}</span></h2>

                    </div>
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
            {/**************************************************************************************************/}
            <div className="my-4">
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        {/* head */}
                        <thead>
                            <tr className="border bg-green-200 text-black">
                                <th>Date</th>
                                <th>Invoice Number</th>
                                <th>Invoice Amount</th>
                                <th>Dr Balance</th>
                                <th>Cr Balance</th>
                                <th>Balance</th>
                                <th>Type</th>
                                <th>User</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                customerStatement &&
                                customerStatement.map((statement, idx) =>
                                    <tr key={idx}>
                                        <td>{statement.date}</td>
                                        <td>
                                            {statement.invoiceNumber || "-"}
                                        </td>
                                        <td>
                                            {statement.invoiceAmount != null
                                                ? parseFloat(statement.invoiceAmount).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })
                                                : "-"}
                                        </td>
                                        <td>
                                            {parseFloat(statement.drBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "-"}
                                        </td>
                                        <td>
                                            {parseFloat(statement.crBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "-"}
                                        </td>
                                        <td>
                                            {parseFloat(statement.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "-"}
                                        </td>
                                        <td>{statement.type}</td>
                                        <td>{statement.userName}</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            {/**************************************************************************************************/}
        </div>
    );
};

export default CustomerStatement;