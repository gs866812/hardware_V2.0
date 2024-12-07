import { useContext, useEffect, useState } from "react";
import AddCustomer from "../AddCustomer/AddCustomer";
import { ContextData } from "../../Provider";
import { toast } from "react-toastify";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Select from "react-select";
import useAxiosProtect from "../hooks/useAxiosProtect";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const NewSale = () => {
  const {
    user,
    setReFetch,
    reFetch,
    userName,
    setItemsPerPage,
    tokenReady
  } = useContext(ContextData);
  const axiosSecure = useAxiosSecure();
  const axiosProtect = useAxiosProtect();

  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);


  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salesPrice, setSalesPrice] = useState('');
  const [salesQuantity, setSalesQuantity] = useState("");
  const [purchaseQuantity, setPurchaseQuantity] = useState("");
  const [available, setAvailable] = useState(null);
  const [tempProductList, setTempProductList] = useState([]);
  let [discount, setDiscount] = useState("");
  const [grandTotal, setGrandTotal] = useState("");
  const [payAmount, setPayAmount] = useState(0);
  const [dueAmount, setDueAmount] = useState(grandTotal - payAmount);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(false);
  const [contactNumberValue, setContactNumberValue] = useState("");
  const [newCustomer, setNewCustomer] = useState({});
  const [customerBalance, setCustomerBalance] = useState('');




  const [startDate, setStartDate] = useState('');

  const [selected, setSelected] = useState(false);


  useEffect(() => {
    if (tokenReady && user?.email) {
      axiosProtect
        .get("/newSaleProducts", {
          params: {
            userEmail: user.email, // Ensure email is sent with the request
          },
        })
        .then((data) => {
          setAllProducts(data.data.products); // Now you get all products
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
        });
    }

  }, [reFetch, tokenReady, user?.email]);


  const handleInputSalesQuantity = (event) => {
    const salesQuantityValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(salesQuantityValue)) {
      setSalesQuantity(salesQuantityValue);
    };
    const sale = parseFloat(salesQuantityValue);
    const purchase = parseFloat(purchaseQuantity);
    sale > purchase ?
      toast.error(`You have only ${purchase} in stock`) && setAvailable(`You have only ${purchase} in stock`) : setAvailable(null)
  };

  const handleInputSalesPrice = (event) => {
    const salesPriceValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(salesPriceValue)) {
      setSalesPrice(salesPriceValue);
    }
  };

  const productOptions = allProducts.map((product) => ({
    value: product.productCode,
    label: `${product.productCode}-${product.productName}`,
  }));

  //   change the unit name if product changed
  const handleProductChange = (selectedOption) => {
    if (selectedOption) {
      const selectedProduct = allProducts.find(
        (product) => product.productCode === selectedOption.value
      );
      setSelectedProduct(selectedProduct);

      setUnit(selectedProduct?.unitName);
      setBrand(selectedProduct?.brandName);
      setCategory(selectedProduct?.categoryName);

      axiosSecure
        .post(`/getSalesPrice/${selectedOption.value}`)
        .then((res) => {
          if (res.data.salesPrice) {
            setSalesPrice(res.data?.salesPrice);
            setAvailable(null);
            setPurchasePrice(res.data?.purchasePrice);
            setPurchaseQuantity(res.data?.purchaseQuantity);
          } else {
            setAvailable("Stock not available");
            toast.error(res.data);
          }
        })
        .catch((err) => {
          toast.error("Error fetching data", err);
        });
    } else {
      setSelectedProduct(null);
      setUnit("");
      setBrand("");
      setCategory("");
    }
  };

  const handleSalesProduct = (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      return toast.error("Select product");
    }

    // Disable the button
    setIsAddButtonDisabled(true);

    const form = e.target;
    const productID = selectedProduct.productCode;
    const productTitle = selectedProduct.productName;
    const salesQuantity = parseFloat(
      parseFloat(form.purchase_quantity.value).toFixed(2)
    );
    const salesUnit = unit;
    const salesPrice = parseFloat(
      parseFloat(form.sales_price.value).toFixed(2)
    );
    const userMail = user?.email;

    const salesProductInfo = {
      productID,
      productTitle,
      brand,
      salesQuantity,
      salesUnit,
      salesPrice,
      purchasePrice,
      category,
      userMail,
    };

    axiosSecure
      .post(`/adTempSalesProductList`, salesProductInfo)
      .then((data) => {
        if (data.data.insertedId) {
          toast.success("Product added");
          form.reset();
          setSalesQuantity("");
          setSalesPrice("");
          setReFetch(!reFetch);
        } else {
          toast.error(data.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Server error", error);
      })
      .finally(() => {
        // Re-enable the button after the operation completes
        setIsAddButtonDisabled(false);
      });
  };

  // get sales product temporarily list

  useEffect(() => {
    if (tokenReady && user?.email) {
      axiosProtect
        .get(`/tempSalesProductList/${user?.email}`)
        .then((data) => {
          setTempProductList(data.data);
        })
        .catch((err) => {
          toast.error("Server error", err);
        });
    }

  }, [reFetch, tokenReady, user?.email]);

  const salesProductListAmount = Array.isArray(tempProductList)
    ? tempProductList.map(
      (product) => product.salesQuantity * product.salesPrice
    )
    : [];

  let salesAmount = 0;
  for (let i = 0; i < salesProductListAmount.length; i++) {
    salesAmount += salesProductListAmount[i];
  }

  const salesProfitProductListAmount = Array.isArray(tempProductList)
    ? tempProductList.map(
      (product) => product.salesQuantity * product.purchasePrice
    )
    : [];

  let salesProfitAmount = 0;
  for (let i = 0; i < salesProfitProductListAmount.length; i++) {
    salesProfitAmount += salesProfitProductListAmount[i];
  }

  const profit = parseFloat(salesAmount - salesProfitAmount);

  let salesInvoiceAmount = parseFloat(salesAmount).toFixed(2);
  useEffect(() => {
    setGrandTotal(salesInvoiceAmount);
    setDueAmount(salesInvoiceAmount - payAmount);
  }, [salesInvoiceAmount]);

  // delete temp product
  const handleTempProduct = (_id) => {
    axiosSecure
      .delete(`/deleteSalesTempProduct/${_id}`)
      .then((data) => {
        if (data.data.deletedCount === 1) {
          setReFetch(!reFetch);
          setDiscount("");
        } else {
          toast.error(data.data);
        }
      })
      .catch((error) => {
        toast.error("Server error", error);
      });
  };

  const handleNext = () => {
    document.getElementById("sales_step_1").classList.add("hidden");
    document.getElementById("add_product").classList.add("hidden");
    document.getElementById("sales_step_2").classList.remove("hidden");
    document.getElementById("price").classList.add("hidden");
    document.getElementById("stock").classList.add("hidden");
  };
  const handlePrevious = () => {
    document.getElementById("sales_step_1").classList.remove("hidden");
    document.getElementById("add_product").classList.remove("hidden");
    document.getElementById("sales_step_2").classList.add("hidden");
    document.getElementById("price").classList.remove("hidden");
    document.getElementById("stock").classList.remove("hidden");
  };

  // const customerOptions = customer.map((customer) => ({
  //   value: customer.contactNumber,
  //   label: customer.customerName,
  // }));

  // const handleCustomerChange = (selectedOption) => {
  //   const selectedCustomer = customer.find(
  //     (customer) => customer.contactNumber === selectedOption?.value
  //   );

  //   if (selectedCustomer) {
  //     setSelectedCustomer(selectedCustomer);

  //     // Set the unit of the selected product
  //     setCustomerSerial(selectedCustomer.serial);
  //   } else {
  //     setSelectedCustomer(null);
  //     setCustomerSerial("");
  //   }
  // };

  const handleDiscountOnchange = (event) => {
    const discountValue = event.target.value;
    const onlyNumberRegex = /^\d*\.?\d*$/;
    if (onlyNumberRegex.test(discountValue)) {
      setDiscount(discountValue);
    }
    const discountNumber = parseFloat(
      document.getElementById("discount").value
    );
    if (discountNumber) {
      const discountAmount = parseFloat(discountNumber);
      const newGrandTotal = parseFloat(
        parseFloat(salesInvoiceAmount - discountAmount).toFixed(2)
      );
      setGrandTotal(newGrandTotal);
      setDueAmount(newGrandTotal);
    } else {
      setGrandTotal(salesInvoiceAmount);
      setDueAmount(salesInvoiceAmount);
    }
  };

  const handlePayAmountChange = (e) => {
    const inputValue = e.target.value;

    // Allow clearing the input
    if (inputValue === "") {
      setPayAmount(""); // Set payAmount to an empty string to clear the input
      setDueAmount(grandTotal); // Reset dueAmount to the grand total
      return;
    }

    const value = parseFloat(inputValue) || 0; // Handle invalid or empty input gracefully
    const fixedValue = value >= 0 ? parseFloat(value.toFixed(2)) : 0; // Ensure positive value with two decimal places
    setPayAmount(fixedValue); // Update state for payAmount

    const dueAmount = parseFloat(grandTotal - fixedValue).toFixed(2); // Calculate directly from the input value
    setDueAmount(dueAmount); // Update state for dueAmount
  };



  // const handlePayAmountOnchange = () => {
  //   const dueAmount = parseFloat(grandTotal - payAmount).toFixed(2);
  //   setDueAmount(dueAmount);

  // };



  // contact number input onchange
  const handleInputContactNumber = (event) => {
    const customerNumberValue = event.target.value;
    const onlyNumberRegex = /^[0-9]{0,11}$/;
    if (onlyNumberRegex.test(customerNumberValue)) {
      setContactNumberValue(customerNumberValue);
    }
    axiosSecure
      .post(`/getCustomer/${customerNumberValue}`)
      .then((response) => {
        setNewCustomer(response.data);
        setCustomerBalance(response.data.customerBalance.crBalance);
      })
      .catch((err) => {
        toast.error(err);
      });
  };

  const customerDue = newCustomer.customerDue?.dueAmount;


  const handleCustomerBalance = (e) => {
    setSelected(e.target.checked);

    if (!selected && customerBalance < payAmount) {
      Swal.fire({
        text: `You have to receive BDT: ${payAmount - customerBalance}`,
        icon: "info",
      });
    };
  };




  const navigate = useNavigate();
  // ..........................................................................
  const handleProceed = (e) => {
    e.preventDefault();
    const customerName = e.target.customer_name.value;
    const customerMobile = e.target.customer_mobile.value;
    const customerAddress = e.target.customer_address.value;
    let scheduleDate = moment(startDate).format("DD.MM.YYYY");
    const sourceOfPaid = selected;






    // Check if the form is already being submitted
    if (isLoading) return;

    setIsLoading(true); // Set loading to true

    if (customerMobile.length < 11) {
      setIsLoading(false); // Reset loading state
      return toast.error("Invalid mobile number");
    }



    const date = moment(new Date()).format("DD.MM.YYYY");

    let totalAmount = parseFloat(
      parseFloat(e.target.total_amount.value).toFixed(2)
    );
    const discountAmount = parseFloat(
      parseFloat(e.target.discount_amount.value).toFixed(2)
    );
    const grandTotal = parseFloat(
      parseFloat(e.target.grand_total.value).toFixed(2)
    );
    const dueAmount = parseFloat(
      parseFloat(e.target.due_amount.value).toFixed(2)
    );
    const finalPayAmount = parseFloat(parseFloat(payAmount).toFixed(2));

    if (finalPayAmount > grandTotal) {
      setIsLoading(false); // Reset loading state
      return toast.error("Payment exceeded");
    }



    // if (sourceOfPaid && finalPayAmount > customerBalance) {
    //   setIsLoading(false); // Reset loading state
    //   return toast.error("Insufficient customer balance");
    // }

    if (!dueAmount) {
      scheduleDate = 'Invalid date';
    };






    const userMail = user?.email;
    const salesInvoiceInfo = {
      date,
      customerName,
      totalAmount,
      discountAmount,
      grandTotal,
      finalPayAmount,
      dueAmount,
      scheduleDate,
      sourceOfPaid,
      customerBalance,
      profit,
      userName,
      userMail,
      customerMobile,
      customerAddress,
    };


    if (!sourceOfPaid && customerBalance >= dueAmount) {
      setIsLoading(false);
      Swal.fire({
        title: "Are you sure?",
        text: "Customer has available balance to be paid",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Proceed!"
      }).then((result) => {
        if (result.isConfirmed) {
          axiosSecure
            .post("/newSalesInvoice", salesInvoiceInfo)
            .then((data) => {
              if (data.data.insertedId) {
                setReFetch(!reFetch);
                Swal.fire({
                  title: "Success",
                  text: "Sales invoice created successfully",
                  icon: "success",
                });
                setItemsPerPage(20);
                e.target.reset();
                setDiscount("");
                setGrandTotal("");
                setPayAmount("");
                setDueAmount("");
                navigate("/sales");
              } else {
                Swal.fire({
                  text: data.data,
                  icon: "error",
                });
              }
            })
            .catch((error) => {
              toast.error("Server error", error);
            })
            .finally(() => {
              setIsLoading(false);
            });

        }
      });
    } else {
      axiosSecure
        .post("/newSalesInvoice", salesInvoiceInfo)
        .then((data) => {
          if (data.data.insertedId) {
            setReFetch(!reFetch);
            Swal.fire({
              title: "Success",
              text: "Sales invoice created successfully",
              icon: "success",
            });
            setItemsPerPage(20);
            e.target.reset();
            setDiscount("");
            setGrandTotal("");
            setPayAmount("");
            setDueAmount("");
            navigate("/sales");
          } else {
            Swal.fire({
              text: data.data,
              icon: "error",
            });
          }
        })
        .catch((error) => {
          toast.error("Server error", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };


  };

  return (
    <div className="px-5 pb-10">
      <div className="flex justify-between items-center py-2">
        <h2 className=" text-xl uppercase font-bold">New sales order:</h2>
        <div className="flex gap-2 items-center bg-green-500 rounded-md">
          <AddCustomer />
        </div>
      </div>
      {/* ........................................... */}

      <div className="border py-10 mt-5 border-gray-200 px-5 rounded-md shadow-md relative">
        <span className="absolute text-gray-300 top-2 left-5" id="price">{purchasePrice}</span>
        <span className="absolute text-gray-400 top-0 left-[75%] border p-1 rounded-md" id="stock">{purchaseQuantity}</span>
        <form
          onSubmit={handleSalesProduct}
          className="flex flex-col gap-3"
          id="add_product"
        >
          <label className="flex gap-2 items-center flex-wrap">

            <Select
              options={productOptions}
              onChange={handleProductChange}
              placeholder="Search and select a product"
              isClearable
              className="flex-grow"
            />

            <input
              onChange={handleInputSalesQuantity}
              type="text"
              name="purchase_quantity"
              value={salesQuantity}
              placeholder="Quantity"
              className="border p-2 rounded-md outline-none"
              size={5}
              required
            />

            <input
              type="text"
              name="unit"
              defaultValue={unit}
              placeholder="Unit"
              readOnly
              className="border p-2 rounded-md outline-none"
              size={5}
            />

            <input
              onChange={handleInputSalesPrice}
              type="text"
              name="sales_price"
              value={salesPrice}
              placeholder="Sales price"
              size={10}
              required
              className="border p-2 rounded-md outline-none"
            />
            <button
              className={`bg-green-500 text-white py-2 px-3 rounded-md cursor-pointer ${available ? "opacity-50 cursor-none" : ""
                }`}
              disabled={available || isAddButtonDisabled}
            >
              Add
            </button>
          </label>
        </form>

        {/* show temp product list */}

        {tempProductList.length > 0 && (
          <div
            className="overflow-x-auto mt-8 border p-5 rounded-md border-gray-200"
            id="sales_step_1"
          >
            <p className="uppercase mb-2 font-bold">
              Invoice amount:{" "}
              <span className="text-red-500 font-bold bg-yellow-300 rounded-sm px-1">
                BDT {salesInvoiceAmount}
              </span>
            </p>
            <table className="table table-zebra">
              {/* head */}
              <thead className="bg-blue-400 text-white">
                <tr>
                  <td>SL No</td>
                  <td>Product ID</td>
                  <td>Product Name</td>
                  <td>QTY</td>
                  <td>Unit</td>
                  <td>Price</td>
                  <td>Amount</td>
                  <td className="text-center">Action</td>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                {Array.isArray(tempProductList) ? (
                  tempProductList.map((product, i) => (
                    <tr key={i}>
                      <td className="w-[5%]">{i + 1}</td>
                      <td className="w-[10%]">{product.productID}</td>
                      <td>{product.productTitle}</td>
                      <td className="w-[10%]">
                        {parseFloat(
                          parseFloat(product.salesQuantity).toFixed(3)
                        )}
                      </td>
                      <td className="w-[10%]">{product.salesUnit}</td>
                      <td className="w-[10%]">
                        {parseFloat(parseFloat(product.salesPrice).toFixed(2))}
                      </td>
                      <td className="w-[10%]">
                        {parseFloat(
                          parseFloat(
                            product.salesPrice * product.salesQuantity
                          ).toFixed(2)
                        )}
                      </td>
                      <td className="w-[5%] text-center text-red-500 font-bold">
                        <button
                          onClick={() => handleTempProduct(product._id)}
                          title="Delete this item"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <p>No product selected</p>
                )}
              </tbody>
            </table>
            <div className="flex justify-end mt-5">
              <button
                onClick={handleNext}
                className="py-1 px-5 rounded-md mt-3 bg-green-500 text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <div
          className="mt-5 border p-5 rounded-md mb-5 hidden"
          id="sales_step_2"
        >
          <form onSubmit={handleProceed} className="grid grid-cols-2 gap-10">
            {/* Left Column: Mobile, Name, and Address */}
            <div className="space-y-7">
              <label className="flex gap-2 items-center">
                <span className="w-40 font-bold">Mobile:</span>
                <input
                  type="tel"
                  name="customer_mobile"
                  onChange={handleInputContactNumber}
                  value={contactNumberValue}
                  required
                  className="border py-1 px-2 rounded-md outline-none focus:bg-gray-200 w-full"
                  placeholder="Mobile"
                />
              </label>

              <label className="flex gap-2 items-center">
                <span className="w-40 font-bold">Name:</span>
                <input
                  type="text"
                  name="customer_name"
                  defaultValue={newCustomer.customer?.customerName}
                  required
                  className="border py-1 px-2 rounded-md outline-none focus:bg-gray-200 w-full"
                  placeholder="Name"
                />
              </label>

              <label className="flex gap-2 items-center">
                <span className="w-40 font-bold">Address:</span>
                <input
                  type="text"
                  name="customer_address"
                  defaultValue={newCustomer.customer?.customerAddress}
                  required
                  className="border py-1 px-2 rounded-md outline-none focus:bg-gray-200 w-full"
                  placeholder="Address"
                />
              </label>

              <label className="flex gap-2 items-center">
                <span className="w-40 font-bold">Existing Due:</span>
                <input
                  type="text"
                  name="customer_due"
                  readOnly
                  defaultValue={customerDue}
                  className={`border py-1 px-2 rounded-md outline-none w-full ${customerDue > 0 ? 'bg-red-300' : ''}`}
                />
              </label>

              {
                customerBalance > 0 &&
                <label className="flex gap-2 items-center">
                  <span className="w-40 font-bold">Customer Balance:</span>
                  <input
                    type="text"
                    name="customer_balance"
                    readOnly
                    defaultValue={
                      customerBalance
                    }
                    className={`border py-1 px-2 rounded-md outline-none w-full text-green-600`}
                  />
                </label>
              }


              {
                dueAmount > 0 ? (
                  <label className="flex gap-2 items-center">
                    <span className="w-auto font-bold ">Schedule date:</span>
                    <DatePicker
                      dateFormat="dd.MM.yyyy"
                      selected={startDate}
                      onChange={(date) => {
                        setStartDate(date); // Update state
                      }}
                      placeholderText="Select a date"
                      required={dueAmount > 0} // Conditionally apply 'required'
                      minDate={new Date()}
                      className="px-1 rounded-sm ml-1"
                    />
                  </label>
                ) : null
              }
            </div>

            {/* Right Column: Total, Discount, Grand Total, Pay Amount, and Due Amount */}
            <div className="space-y-7">
              <label className="flex gap-2 items-center">
                <span className="w-36 font-bold">Total:</span>
                <input
                  type="text"
                  name="total_amount"
                  value={salesInvoiceAmount}
                  className="border py-1 px-2 rounded-md outline-none bg-red-100 cursor-not-allowed w-full"
                  disabled
                />
              </label>

              <label className="flex gap-2 items-center">
                <span className="w-36 font-bold">Discount:</span>
                <input
                  id="discount"
                  type="text"
                  name="discount_amount"
                  value={discount}
                  className="border py-1 px-2 rounded-md outline-none focus:bg-gray-100 w-full"
                  onChange={handleDiscountOnchange}
                  placeholder="Discount"
                />
              </label>

              <label className="flex gap-2 items-center">
                <span className="w-36 font-bold">Grand Total:</span>
                <input
                  type="text"
                  name="grand_total"
                  value={grandTotal}
                  className="border py-1 px-2 rounded-md outline-none bg-red-100 cursor-not-allowed w-full"
                  readOnly
                />
              </label>

              <label className="flex gap-2 items-center">
                <span className="w-36 font-bold">Pay Amount:</span>
                <input
                  type="number"
                  name="pay_amount"
                  id="pay-amount"
                  value={payAmount}
                  onChange={handlePayAmountChange}
                  placeholder="Amount"
                  required
                  className="border py-1 px-2 rounded-md outline-none focus:bg-gray-200 w-full"
                />
              </label>

              {
                customerBalance > 0 &&
                <div className="flex gap-2 items-center justify-start">
                  <span className="w-[110px] font-bold">Receive from AC:</span>
                  <input
                    type="checkbox"
                    onClick={handleCustomerBalance}
                    className=""
                  />
                </div>
              }

              <label className="flex gap-2 items-center">
                <span className="w-36 font-bold">Due Amount:</span>
                <input
                  type="text"
                  name="due_amount"
                  value={dueAmount}
                  readOnly
                  className="border py-1 px-2 rounded-md outline-none bg-red-200 cursor-not-allowed w-full"
                />
              </label>
            </div>

            {/* Action Buttons at the bottom, spanning both columns */}
            <div className="col-span-2 flex justify-between mt-5">
              <p
                className="py-1 px-5 rounded-md bg-green-500 text-white cursor-pointer"
                onClick={handlePrevious}
              >
                Previous
              </p>
              <button
                className={`py-1 px-5 rounded-md bg-green-500 text-white ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                disabled={isLoading}
              >
                Proceed
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewSale;
