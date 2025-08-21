import React, { useState } from 'react';
import { Loader2, CreditCard, Smartphone, AlertTriangle } from 'lucide-react';
import { buildApiUrl, API_CONFIG } from '../lib/apiConfig';

const RazorpayPayment = ({ 
    orderData, 
    onSuccess, 
    onFailure, 
    themeStyles,
    disabled = false,
    buttonText = "Proceed to Payment"
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handlePayment = async () => {
        if (disabled || isProcessing) return;
        
        try {
            setIsProcessing(true);
            
            // Create order from backend
            const response = await fetch(buildApiUrl('django', API_CONFIG.endpoints.django.createPaymentOrder), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: orderData.totalAmount,
                    currency: 'INR',
                    receipt: `order_${Date.now()}`,
                    items: orderData.items
                })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to create payment order');
            }
            
            // Razorpay options
            const options = {
                key: result.key_id, // Test key from backend
                amount: result.order.amount,
                currency: result.order.currency,
                name: 'StoreZen',
                description: 'Smart Shopping Experience',
                order_id: result.order.id,
                handler: async function (response) {
                    // Payment successful, verify on backend
                    console.log('Payment successful from Razorpay:', response);
                    
                    try {
                        const verifyResponse = await fetch(buildApiUrl('django', API_CONFIG.endpoints.django.verifyPayment), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                signature: response.razorpay_signature,
                                items: orderData.items
                            })
                        });
                        
                        const verifyResult = await verifyResponse.json();
                        console.log('Verification result:', verifyResult);
                        
                        if (verifyResult.success) {
                            // Reset processing state before calling success
                            setIsProcessing(false);
                            onSuccess({
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                signature: response.razorpay_signature,
                                items: orderData.items,
                                verificationResult: verifyResult
                            });
                        } else {
                            setIsProcessing(false);
                            onFailure('Payment verification failed. Please contact support.');
                        }
                    } catch (verifyError) {
                        console.error('Payment verification error:', verifyError);
                        setIsProcessing(false);
                        onFailure('Payment verification failed. Please try again.');
                    }
                },
                prefill: {
                    name: orderData.customerName || 'Customer',
                    email: orderData.customerEmail || 'customer@storezen.com',
                    contact: orderData.customerPhone || '9999999999'
                },
                theme: {
                    color: '#6366f1'
                },
                modal: {
                    ondismiss: function() {
                        console.log('Payment modal dismissed');
                        setIsProcessing(false);
                        onFailure('Payment cancelled by user');
                    },
                    escape: false,
                    backdropclose: false
                }
            };
            
            const rzp = new window.Razorpay(options);
            
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed from Razorpay:', response.error);
                setIsProcessing(false);
                
                // Handle specific error cases
                let errorMessage = 'Payment failed. Please try again.';
                if (response.error.code === 'BAD_REQUEST_ERROR') {
                    errorMessage = 'Invalid payment details. Please check your card information.';
                } else if (response.error.description) {
                    errorMessage = response.error.description;
                }
                
                onFailure(errorMessage);
            });
            
            rzp.open();
            
        } catch (error) {
            console.error('Payment error:', error);
            setIsProcessing(false);
            onFailure(`Failed to initiate payment: ${error.message}`);
        }
    };

    return (
        <div className="razorpay-payment-section">
            {/* Demo Notice */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            🧪 Demo Payment Mode
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                            This is a test payment. No real money will be charged. Use the test cards provided by Razorpay.
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Test Payment Info */}
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    ✅ Test Payment Details:
                </p>
                <div className="text-xs text-green-600 dark:text-green-300 space-y-1">
                    <p><strong>✅ Card (Success):</strong> 4111 1111 1111 1111</p>
                    <p><strong>CVV:</strong> 123 | <strong>Expiry:</strong> 12/25 | <strong>OTP:</strong> Click "Skip → Successful"</p>
                    <p><strong>✅ UPI (Success):</strong> success@razorpay</p>
                    <p><strong>❌ UPI (Fail):</strong> failure@razorpay</p>
                </div>
                <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-300">
                    <p><strong>💡 Tip:</strong> For card payments, always click "Skip" and then "Successful" when prompted for OTP</p>
                </div>
            </div>

            {/* Payment Button */}
            <button
                onClick={handlePayment}
                disabled={disabled || isProcessing}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 ${
                    disabled || isProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
            >
                {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Opening Razorpay...</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center space-x-2">
                        <CreditCard className="h-6 w-6" />
                        <span>{buttonText}</span>
                    </div>
                )}
            </button>

            {/* Payment Methods Preview */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded border">
                    <CreditCard className="h-6 w-6 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                    <p className="text-xs text-blue-600 dark:text-blue-300">Cards</p>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded border">
                    <Smartphone className="h-6 w-6 mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                    <p className="text-xs text-purple-600 dark:text-purple-300">UPI</p>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded border">
                    <div className="h-6 w-6 mx-auto bg-green-600 dark:bg-green-400 rounded mb-1 flex items-center justify-center">
                        <span className="text-xs text-white font-bold">₹</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-300">Wallets</p>
                </div>
            </div>
        </div>
    );
};

export default RazorpayPayment;
