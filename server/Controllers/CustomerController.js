const UserModel = require('../Models/User');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// =============================================================================
// CUSTOMER DATA MANAGEMENT CONTROLLER
// =============================================================================

/**
 * Get all customer data for manager view
 * Returns customer profiles with all details
 */
const getAllCustomers = async (req, res) => {
    try {
        // Fetch all users (customers) from database
        // Exclude password field for security
        const customers = await UserModel.find({}, { 
            password: 0,  // Exclude password field
            __v: 0        // Exclude version field
        });

        res.status(200).json({
            success: true,
            message: 'Customer data retrieved successfully',
            data: customers,
            count: customers.length
        });

    } catch (error) {
        console.error('Error fetching customer data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer data',
            error: error.message
        });
    }
};

/**
 * Export customer data in PDF format
 * Generates a professional PDF report
 */
const exportCustomersPDF = async (req, res) => {
    try {
        // Get all customers
        const customers = await UserModel.find({}, { 
            password: 0, 
            __v: 0 
        });

        // Create PDF document
        const doc = new PDFDocument();
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="customer_data.pdf"');
        
        // Pipe the PDF document to response
        doc.pipe(res);

        // PDF Header
        doc.fontSize(20).fillColor('#1f2937').text('Customer Data Report', 50, 50);
        
        // Format date properly
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        doc.fontSize(12).fillColor('#4b5563').text(`Generated on: ${formattedDate}`, 50, 80);
        doc.fontSize(12).fillColor('#4b5563').text(`Total Customers: ${customers.length}`, 50, 100);
        
        // Add a line separator
        doc.moveTo(50, 120).lineTo(550, 120).stroke();

        let yPosition = 150;

        // Add each customer data
        customers.forEach((customer, index) => {
            // Calculate space needed for this customer (approximately)
            // Header (25) + Name (15) + Email (15) + Contact (15) + Address (15) + Promotions (15) + Registration (15) + Separator (20) = ~135 points
            const spaceNeeded = 135;
            
            // Check if we need a new page - ensure enough space for complete customer data
            if (yPosition + spaceNeeded > 750) {
                doc.addPage();
                yPosition = 50;
            }

            // Customer header
            doc.fontSize(14).fillColor('#2563eb').text(`Customer ${index + 1}`, 50, yPosition);
            yPosition += 25;

            // Customer details - Clean data and remove unwanted characters
            const cleanName = (customer.name || 'Not provided').replace(/[#]/g, '');
            const cleanEmail = (customer.email || 'Not provided').replace(/[#]/g, '');
            const cleanContact = (customer.contactNumber || 'Not provided').replace(/[#]/g, '');
            
            doc.fontSize(11).fillColor('#374151').text(`Name: ${cleanName}`, 70, yPosition);
            yPosition += 15;
            doc.fillColor('#374151').text(`Email: ${cleanEmail}`, 70, yPosition);
            yPosition += 15;
            doc.fillColor('#374151').text(`Contact: ${cleanContact}`, 70, yPosition);
            yPosition += 15;

            // Address details - Clean and organize properly
            if (customer.address) {
                const addressParts = [];
                if (customer.address.street) addressParts.push(customer.address.street.replace(/[#]/g, ''));
                if (customer.address.city) addressParts.push(customer.address.city.replace(/[#]/g, ''));
                if (customer.address.state) addressParts.push(customer.address.state.replace(/[#]/g, ''));
                if (customer.address.pincode) addressParts.push(customer.address.pincode.toString().replace(/[#]/g, ''));
                
                const addressText = addressParts.length > 0 ? addressParts.join(', ') : 'Not provided';
                doc.fillColor('#374151').text(`Address: ${addressText}`, 70, yPosition);
                yPosition += 15;
            } else {
                doc.fillColor('#374151').text(`Address: Not provided`, 70, yPosition);
                yPosition += 15;
            }

            // Preferences
            const promotions = customer.notificationPreferences?.promotions ? 'Enabled' : 'Disabled';
            doc.fillColor('#374151').text(`Promotion Notifications: ${promotions}`, 70, yPosition);
            yPosition += 15;
            
            // Registration date if available
            if (customer.createdAt) {
                const regDate = new Date(customer.createdAt).toLocaleDateString('en-US');
                doc.fillColor('#374151').text(`Registered: ${regDate}`, 70, yPosition);
                yPosition += 15;
            }
            
            yPosition += 10;

            // Add separator line
            doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
            yPosition += 20;
        });

        // Finalize the PDF
        doc.end();

    } catch (error) {
        console.error('Error exporting PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export PDF',
            error: error.message
        });
    }
};

/**
 * Export customer data in Excel format
 * Generates an Excel spreadsheet
 */
const exportCustomersExcel = async (req, res) => {
    try {
        // Get all customers
        const customers = await UserModel.find({}, { 
            password: 0, 
            __v: 0 
        });

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Customer Data');

        // Define columns
        worksheet.columns = [
            { header: 'S.No', key: 'sno', width: 8 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Contact Number', key: 'contact', width: 15 },
            { header: 'Street', key: 'street', width: 20 },
            { header: 'City', key: 'city', width: 15 },
            { header: 'State', key: 'state', width: 15 },
            { header: 'Pincode', key: 'pincode', width: 10 },
            { header: 'Promotions', key: 'promotions', width: 12 }
        ];

        // Style the header row
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FF1f2937' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE5E7EB' }
        };

        // Add customer data
        customers.forEach((customer, index) => {
            worksheet.addRow({
                sno: index + 1,
                name: customer.name,
                email: customer.email,
                contact: customer.contactNumber || 'Not provided',
                street: customer.address?.street || '',
                city: customer.address?.city || '',
                state: customer.address?.state || '',
                pincode: customer.address?.pincode || '',
                promotions: customer.notificationPreferences?.promotions ? 'Enabled' : 'Disabled'
            });
        });

        // Add borders to all cells
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Set response headers for Excel download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="customer_data.xlsx"');

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error exporting Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export Excel',
            error: error.message
        });
    }
};

module.exports = {
    getAllCustomers,
    exportCustomersPDF,
    exportCustomersExcel
};
