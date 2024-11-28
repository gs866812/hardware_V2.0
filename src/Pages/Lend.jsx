import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../Provider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAxiosSecure from '../Components/hooks/useAxiosSecure';
import { CiSearch } from 'react-icons/ci';
import useAxiosProtect from '../Components/hooks/useAxiosProtect';
import moment from 'moment/moment';


const Lend = () => {
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const axiosProtect = useAxiosProtect();
    const { reFetch, setReFetch, userName, user } = useContext(ContextData);

    const [isLoading, setIsLoading] = useState(false);
    const [searchStock, setSearchStock] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [lenderName, setLenderName] = useState("");
    const [address, setAddress] = useState("");
    const [lenderList, setLenderList] = useState([]);

    const [lendingAmount, setLendingAmount] = useState("");
    const [receiver, setReceiver] = useState("");
    const [serial, setSerial] = useState("");
    const [note, setNote] = useState("");
    const [method, setMethod] = useState("");

    const [payer, setPayer] = useState("");
    const [returnAmount, setReturnAmount] = useState("");
    const [returnMethod, setReturnMethod] = useState("");
    const [returnNote, setReturnNote] = useState("");

    const [debtBalance, setDebtBalance] = useState(0);

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

    const handleInputChange = (event) => {
        setSearchStock(event.target.value);
        // setCurrentPage(1); // reset to first page on new search
    };

    // ----------------------------------------------------------------------------
    const handleReset = () => {
        setContactNumber('');
        setAddress('');
        setLenderName('');
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


        const lenderInfo = { lenderName, contactNumber, address };

        axiosSecure.post("/lend/lenderList", lenderInfo)
            .then((data) => {
                if (data.data.insertedId) {
                    setReFetch(!reFetch);
                    handleReset();
                    // const modal = document.querySelector('#AddBorrower');
                    // modal.close();
                    toast.success(`Added successfully`);
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
            .get(`/lenderList`, {
                params: {
                    userEmail: user?.email,
                },
            })
            .then((res) => {
                setLenderList(res.data);
            })
            .catch((err) => {
                toast.error(err);
            });
    }, [reFetch]);
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
        document.getElementById(`lendingAmount`).showModal();
    }


    // ..................................................................

    const handleLendingAmountReset = (e) => {
        setLendingAmount('');
        setNote('');
        setMethod('');

    }

    // ..................................................................
    const handleLendingAmount = (e) => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);

        const date = moment(new Date()).format("DD.MM.YYYY");
        const rcvAmount = parseFloat(lendingAmount);

        const receiverInfo = { date, rcvAmount, serial, note, method, userName };

     

        axiosSecure.post("/lend/givingMoney", receiverInfo)
            .then((data) => {
                if (data.data.message) {
                    setReFetch(!reFetch);
                    handleLendingAmountReset();
                    const modal = document.querySelector('#lendingAmount');
                    modal.close();
                    toast.success(`Balance given successfully`);
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

    // ------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------
    const handlePayer = (name, serial) => {
        setPayer(name);
        setSerial(serial);
        document.getElementById(`returnAmount`).showModal();
    }


    // ..................................................................

    const handleGivenAmountReset = (e) => {
        setReturnAmount('');
        setReturnNote('');
        setReturnMethod('');

    }

    const handleReturnAmount = (e) => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);

        const date = moment(new Date()).format("DD.MM.YYYY");
        const payAmount = parseFloat(returnAmount);

        const returnInfo = { date, payAmount, returnNote, serial, returnMethod, userName };


        axiosSecure.post("/lend/returnMoney", returnInfo)
            .then((data) => {
                if (data.data == 'Success') {
                    setReFetch(!reFetch);
                    handleGivenAmountReset();
                    const modal = document.querySelector('#returnAmount');
                    modal.close();
                    toast.success(`Received successfully`);
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

    return (
        <div className='px-2'>
            <div className='flex items-start justify-between'>
                <span className='px-4 py-5 bg-red-600 text-white font-bold rounded-md'>CR Balance: {balance}</span>
            </div>

            <div>
                <div className="flex items-center justify-between mt-5">
                    <div className="flex gap-2 items-center">
                        <h2 className="text-2xl">Recent Transactions:</h2>
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
                            <th>Credit</th>
                            <th colSpan={3} className='text-center'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* row 1 */}
                        {
                            Array.isArray(lenderList) &&
                            lenderList.map((lender, idx) => (
                                <tr key={idx}>
                                    <td className='w-[5%] text-center'>{lender.serial}</td>
                                    <td>{lender.lenderName}</td>
                                    <td>{lender.contactNumber}</td>
                                    <td>{lender.address}</td>
                                    <td className='w-[5%] text-center'>{
                                        parseFloat(lender.crBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    }</td>
                                    <td className='w-[8%] bg-green-600 text-white cursor-pointer' onClick={(e) => handleReceiver(lender.lenderName, lender.serial)}>Lend To</td>

                                    <td className='w-[11%] bg-red-500 text-white cursor-pointer' onClick={() => handlePayer(lender.lenderName, lender.serial)}>Return From</td>
                                    <td className='w-[8px] bg-yellow-500  cursor-pointer'>History</td>
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
                                value={lenderName}
                                onChange={(e) => setLenderName(e.target.value)}
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

            {/* lending amount start */}
            <dialog id="lendingAmount" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-3 uppercase">Lend to: <span className='text-red-600'>{receiver}</span></h3>
                    <hr />
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                            ✕
                        </button>
                    </form>
                    <form onSubmit={handleLendingAmount} className="mt-5 space-y-5">
                        <label className="flex items-center">
                            <p className="w-1/2 font-semibold">Lending Amount</p>{" "}
                            <input
                                type="number"
                                name="receive_amount"
                                value={lendingAmount}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    // Allow empty input or values that are positive floating-point numbers
                                    if (!isNaN(value) && value >= 0) {
                                        setLendingAmount(value);
                                    }
                                }}
                                min="0" // Prevents negative numbers in most browsers
                                step="0.01" // Allows floating-point numbers
                                placeholder="Amount to be given"
                                className="py-1 px-2 rounded-md outline-none border w-1/2"
                                required
                            />

                        </label>
                        <label className="flex items-center">
                            <p className="w-1/2 font-semibold">Method</p>{" "}
                            <input
                                type="text"
                                name="receive_method"
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                placeholder="Method"
                                className="py-1 px-2 rounded-md outline-none border w-1/2"
                                required
                            />

                        </label>
                        <label className="flex items-center">
                            <p className="w-1/2 font-semibold">Note</p>{" "}
                            <input
                                type="text"
                                name="receive_note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Note"
                                className="py-1 px-2 rounded-md outline-none border w-1/2"
                                required
                            />

                        </label>

                        <span className="flex items-start justify-end gap-3">
                            <input
                                type="reset"
                                value="Reset"
                                onClick={handleLendingAmountReset}
                                className="bg-yellow-300 py-2 px-4 rounded-md"
                            />

                            <button
                                className={`bg-green-500 py-2 px-4 rounded-md text-white hover:bg-green-600 cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                disabled={isLoading}
                            >
                                Lend
                            </button>
                        </span>
                    </form>
                </div>
            </dialog>
            {/* received amount end */}

            {/* given amount start */}
            <dialog id="returnAmount" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-3 uppercase">Return From: <span className='text-red-600'>{payer}</span></h3>
                    <hr />
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white bg-red-400 hover:bg-red-500">
                            ✕
                        </button>
                    </form>
                    <form onSubmit={handleReturnAmount} className="mt-5 space-y-5">
                        <label className="flex items-center">
                            <p className="w-1/2 font-semibold">Return Amount</p>{" "}
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
                                placeholder="Amount to be receive"
                                className="py-1 px-2 rounded-md outline-none border w-1/2"
                                required
                            />

                        </label>
                        <label className="flex items-center">
                            <p className="w-1/2 font-semibold">Method</p>{" "}
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
                            <p className="w-1/2 font-semibold">Note</p>{" "}
                            <input
                                type="text"
                                name="given_note"
                                value={returnNote}
                                onChange={(e) => setReturnNote(e.target.value)}
                                placeholder="Note"
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
                                Receive
                            </button>
                        </span>
                    </form>
                </div>
            </dialog>
            {/* given amount end */}
        </div>
    );
};

export default Lend;