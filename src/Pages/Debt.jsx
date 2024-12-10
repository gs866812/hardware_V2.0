import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../Provider';
import { toast } from 'react-toastify';
import useAxiosSecure from '../Components/hooks/useAxiosSecure';
import { CiSearch } from 'react-icons/ci';
import useAxiosProtect from '../Components/hooks/useAxiosProtect';
import moment from 'moment/moment';
import { FaFileExcel, FaRegFileExcel } from 'react-icons/fa';
import * as XLSX from "xlsx";


const Debt = () => {

    const axiosSecure = useAxiosSecure();
    const axiosProtect = useAxiosProtect();
    const { reFetch, setReFetch, userName, user, currentPage, setCurrentPage, setItemsPerPage, itemsPerPage, tokenReady } = useContext(ContextData);

    const [isLoading, setIsLoading] = useState(false);
    const [contactNumber, setContactNumber] = useState("");
    const [borrowerName, setBorrowerName] = useState("");
    const [address, setAddress] = useState("");
    const [borrowerList, setBorrowerList] = useState([]);
    const [allBorrowers, setAllBorrowers] = useState([]);

    const [receivedAmount, setReceivedAmount] = useState("");
    const [receiver, setReceiver] = useState("");
    const [serial, setSerial] = useState("");
    const [note, setNote] = useState("");
    const [method, setMethod] = useState("");

    const [payer, setPayer] = useState("");
    const [returnAmount, setReturnAmount] = useState("");
    const [returnMethod, setReturnMethod] = useState("");
    const [returnNote, setReturnNote] = useState("");

    const [debtBalance, setDebtBalance] = useState(0);
    const [searchBorrower, setSearchBorrower] = useState("");
    const [borrowerCount, setBorrowerCount] = useState({});
    const [debtHistory, setDebtHistory] = useState([]);




    // ----------------------------------------------------------------------------
    // contact number input onchange
    const handleInputContactNumber = (event) => {
        const customerNumberValue = event.target.value;
        const onlyNumberRegex = /^[0-9]{0,11}$/;
        if (onlyNumberRegex.test(customerNumberValue)) {
            setContactNumber(customerNumberValue);
        }
    };

    // ----------------------------------------------------------------------------

    useEffect(() => {
        setCurrentPage(1);
        setSearchBorrower("");
        return () => {
            setSearchBorrower("");
            setCurrentPage(1);
        };
    }, [setCurrentPage, setSearchBorrower]);




    // ----------------------------------------------------------------------------
    const handleReset = () => {
        setContactNumber('');
        setAddress('');
        setBorrowerName('');
    };


    // ----------------------------------------------------------------------------

    const handleAddBorrower = (e) => {
        e.preventDefault();

        if (isLoading) return;

        setIsLoading(true);
        if (contactNumber.length < 11) {
            setIsLoading(false);
            return toast.error("Invalid mobile number");
        }


        const borrowerInfo = { borrowerName, contactNumber, address };

        axiosSecure.post("/debt/borrowerList", borrowerInfo)
            .then((data) => {
                if (data.data.insertedId) {
                    setReFetch(!reFetch);
                    handleReset();
                    // const modal = document.querySelector('#AddBorrower');
                    // modal.close();
                    toast.success(`Borrower added successfully`);
                } else {
                    toast.error(data.data);
                }
            }).catch((error) => {
                toast.error("Server error", error);
            })
            .finally(() => {
                setIsLoading(false); // Reset loading state
            });

    }



    // ----------------------------------------------------------------------------
    useEffect(() => {
        axiosProtect
            .get(`/borrowerList`, {
                params: {
                    userEmail: user?.email,
                    page: currentPage,
                    size: itemsPerPage,
                    search: searchBorrower,
                },
            })
            .then((res) => {
                setBorrowerList(res.data.result);
                setBorrowerCount(res.data.count)
            })
            .catch((err) => {
                toast.error(err);
            });
    }, [reFetch, currentPage, itemsPerPage, axiosProtect, searchBorrower, user?.email]);
    // ----------------------------------------------------------------------------

    const balance = debtBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    useEffect(() => {
        axiosProtect
            .get(`/getDebtBalance`, {
                params: {
                    userEmail: user?.email,
                },
            })
            .then((res) => {
                setDebtBalance(res.data[0].totalBalance);
            })
            .catch((err) => {
                toast.error(err);
            });
    }, [reFetch]);

    // ----------------------------------------------------------------------------
    const handleReceiver = (name, serial) => {
        setReceiver(name);
        setSerial(serial);
        document.getElementById(`receivedAmount`).showModal();
    }


    // ..................................................................

    const handleReceivedAmountReset = (e) => {
        setReceivedAmount('');
        setNote('');
        setMethod('');

    }

    // ..................................................................
    const handleReceivedAmount = (e) => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);

        const date = moment(new Date()).format("DD.MM.YYYY");
        const rcvAmount = parseFloat(receivedAmount);

        const receiverInfo = { date, rcvAmount, serial, note, method, userName };

        axiosSecure.post("/debt/receivedMoney", receiverInfo)
            .then((data) => {
                if (data.data.message) {
                    setReFetch(!reFetch);
                    handleReceivedAmountReset();
                    const modal = document.querySelector('#receivedAmount');
                    modal.close();
                    toast.success(`Balance added successfully`);
                } else {
                    toast.error(data.data.error);
                }
            }).catch((error) => {
                toast.error("Server error", error);
            })
            .finally(() => {
                setIsLoading(false); // Reset loading state
            });

    }

    // ------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------
    const handlePayer = (name, serial) => {
        setPayer(name);
        setSerial(serial);
        document.getElementById(`givenAmount`).showModal();
    }


    // ..................................................................

    const handleGivenAmountReset = (e) => {
        setReturnAmount('');
        setReturnNote('');
        setReturnMethod('');

    }

    const handlePayerAmount = (e) => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);

        const date = moment(new Date()).format("DD.MM.YYYY");
        const payAmount = parseFloat(returnAmount);

        const payInfo = { date, payAmount, returnNote, serial, returnMethod, userName };


        axiosSecure.post("/debt/returnMoney", payInfo)
            .then((data) => {
                if (data.data == 'Success') {
                    setReFetch(!reFetch);
                    handleGivenAmountReset();
                    const modal = document.querySelector('#givenAmount');
                    modal.close();
                    toast.success(`Paid successfully`);
                } else {
                    toast.error(data.data);
                }
            }).catch((error) => {
                toast.error("Server error", error);
            })
            .finally(() => {
                setIsLoading(false); // Reset loading state
            });
    };

    // ----------------------------------------------------------
    const handleHistory = (name, serial) => {
        setPayer(name);
        setSerial(serial);
        document.getElementById(`debtHistory`).showModal();

        const fetchDebtHistory = async () => {
            try {
                const res = await axiosProtect.get(`/debtHistory`, {
                    params: {
                        userEmail: user?.email,
                        serial,
                    },
                });
                setDebtHistory(res.data.reverse());
            } catch (e) {
                toast.error(`Error fetching data`, e);
            }
        };
        fetchDebtHistory();
    }
    // ----------------------------------------------------------

    const handleInputChange = (event) => {
        setSearchBorrower(event.target.value);
        setCurrentPage(1); // reset to first page on new search
    };

    // get all borrower for excel data
    useEffect(() => {
        if (tokenReady && user?.email) {
            const fetchBorrowerData = async () => {
                try {
                    const res = await axiosProtect.get(`/allBorrower`, {
                        params: {
                            userEmail: user?.email,
                        },
                    });

                    setAllBorrowers(res.data);
                } catch (e) {
                    toast.error("Error fetching data:", e);
                }
            }
            fetchBorrowerData();
        }
    }, [reFetch, tokenReady, axiosProtect, user?.email])

    // excel download -------------------------------------------------------

    const downloadExcel = () => {
        // Format the data to include only the desired columns
        const formattedData = allBorrowers.map((borrower) => ({
            "ID": borrower.serial,
            "Name": borrower.borrowerName,
            "Mobile No": borrower.contactNumber,
            "Address": borrower.address,
            "Due Balance": borrower.crBalance,
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Debt List");
        XLSX.writeFile(workbook, "Debt_list.xlsx");
    };
    const downloadExcelCurrent = () => {
        // Format the data to include only the desired columns
        const formattedData = borrowerList.map((borrower) => ({
            "ID": borrower.serial,
            "Name": borrower.borrowerName,
            "Mobile No": borrower.contactNumber,
            "Address": borrower.address,
            "Due Balance": borrower.crBalance,
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Debt List");
        XLSX.writeFile(workbook, "Debt_list.xlsx");
    };


    // Pagination
    const totalItem = borrowerCount;
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
        <div className='px-2'>
            <div className='flex items-start justify-between'>
                <span className='px-4 py-5 bg-red-600 text-white font-bold rounded-md'>DR Balance: {balance}</span>
            </div>

            <div>
                <div className="flex items-center justify-between mt-5">
                    <div className="flex gap-2 items-center">
                        <h2 className="text-2xl">Recent Transactions:</h2>
                        <FaFileExcel className="w-[20px] h-[20%] cursor-pointer ml-5 text-red-600" title="Download full list" onClick={downloadExcel} />
                        <FaRegFileExcel className="w-[20px] h-[20%] cursor-pointer text-green-600" title="Download current list" onClick={downloadExcelCurrent} />
                    </div>
                    <div className='flex items-center gap-1'>
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
                        <button onClick={() => document.getElementById("AddBorrower").showModal()} className='bg-green-600 text-white px-3 py-1 rounded-md'>
                            Add Person
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto mt-5">
                <table className="table table-zebra">
                    {/* head */}
                    <thead>
                        <tr className='bg-blue-600 text-white text-[16px]'>
                            <th>Serial</th>
                            <th>Name</th>
                            <th>Mobile</th>
                            <th>Address</th>
                            <th>Due Balance</th>
                            <th colSpan={3} className='text-center'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* row 1 */}
                        {
                            Array.isArray(borrowerList) &&
                            borrowerList.map((borrower, idx) => (
                                <tr key={idx}>
                                    <td className='w-[5%] text-center'>{borrower.serial}</td>
                                    <td>{borrower.borrowerName}</td>
                                    <td>{borrower.contactNumber}</td>
                                    <td>{borrower.address}</td>
                                    <td className='w-[5%] text-center'>{
                                        parseFloat(borrower.crBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    }</td>
                                    <td className='w-[12%] bg-green-600 text-white cursor-pointer' onClick={(e) => handleReceiver(borrower.borrowerName, borrower.serial)}>Receive From</td>

                                    <td className='w-[10%] bg-red-500 text-white cursor-pointer' onClick={() => handlePayer(borrower.borrowerName, borrower.serial)}>Return To</td>
                                    <td className='w-[8px] bg-yellow-500  cursor-pointer' onClick={() => handleHistory(borrower.borrowerName, borrower.serial)}>History</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>


            {/* Add borrower modal start */}
            <dialog id="AddBorrower" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-3 uppercase">Add Person:</h3>
                    <hr />
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                            ✕
                        </button>
                    </form>
                    <form onSubmit={handleAddBorrower} className="mt-5 space-y-5">
                        <label className="flex items-center">
                            <p className="w-1/2 font-semibold">Mobile Number:</p>{" "}
                            <input
                                type="text"
                                name="Borrower Number"
                                value={contactNumber}
                                onChange={handleInputContactNumber}
                                placeholder="Mobile Number"
                                className="py-1 px-2 rounded-md outline-none border w-1/2"
                                required
                            />
                        </label>
                        <label className="flex items-center">
                            <p className="w-1/2 font-semibold">Name:</p>{" "}
                            <input
                                type="text"
                                name="Borrower Name"
                                value={borrowerName}
                                onChange={(e) => setBorrowerName(e.target.value)}
                                placeholder="Name"
                                className="py-1 px-2 rounded-md outline-none border w-1/2"
                                required
                            />
                        </label>
                        <label className="flex items-center">
                            <p className="w-1/2 font-semibold">Address:</p>{" "}
                            <input
                                type="text"
                                name="Borrower Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Address"
                                className="py-1 px-2 rounded-md outline-none border w-1/2"
                                required
                            />
                        </label>



                        <span className="flex items-start justify-end gap-3">
                            <input
                                type="reset"
                                value="Reset"
                                onClick={handleReset}
                                className="bg-yellow-300 py-2 px-4 rounded-md"
                            />

                            <button
                                className={`bg-green-500 py-2 px-4 rounded-md text-white hover:bg-green-600 cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                disabled={isLoading}
                            >
                                Add
                            </button>
                        </span>
                    </form>
                </div>
            </dialog>
            {/* Add borrower modal end */}

            {/* received amount start */}
            <dialog id="receivedAmount" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-3 uppercase">Receiving from: <span className='text-red-600'>{receiver}</span></h3>
                    <hr />
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                            ✕
                        </button>
                    </form>
                    <form onSubmit={handleReceivedAmount} className="mt-5 space-y-5">
                        <label className="flex items-center">
                            <p className="w-1/2 font-semibold">Receive Amount</p>{" "}
                            <input
                                type="number"
                                name="receive_amount"
                                value={receivedAmount}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // Allow empty input or values that are positive floating-point numbers
                                    if (!isNaN(value) && value >= 0) {
                                        setReceivedAmount(value);
                                    }
                                }}
                                min="0" // Prevents negative numbers in most browsers
                                step="0.01" // Allows floating-point numbers
                                placeholder="Amount to be received"
                                className="py-1 px-2 rounded-md outline-none border w-1/2"
                                required
                            />

                        </label>
                        <label className="flex items-center">
                            <p className="w-1/2 font-semibold">Receiving Method</p>{" "}
                            <input
                                type="text"
                                name="receive_method"
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                placeholder="Receive Method"
                                className="py-1 px-2 rounded-md outline-none border w-1/2"
                                required
                            />

                        </label>
                        <label className="flex items-center">
                            <p className="w-1/2 font-semibold">Receive Note</p>{" "}
                            <input
                                type="text"
                                name="receive_note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Receive Note"
                                className="py-1 px-2 rounded-md outline-none border w-1/2"
                                required
                            />

                        </label>

                        <span className="flex items-start justify-end gap-3">
                            <input
                                type="reset"
                                value="Reset"
                                onClick={handleReceivedAmountReset}
                                className="bg-yellow-300 py-2 px-4 rounded-md"
                            />

                            <button
                                className={`bg-green-500 py-2 px-4 rounded-md text-white hover:bg-green-600 cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                disabled={isLoading}
                            >
                                Money Received
                            </button>
                        </span>
                    </form>
                </div>
            </dialog>
            {/* received amount end */}

            {/* given amount start */}
            <dialog id="givenAmount" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-3 uppercase">Pay to: <span className='text-red-600'>{payer}</span></h3>
                    <hr />
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                            ✕
                        </button>
                    </form>
                    <form onSubmit={handlePayerAmount} className="mt-5 space-y-5">
                        <label className="flex items-center">
                            <p className="w-1/2 font-semibold">Pay Amount</p>{" "}
                            <input
                                type="number"
                                name="return_amount"
                                value={returnAmount}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // Allow empty input or values that are positive floating-point numbers
                                    if (!isNaN(value) && value >= 0) {
                                        setReturnAmount(value);
                                    }
                                }}
                                min="0" // Prevents negative numbers in most browsers
                                step="0.01" // Allows floating-point numbers
                                placeholder="Amount to be paid"
                                className="py-1 px-2 rounded-md outline-none border w-1/2"
                                required
                            />

                        </label>
                        <label className="flex items-center">
                            <p className="w-1/2 font-semibold">Pay Method</p>{" "}
                            <input
                                type="text"
                                name="return_method"
                                value={returnMethod}
                                onChange={(e) => setReturnMethod(e.target.value)}
                                placeholder="Pay Method"
                                className="py-1 px-2 rounded-md outline-none border w-1/2"
                                required
                            />

                        </label>
                        <label className="flex items-center">
                            <p className="w-1/2 font-semibold">Pay Note</p>{" "}
                            <input
                                type="text"
                                name="given_note"
                                value={returnNote}
                                onChange={(e) => setReturnNote(e.target.value)}
                                placeholder="Given Note"
                                className="py-1 px-2 rounded-md outline-none border w-1/2"
                                required
                            />

                        </label>

                        <span className="flex items-start justify-end gap-3">
                            <input
                                type="reset"
                                value="Reset"
                                onClick={handleGivenAmountReset}
                                className="bg-yellow-300 py-2 px-4 rounded-md"
                            />

                            <button
                                className={`bg-green-500 py-2 px-4 rounded-md text-white hover:bg-green-600 cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                disabled={isLoading}
                            >
                                Money Pay
                            </button>
                        </span>
                    </form>
                </div>
            </dialog>
            {/* given amount end */}



            {/* pagination */}
            {borrowerCount && (
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

export default Debt;