import React, { useState, useEffect } from 'react';
import { getAllApplications } from '../services/applicationService';
import { toast } from 'react-toastify';
import { Table, Pagination } from 'react-bootstrap';
import Loader from '../components/Loader';
import { normalizeScholarshipLink } from '../utils/scholarshipUtils';
import { FaInfoCircle } from "react-icons/fa";

const ApplicationsManagement = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchApps(page);
    }, [page]);

    const fetchApps = async (p) => {
        setLoading(true);
        try {
            const res = await getAllApplications(p, 10);
            if (res.success && res.data) {
                setApplications(res.data.content || []);
                setTotalPages(res.data.totalPages || 0);
            }
        } catch (err) {
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    if (loading && page === 0) return <Loader />;

    return (
        <div className="container-fluid py-4">

            <div className="mb-4">
                <h2 className="gradient-text fw-bold m-0">
                    View Applications
                </h2>

                <div className="admin-info-banner mt-3">
                    <FaInfoCircle className="info-icon" />
                    <div>
                        <strong>Application Monitoring Notice</strong>
                        <p className="mb-0">
                            Applications listed here are tracked through the platform for monitoring purposes.
                            Final submission and processing occur on the respective scholarship provider’s official website.
                        </p>
                    </div>
                </div>
            </div>

            <div className="modern-card p-0 overflow-hidden">

                <Table hover responsive className="table-modern align-middle m-0">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Student</th>
                            <th>CGPA</th>
                            <th>Scholarship</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Application Link</th>
                        </tr>
                    </thead>

                    <tbody>
                        {applications.map(app => (
                            <tr key={app.id}>
                                <td>APP-{app.id}</td>
                                <td className="fw-semibold">{app.student?.name}</td>
                                <td>{app.student?.cgpa}</td>
                                <td>{app.scholarship?.title}</td>
                                <td>{new Date(app.appliedDate).toLocaleDateString()}</td>

                                <td>
                                    <span className={`status-badge ${app.status.toLowerCase()}`}>
                                        {app.status}
                                    </span>
                                </td>

                                <td>
                                    {app.scholarship?.applicationLink ? (
                                        <a
                                            href={normalizeScholarshipLink(app.scholarship.applicationLink, app.scholarship?.provider)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            View External
                                        </a>
                                    ) : (
                                        <span className="text-muted">N/A</span>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {applications.length === 0 && (
                            <tr className="empty-row">
                                <td colSpan="7" className="text-center py-4">
                                    <span className="text-muted">No applications found.</span>
                                </td>
                            </tr>
                        )}
                    </tbody>

                </Table>
            </div>

            {totalPages > 1 && (
                <Pagination className="mt-4 justify-content-center pagination-modern">
                    <Pagination.Prev onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} />
                    <Pagination.Item active>{page + 1}</Pagination.Item>
                    <Pagination.Next onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} />
                </Pagination>
            )}

        </div>
    );
};

export default ApplicationsManagement;
