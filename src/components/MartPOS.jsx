import React, { useState, useEffect, useRef } from 'react';

const MartPOS = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [barcode, setBarcode] = useState('');
    const [products, setProducts] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0.00);
    const [totalQty, setTotalQty] = useState(0);
    const [totalDiscount, setTotalDiscount] = useState(0.00);
    const [setInvoiceNo] = useState('S1 - 8182 - 000001');
    const [vat] = useState('0');
    const [productId, setProductId] = useState('');
    const [salesPrice, setSalesPrice] = useState('0');
    const [promoDis, setPromoDis] = useState('0');
    const [packageInfo, setPackageInfo] = useState('');
    const [stock, setStock] = useState('');
    const [productName, setProductName] = useState('');
    const [showSoftwareDetails, setShowSoftwareDetails] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [tenderAmount, setTenderAmount] = useState('0');
    const [customerName, setCustomerName] = useState('');
    const [vatPanNo, setVatPanNo] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [address, setAddress] = useState('');
    const [memberId, setMemberId] = useState('');
    const [memberName, setMemberName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [creditCardNumber, setCreditCardNumber] = useState('');
    const [creditCardExpiry, setCreditCardExpiry] = useState('');
    const [creditCardCvv, setCreditCardCvv] = useState('');
    const [bankName, setBankName] = useState('');
    const [bankAccount, setBankAccount] = useState('');
    const [bankRouting, setBankRouting] = useState('');
    const modalRef = useRef(null);

    useEffect(() => {
        const initialProducts = Array(8).fill(null).map((_, i) => ({
            id: i + 1,
            barcode: '',
            name: '',
            quantity: 0,
            free: 0,
            price: 0.00,
            discountPercent: 0.00,
            discountAmount: 0.00,
            amount: 0.00
        }));
        setProducts(initialProducts);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowPaymentModal(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatDateTime = (date) => {
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleBarcodeSubmit = (e) => {
        e.preventDefault();
        if (!barcode.trim()) return;

        const emptyRowIndex = products.findIndex(p => !p.barcode);
        const updatedProducts = [...products];

        if (emptyRowIndex !== -1) {
            updatedProducts[emptyRowIndex] = {
                ...updatedProducts[emptyRowIndex],
                barcode,
                name: productName || `Product ${emptyRowIndex + 1}`,
                quantity: 1,
                price: parseFloat(salesPrice) || 100.00,
                amount: (parseFloat(salesPrice) || 100.00) * 1
            };
        } else {
            updatedProducts.push({
                id: products.length + 1,
                barcode,
                name: productName || `Product ${products.length + 1}`,
                quantity: 1,
                free: 0,
                price: parseFloat(salesPrice) || 100.00,
                discountPercent: parseFloat(promoDis) || 0,
                discountAmount: 0.00,
                amount: (parseFloat(salesPrice) || 100.00) * 1
            });
        }

        setProducts(updatedProducts);
        calculateTotals(updatedProducts);
        setBarcode('');
        setProductName('');
    };

    const calculateTotals = (list) => {
        const total = list.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const qty = list.reduce((sum, p) => sum + parseInt(p.quantity || 0), 0);
        const discount = list.reduce((sum, p) => sum + parseFloat(p.discountAmount || 0), 0);
        setTotalAmount(total.toFixed(2));
        setTotalQty(qty);
        setTotalDiscount(discount.toFixed(2));
    };

    const handleFieldChange = (id, field, value) => {
        const updated = products.map(p => {
            if (p.id !== id) return p;
            const updatedProduct = { ...p, [field]: value };

            if (['quantity', 'price', 'discountPercent'].includes(field)) {
                const qty = parseInt(updatedProduct.quantity) || 0;
                const price = parseFloat(updatedProduct.price) || 0;
                const discPct = parseFloat(updatedProduct.discountPercent) || 0;
                updatedProduct.discountAmount = (price * qty * discPct / 100).toFixed(2);
                updatedProduct.amount = (price * qty - updatedProduct.discountAmount).toFixed(2);
            }

            if (field === 'discountAmount') {
                const qty = parseInt(updatedProduct.quantity) || 0;
                const price = parseFloat(updatedProduct.price) || 0;
                const discAmt = parseFloat(value) || 0;
                updatedProduct.discountPercent = price > 0 ? (discAmt * 100 / (price * qty)).toFixed(2) : 0;
                updatedProduct.amount = (price * qty - discAmt).toFixed(2);
            }

            return updatedProduct;
        });

        setProducts(updated);
        calculateTotals(updated);
    };

    const handleRemoveProduct = (id) => {
        const updated = products.map(p =>
            p.id === id
                ? { ...p, barcode: '', name: '', quantity: 0, free: 0, price: 0, discountPercent: 0, discountAmount: 0, amount: 0 }
                : p
        );
        setProducts(updated);
        calculateTotals(updated);
    };

    const handleNewTransaction = () => {
        const initial = Array(8).fill(null).map((_, i) => ({
            id: i + 1,
            barcode: '', name: '', quantity: 0, free: 0, price: 0, discountPercent: 0, discountAmount: 0, amount: 0
        }));
        setProducts(initial);
        setTotalAmount(0.00);
        setTotalQty(0);
        setTotalDiscount(0.00);
        setInvoiceNo(`S1 - 8182 - ${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`);
        setBarcode('');
        setProductId('');
        setSalesPrice('0');
        setPromoDis('0');
        setPackageInfo('');
        setStock('');
        setProductName('');
        setCustomerName('');
        setVatPanNo('');
        setPhoneNo('');
        setAddress('');
        setMemberId('');
        setMemberName('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setQrCode('');
        setCreditCardNumber('');
        setCreditCardExpiry('');
        setCreditCardCvv('');
        setBankName('');
        setBankAccount('');
        setBankRouting('');
        setTenderAmount('0');
    };

    const handlePayment = () => {
        if (totalAmount <= 0) return alert("No products in cart");
        setTenderAmount(totalAmount);
        setShowPaymentModal(true);
    };

    const calculateReturnAmount = () => {
        const tender = parseFloat(tenderAmount) || 0;
        const finalAmount = parseFloat(totalAmount) - parseFloat(totalDiscount);
        return (tender - finalAmount).toFixed(2);
    };

    const handleSavePayment = () => {
        alert(`Payment processed successfully! Amount: ${(parseFloat(totalAmount) - parseFloat(totalDiscount)).toFixed(2)}`);
        setShowPaymentModal(false);
    };

    return (
        <div className="h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col overflow-hidden">
            <header className="bg-gradient-to-r from-[#3673B4] to-[#3673B4] text-white shadow-xl flex-shrink-0">
                <div className="px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Techspire POS System</h1>
                            <p className="text-sm text-blue-100">Bhatbhateni Supermarket</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                            <div className="text-sm font-medium">{formatDateTime(currentTime)}</div>
                        </div>
                        <div className="relative">
                            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg backdrop-blur-sm flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
                <div className="flex flex-1 gap-4 overflow-hidden">
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                        <div className="flex gap-4 h-40">
                            <div className="flex-1 bg-white rounded-xl shadow-lg border border-[#3673B4]/20 p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-[#3673B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Product Details
                                    </h3>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Fill in product information
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-xs">
                                    <div>
                                        <label className="text-gray-600 font-medium mb-1 block">Barcode</label>
                                        <input value={barcode} onChange={e => setBarcode(e.target.value)} className="w-full px-2 py-1.5 border border-[#3673B4]/20 rounded-lg focus:outline-none focus:border-[#3673B4] focus:ring-2 focus:ring-[#3673B4]/20 transition" />
                                    </div>
                                    <div>
                                        <label className="text-gray-600 font-medium mb-1 block">VAT</label>
                                        <input value={vat} className="w-full px-2 py-1.5 border border-gray-200 rounded-lg bg-gray-50" readOnly />
                                    </div>
                                    <div>
                                        <label className="text-gray-600 font-medium mb-1 block">Product Name</label>
                                        <input value={productName} onChange={e => setProductName(e.target.value)} className="w-full px-2 py-1.5 border border-[#3673B4]/20 rounded-lg focus:outline-none focus:border-[#3673B4] focus:ring-2 focus:ring-[#3673B4]/20 transition" />
                                    </div>
                                    <div>
                                        <label className="text-gray-600 font-medium mb-1 block">Product ID</label>
                                        <input value={productId} onChange={e => setProductId(e.target.value)} className="w-full px-2 py-1.5 border border-[#3673B4]/20 rounded-lg focus:outline-none focus:border-[#3673B4] focus:ring-2 focus:ring-[#3673B4]/20 transition" />
                                    </div>
                                    <div>
                                        <label className="text-gray-600 font-medium mb-1 block">Sales Price</label>
                                        <input value={salesPrice} onChange={e => setSalesPrice(e.target.value)} className="w-full px-2 py-1.5 border border-[#3673B4]/20 rounded-lg focus:outline-none focus:border-[#3673B4] focus:ring-2 focus:ring-[#3673B4]/20 transition" />
                                    </div>
                                    <div>
                                        <label className="text-gray-600 font-medium mb-1 block">Promo Dis</label>
                                        <input value={promoDis} onChange={e => setPromoDis(e.target.value)} className="w-full px-2 py-1.5 border border-[#3673B4]/20 rounded-lg focus:outline-none focus:border-[#3673B4] focus:ring-2 focus:ring-[#3673B4]/20 transition" />
                                    </div>
                                    <div>
                                        <label className="text-gray-600 font-medium mb-1 block">Package</label>
                                        <input value={packageInfo} onChange={e => setPackageInfo(e.target.value)} className="w-full px-2 py-1.5 border border-[#3673B4]/20 rounded-lg focus:outline-none focus:border-[#3673B4] focus:ring-2 focus:ring-[#3673B4]/20 transition" />
                                    </div>
                                    <div>
                                        <label className="text-gray-600 font-medium mb-1 block">Stock (Pcs)</label>
                                        <input value={stock} onChange={e => setStock(e.target.value)} className="w-full px-2 py-1.5 border border-[#3673B4]/20 rounded-lg focus:outline-none focus:border-[#3673B4] focus:ring-2 focus:ring-[#3673B4]/20 transition" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-72 bg-gradient-to-br from-[#3673B4] to-[#3673B4] text-white rounded-xl shadow-xl p-6 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs uppercase tracking-wider text-blue-100 font-semibold">Total Amount</span>
                                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-4xl font-bold mb-2">NPR {totalAmount}</div>
                            </div>
                        </div>

                        <form onSubmit={handleBarcodeSubmit} className="bg-white rounded-xl shadow-lg border border-[#3673B4]/20 p-4 flex gap-3">
                            <div className="flex-1 relative">
                                <div className="absolute left-3 top-3 text-[#3673B4]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Scan or enter barcode..."
                                    value={barcode}
                                    onChange={e => setBarcode(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border-2 border-[#3673B4]/20 rounded-xl focus:outline-none focus:border-[#3673B4] focus:ring-2 focus:ring-[#3673B4]/20 text-sm transition-all"
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="px-6 py-3 bg-gradient-to-r from-[#3673B4] to-[#3673B4] text-white rounded-xl hover:from-[#2a5a8e] hover:to-[#2a5a8e] text-sm font-semibold shadow-md hover:shadow-xl transition-all flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Product
                            </button>
                        </form>

                        <div className="flex-1 bg-white rounded-xl shadow-lg border border-[#3673B4]/20 overflow-hidden flex flex-col">
                            <div className="bg-gradient-to-r from-[#3673B4]/10 to-[#3673B4]/10 border-b border-[#3673B4]/20 px-4 py-3">
                                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#3673B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Product List
                                </h3>
                            </div>
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="overflow-auto">
                                    <table className="w-full text-xs">
                                        <thead className="bg-gradient-to-r from-[#3673B4]/10 to-[#3673B4]/10 border-b border-[#3673B4]/20 sticky top-0">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-bold text-gray-600">S.N.</th>
                                                <th className="px-3 py-2 text-left font-bold text-gray-600">Barcode</th>
                                                <th className="px-3 py-2 text-left font-bold text-gray-600">Product Name</th>
                                                <th className="px-3 py-2 text-center font-bold text-gray-600">Qty</th>
                                                <th className="px-3 py-2 text-center font-bold text-gray-600">Free</th>
                                                <th className="px-3 py-2 text-right font-bold text-gray-600">Price</th>
                                                <th className="px-3 py-2 text-right font-bold text-gray-600">Dis.%</th>
                                                <th className="px-3 py-2 text-right font-bold text-gray-600">Dis.Amt</th>
                                                <th className="px-3 py-2 text-right font-bold text-gray-600">Amount</th>
                                                <th className="px-3 py-2 text-center font-bold text-gray-600">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#3673B4]/10">
                                            {products.map(p => (
                                                <tr key={p.id} className={`${p.barcode ? 'hover:bg-[#3673B4]/5' : 'bg-gray-50'} transition`}>
                                                    <td className="px-3 py-2 text-gray-600 font-medium">{p.id}</td>
                                                    <td className="px-3 py-2">
                                                        <input value={p.barcode} onChange={e => handleFieldChange(p.id, 'barcode', e.target.value)} className="w-full px-2 py-1 border border-[#3673B4]/20 rounded-lg text-xs focus:outline-none focus:border-[#3673B4] focus:ring-1 focus:ring-[#3673B4]/20" />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input value={p.name} onChange={e => handleFieldChange(p.id, 'name', e.target.value)} className="w-full px-2 py-1 border border-[#3673B4]/20 rounded-lg text-xs focus:outline-none focus:border-[#3673B4] focus:ring-1 focus:ring-[#3673B4]/20" />
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <input type="number" min="0" value={p.quantity} onChange={e => handleFieldChange(p.id, 'quantity', e.target.value)} className="w-16 px-2 py-1 border border-[#3673B4]/20 rounded-lg text-center text-xs focus:outline-none focus:border-[#3673B4] focus:ring-1 focus:ring-[#3673B4]/20" />
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <input type="number" min="0" value={p.free} onChange={e => handleFieldChange(p.id, 'free', e.target.value)} className="w-16 px-2 py-1 border border-[#3673B4]/20 rounded-lg text-center text-xs focus:outline-none focus:border-[#3673B4] focus:ring-1 focus:ring-[#3673B4]/20" />
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <input type="number" step="0.01" value={p.price} onChange={e => handleFieldChange(p.id, 'price', e.target.value)} className="w-20 px-2 py-1 border border-[#3673B4]/20 rounded-lg text-right text-xs focus:outline-none focus:border-[#3673B4] focus:ring-1 focus:ring-[#3673B4]/20" />
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <input type="number" step="0.01" value={p.discountPercent} onChange={e => handleFieldChange(p.id, 'discountPercent', e.target.value)} className="w-16 px-2 py-1 border border-[#3673B4]/20 rounded-lg text-right text-xs focus:outline-none focus:border-[#3673B4] focus:ring-1 focus:ring-[#3673B4]/20" />
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <input type="number" step="0.01" value={p.discountAmount} onChange={e => handleFieldChange(p.id, 'discountAmount', e.target.value)} className="w-20 px-2 py-1 border border-[#3673B4]/20 rounded-lg text-right text-xs focus:outline-none focus:border-[#3673B4] focus:ring-1 focus:ring-[#3673B4]/20" />
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-bold text-gray-700">{p.amount}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        <button onClick={() => handleRemoveProduct(p.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="bg-gradient-to-r from-[#3673B4]/10 to-[#3673B4]/10 border-t-2 border-[#3673B4]/30">
                                    <table className="w-full text-xs">
                                        <tbody>
                                            <tr className="font-bold">
                                                <td colSpan="3" className="px-3 py-3 text-gray-700 text-sm">Total Products:</td>
                                                <td className="px-3 py-3 text-center text-[#3673B4] font-bold">{totalQty}</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td className="px-3 py-3 text-right text-[#3673B4] font-bold">{totalDiscount}</td>
                                                <td className="px-3 py-3 text-right text-lg text-[#3673B4] font-bold">{totalAmount}</td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-64 flex flex-col gap-4">
                        <div className="bg-white rounded-xl shadow-lg border border-[#3673B4]/20 p-4 text-xs">
                            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-[#3673B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Actions
                            </h3>
                            <div className="space-y-2">
                                <button className="w-full py-2 bg-gradient-to-r from-[#3673B4] to-[#3673B4] text-white rounded-lg hover:from-[#2a5a8e] hover:to-[#2a5a8e] text-xs font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    Hold Transaction
                                </button>
                                <button className="w-full py-2 bg-gradient-to-r from-[#3673B4] to-[#3673B4] text-white rounded-lg hover:from-[#2a5a8e] hover:to-[#2a5a8e] text-xs font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Load from Hold
                                </button>
                                <button onClick={handleNewTransaction} className="w-full py-2 bg-gradient-to-r from-[#3673B4] to-[#3673B4] text-white rounded-lg hover:from-[#2a5a8e] hover:to-[#2a5a8e] text-xs font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Today’s Invoice List
                                </button>
                                <button className="w-full py-2 bg-gradient-to-r from-[#3673B4] to-[#3673B4] text-white rounded-lg hover:from-[#2a5a8e] hover:to-[#2a5a8e] text-xs font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    Member Ledger
                                </button>
                                <button onClick={handlePayment} className="w-full py-2.5 bg-gradient-to-r from-[#37B44A] to-[#37B44A] text-white rounded-lg hover:from-[#2d903b] hover:to-[#2d903b] text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Preview Bill
                                </button>
                                <button className="w-full py-2 bg-gradient-to-r from-[#3673B4] to-[#3673B4] text-white rounded-lg hover:from-[#2a5a8e] hover:to-[#2a5a8e] text-xs font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    My Cash
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#3673B4] to-[#3673B4] text-white rounded-xl shadow-xl p-4 text-xs">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Bhatbhateni POS
                                </h3>
                                <button onClick={() => setShowSoftwareDetails(!showSoftwareDetails)} className="text-blue-200 hover:text-white transition bg-white/10 p-1 rounded-lg backdrop-blur-sm">
                                    <svg className={`w-4 h-4 transition-transform ${showSoftwareDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 bg-white/10 px-2 py-1.5 rounded-lg backdrop-blur-sm">
                                    <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Baneshwor, Kathmandu</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-2 py-1.5 rounded-lg backdrop-blur-sm">
                                    <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span>Phone XXXXXXXXXX</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-2 py-1.5 rounded-lg backdrop-blur-sm">
                                    <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>techspireinnovation.com.np</span>
                                </div>
                            </div>
                            {showSoftwareDetails && (
                                <div className="mt-3 pt-3 border-t border-[#3673B4]/50 text-blue-100 text-xs space-y-3">
                                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                                        <strong className="block mb-1 text-white">System Requirements:</strong>
                                        <ul className="ml-3 space-y-0.5">
                                            <li>• Windows 10/11 or macOS 10.15+</li>
                                            <li>• 4GB RAM minimum</li>
                                            <li>• 2GB disk space</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                                        <strong className="block mb-1 text-white">Support:</strong>
                                        <ul className="ml-3 space-y-0.5">
                                            <li>• 24/7 Technical Support</li>
                                            <li>• Free Updates</li>
                                            <li>• Cloud Backup</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                                        <strong className="block mb-1 text-white">Features:</strong>
                                        <ul className="ml-3 space-y-0.5">
                                            <li>• Inventory Management</li>
                                            <li>• Customer Management</li>
                                            <li>• Sales Analytics</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-[#3673B4]/20 px-5 py-3 flex-shrink-0 text-xs text-gray-600">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            {[
                                ['Ctrl+S', 'For Payment', 'M12 4v16m8-8H4'],
                                ['Ctrl+B', 'For BarCode', 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4'],
                                ['Ctrl+Q', 'Qty', 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'],
                                ['ESC', 'Exit', 'M6 18L18 6M6 6l12 12']
                            ].map(([key, label, path]) => (
                                <div key={key} className="flex items-center gap-2 bg-[#3673B4]/10 px-2 py-1.5 rounded-lg">
                                    <kbd className="px-2 py-1 bg-white border-2 border-[#3673B4]/30 rounded-lg font-mono text-xs font-bold text-[#3673B4] shadow-sm">{key}</kbd>
                                    <svg className="w-3 h-3 text-[#3673B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
                                    </svg>
                                    <span className="font-medium">{label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-gray-500 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Press ESC to exit
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Screen Payment Modal with Dynamic Payment Methods */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div ref={modalRef} className="bg-white w-full h-full max-w-7xl max-h-screen flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#3673B4] via-[#3673B4] to-[#2a5a8e] text-white p-6 flex justify-between items-center shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold tracking-wide">Payment Processing</h2>
                            </div>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Left Section - Payment Information with Scroll */}
                            <div className="w-1/2 flex flex-col bg-gradient-to-br from-gray-50 to-[#3673B4]/10">
                                {/* Fixed Header with Spinner */}
                                <div className="p-8 pb-4">
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                            <p className="text-gray-500 text-xs font-medium mb-1">Bill Amount</p>
                                            <p className="text-2xl font-bold text-gray-800">{totalAmount}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                            <p className="text-gray-500 text-xs font-medium mb-1">Discount</p>
                                            <p className="text-2xl font-bold text-[#37B44A]">{totalDiscount}</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-[#3673B4] to-[#2a5a8e] rounded-xl p-4 shadow-md">
                                            <p className="text-blue-100 text-xs font-medium mb-1">Final Amount</p>
                                            <p className="text-2xl font-bold text-white">{(parseFloat(totalAmount) - parseFloat(totalDiscount)).toFixed(2)}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                            <p className="text-gray-500 text-xs font-medium mb-1">Return</p>
                                            <p className="text-2xl font-bold text-amber-600">{calculateReturnAmount()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Scrollable Content Area */}
                                <div className="flex-1 overflow-y-auto px-8 pb-4">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-gray-700 text-sm font-semibold mb-3">Payment Method</label>
                                            <div className="flex gap-2 flex-wrap">
                                                {['CASH', 'CARD', 'QR', 'CREDIT', 'BANK'].map(method => (
                                                    <button
                                                        key={method}
                                                        onClick={() => setPaymentMethod(method)}
                                                        className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${paymentMethod === method
                                                            ? 'bg-[#3673B4] text-white shadow-lg scale-105'
                                                            : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                                                            }`}
                                                    >
                                                        {method}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Payment Methods Container */}
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                            {/* Cash Payment Method */}
                                            {paymentMethod === 'CASH' && (
                                                <div className="p-5">
                                                    <label className="block text-gray-700 text-sm font-semibold mb-3">Tender Amount</label>
                                                    <input
                                                        type="number"
                                                        value={tenderAmount}
                                                        onChange={e => setTenderAmount(e.target.value)}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-right text-xl font-semibold focus:border-[#3673B4] focus:outline-none transition-colors"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            )}

                                            {/* Card Payment Method */}
                                            {paymentMethod === 'CARD' && (
                                                <div className="p-5 space-y-4">
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-semibold mb-2">Card Number</label>
                                                        <input
                                                            type="text"
                                                            value={cardNumber}
                                                            onChange={e => setCardNumber(e.target.value)}
                                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3673B4] focus:outline-none transition-colors"
                                                            placeholder="xxxx-xxxx-xxxx-xxxx"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-semibold mb-2">Expiry Date</label>
                                                            <input
                                                                type="text"
                                                                value={cardExpiry}
                                                                onChange={e => setCardExpiry(e.target.value)}
                                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3673B4] focus:outline-none transition-colors"
                                                                placeholder="MM/YY"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-semibold mb-2">CVV</label>
                                                            <input
                                                                type="text"
                                                                value={cardCvv}
                                                                onChange={e => setCardCvv(e.target.value)}
                                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3673B4] focus:outline-none transition-colors"
                                                                placeholder="xxx"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* QR Payment Method */}
                                            {paymentMethod === 'QR' && (
                                                <div className="p-5 space-y-4">
                                                    <div className="flex justify-center mb-4">
                                                        <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                                            <div className="text-gray-400 text-center">
                                                                <svg className="w-24 h-24 mb-2 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                                </svg>
                                                                <p className="text-sm font-medium">Scan QR Code</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-semibold mb-2">QR Code</label>
                                                        <input
                                                            type="text"
                                                            value={qrCode}
                                                            onChange={e => setQrCode(e.target.value)}
                                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3673B4] focus:outline-none transition-colors"
                                                            placeholder="Enter QR code"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Credit Payment Method */}
                                            {paymentMethod === 'CREDIT' && (
                                                <div className="p-5 space-y-4">
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-semibold mb-2">Credit Card Number</label>
                                                        <input
                                                            type="text"
                                                            value={creditCardNumber}
                                                            onChange={e => setCreditCardNumber(e.target.value)}
                                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3673B4] focus:outline-none transition-colors"
                                                            placeholder="xxxx-xxxx-xxxx-xxxx"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-semibold mb-2">Expiry Date</label>
                                                            <input
                                                                type="text"
                                                                value={creditCardExpiry}
                                                                onChange={e => setCreditCardExpiry(e.target.value)}
                                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3673B4] focus:outline-none transition-colors"
                                                                placeholder="MM/YY"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 text-sm font-semibold mb-2">CVV</label>
                                                            <input
                                                                type="text"
                                                                value={creditCardCvv}
                                                                onChange={e => setCreditCardCvv(e.target.value)}
                                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3673B4] focus:outline-none transition-colors"
                                                                placeholder="xxx"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Bank Payment Method */}
                                            {paymentMethod === 'BANK' && (
                                                <div className="p-5 space-y-4">
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-semibold mb-2">Bank Name</label>
                                                        <input
                                                            type="text"
                                                            value={bankName}
                                                            onChange={e => setBankName(e.target.value)}
                                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3673B4] focus:outline-none transition-colors"
                                                            placeholder="Enter bank name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-semibold mb-2">Account Number</label>
                                                        <input
                                                            type="text"
                                                            value={bankAccount}
                                                            onChange={e => setBankAccount(e.target.value)}
                                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3673B4] focus:outline-none transition-colors"
                                                            placeholder="Enter account number"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-700 text-sm font-semibold mb-2">Routing Number</label>
                                                        <input
                                                            type="text"
                                                            value={bankRouting}
                                                            onChange={e => setBankRouting(e.target.value)}
                                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#3673B4] focus:outline-none transition-colors"
                                                            placeholder="Enter routing number"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Section - Customer & Member Details */}
                            <div className="w-1/2 p-8 overflow-y-auto bg-white">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-[#3673B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Billing to
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div>
                                        <label className="block text-gray-600 text-sm font-semibold mb-2">Customer name</label>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={e => setCustomerName(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#3673B4] transition-colors"
                                            placeholder="Enter customer name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 text-sm font-semibold mb-2">VAT / PAN no</label>
                                        <input
                                            type="text"
                                            value={vatPanNo}
                                            onChange={e => setVatPanNo(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#3673B4] transition-colors"
                                            placeholder="Enter VAT/PAN number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 text-sm font-semibold mb-2">Phone No</label>
                                        <input
                                            type="text"
                                            value={phoneNo}
                                            onChange={e => setPhoneNo(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#3673B4] transition-colors"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 text-sm font-semibold mb-2">Address</label>
                                        <textarea
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#3673B4] transition-colors resize-none"
                                            rows="3"
                                            placeholder="Enter address"
                                        />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-[#3673B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                    </svg>
                                    Member Details
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-600 text-sm font-semibold mb-2">Member ID</label>
                                        <input
                                            type="text"
                                            value={memberId}
                                            onChange={e => setMemberId(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#3673B4] transition-colors"
                                            placeholder="Enter member ID"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 text-sm font-semibold mb-2">Member Name</label>
                                        <input
                                            type="text"
                                            value={memberName}
                                            onChange={e => setMemberName(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#3673B4] transition-colors"
                                            placeholder="Enter member name"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Footer */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 flex justify-between items-center border-t border-gray-200">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="px-10 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleSavePayment}
                                className="px-10 py-3 bg-gradient-to-r from-[#37B44A] to-[#37B44A] hover:from-[#2d903b] hover:to-[#2d903b] text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                SAVE PAYMENT
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MartPOS;