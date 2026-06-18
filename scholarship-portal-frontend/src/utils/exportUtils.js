import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export Utilities for Data Export functionality
 * Supports CSV and PDF exports
 */

/**
 * Export data to CSV format
 */
export const exportToCSV = (data, filename = 'export.csv', headers = null) => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    // Generate headers from first object keys if not provided
    const csvHeaders = headers || Object.keys(data[0]);
    
    // Convert data to CSV format
    const csvContent = [
        csvHeaders.join(','), // Header row
        ...data.map(row => 
            csvHeaders.map(header => {
                let cell = row[header] || '';
                // Handle nested objects
                if (typeof cell === 'object' && cell !== null) {
                    cell = JSON.stringify(cell);
                }
                // Escape commas and quotes
                cell = String(cell).replace(/"/g, '""');
                return `"${cell}"`;
            }).join(',')
        )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Export scholarships to CSV
 */
export const exportScholarshipsToCSV = (scholarships) => {
    const data = scholarships.map(s => ({
        'Title': s.title,
        'Provider': s.provider,
        'Category': s.category,
        'Amount': s.amount,
        'Deadline': new Date(s.deadline).toLocaleDateString(),
        'Min CGPA': s.minCgpa || 'N/A',
        'Max Income': s.maxIncome || 'N/A',
        'Awards': s.awardCount || 'N/A',
        'Application Link': s.applicationLink || 'N/A'
    }));
    
    exportToCSV(data, `scholarships_${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Export applications to CSV
 */
export const exportApplicationsToCSV = (applications) => {
    const data = applications.map(app => ({
        'Scholarship': app.scholarship?.title || 'Unknown',
        'Provider': app.scholarship?.provider || 'N/A',
        'Amount': app.scholarship?.amount || 'N/A',
        'Status': app.status,
        'Applied On': new Date(app.appliedAt).toLocaleDateString(),
        'Deadline': app.scholarship?.deadline ? new Date(app.scholarship.deadline).toLocaleDateString() : 'N/A',
        'Category': app.scholarship?.category || 'N/A'
    }));
    
    exportToCSV(data, `my_applications_${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Export data to PDF format
 */
export const exportToPDF = (data, filename = 'export.pdf', title = 'Report', headers = null) => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    
    // Prepare table data
    const tableHeaders = headers || Object.keys(data[0]);
    const tableData = data.map(row => 
        tableHeaders.map(header => {
            let cell = row[header] || '';
            if (typeof cell === 'object' && cell !== null) {
                cell = JSON.stringify(cell);
            }
            return String(cell);
        })
    );
    
    // Add table
    doc.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: 35,
        theme: 'grid',
        styles: { 
            fontSize: 8,
            cellPadding: 3
        },
        headStyles: {
            fillColor: [102, 126, 234],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        }
    });
    
    // Save the PDF
    doc.save(filename);
};

/**
 * Export scholarships to PDF
 */
export const exportScholarshipsToPDF = (scholarships) => {
    const data = scholarships.map(s => ({
        'Title': s.title,
        'Provider': s.provider,
        'Amount': `₹${parseInt(s.amount).toLocaleString()}`,
        'Deadline': new Date(s.deadline).toLocaleDateString(),
        'Category': s.category,
        'Min CGPA': s.minCgpa || 'N/A',
    }));
    
    exportToPDF(
        data, 
        `scholarships_${new Date().toISOString().split('T')[0]}.pdf`,
        'Scholarships Report'
    );
};

/**
 * Export applications to PDF
 */
export const exportApplicationsToPDF = (applications) => {
    const data = applications.map(app => ({
        'Scholarship': app.scholarship?.title || 'Unknown',
        'Amount': app.scholarship?.amount ? `₹${parseInt(app.scholarship.amount).toLocaleString()}` : 'N/A',
        'Status': app.status,
        'Applied On': new Date(app.appliedAt).toLocaleDateString(),
        'Deadline': app.scholarship?.deadline ? new Date(app.scholarship.deadline).toLocaleDateString() : 'N/A'
    }));
    
    exportToPDF(
        data,
        `my_applications_${new Date().toISOString().split('T')[0]}.pdf`,
        'My Applications Report'
    );
};

/**
 * Export comparison data to PDF
 */
export const exportComparisonToPDF = (scholarships) => {
    const data = scholarships.map(s => ({
        'Title': s.title,
        'Amount': `₹${parseInt(s.amount).toLocaleString()}`,
        'Provider': s.provider,
        'Category': s.category,
        'Deadline': new Date(s.deadline).toLocaleDateString(),
        'Min CGPA': s.minCgpa || 'N/A',
        'Max Income': s.maxIncome ? `₹${parseInt(s.maxIncome).toLocaleString()}` : 'N/A'
    }));
    
    exportToPDF(
        data,
        `scholarship_comparison_${new Date().toISOString().split('T')[0]}.pdf`,
        'Scholarship Comparison'
    );
};

/**
 * Export notifications to CSV
 */
export const exportNotificationsToCSV = (notifications) => {
    const data = notifications.map(n => ({
        'Message': n.message,
        'Type': n.type || n.notificationType,
        'Created': new Date(n.createdAt).toLocaleString(),
        'Read': n.isRead ? 'Yes' : 'No',
        'Scholarship': n.scholarship?.title || 'N/A'
    }));
    
    exportToCSV(data, `notifications_${new Date().toISOString().split('T')[0]}.csv`);
};
